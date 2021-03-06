import cron from 'node-cron';
import { ClockInModel } from "../models/clockInModel";
import { EmployeeModel } from '../models/employeeModel';
import { LeavesModel, LeaveType } from '../models/leavesModel';
import { PenaltyModel } from "../models/penaltiesModel";
import { HolidayModel } from "../models/holidayModel";
import { PaymentPeriod } from "../models/rolesModel";
import { DateTime } from "luxon";
import { compileReport, updateReport } from "../controllers/reportController";
import { ReportModel } from "../models/reportModel";
import { UserModel } from '../models/userModel';

// change timestamp back to 00:00:00 in production, now running once per 10 seconds for testing purposes
let timeToRun = '0 0 0 * * *';
// timeToRun = '*/10 * * * * *'
let task = cron.schedule(timeToRun, async () => {
    // This can use some logging

    // 1 - clock out all employees who haven't
    try {
        await ClockInModel.updateMany(
            { clockedOut: { $exists: false } }, 
            { clockedOut: DateTime.now() }
        );
    } catch (error) { logError('ClockInModel.updateMany()'); }

    // 2 - check for employee's payments due
    try {
        let employees = await EmployeeModel.aggregate([
            { $match: {
                $or: [
                    { resignDate: null },
                    { resignDate: { $gt: DateTime.now().endOf('day') } }
                ]
            } },
            { $lookup: {
                from: "salaries",
                let: { eid: "$_id" },
                pipeline: [
                    { $match: 
                        { $expr: 
                            { $eq: [ "$employeeID", "$$eid" ] } 
                        } 
                    },
                    { $sort: { employeeID: 1, payday: 1 } },
                    { $group: { 
                        _id: "$employeeID", 
                        lastPayday: { $last: "$payday" } 
                    } }
                ],
                as: "lastPay"
            } },
            { $lookup: {
                from: "users",
                let: { roleID: "$roleID" },
                pipeline: [
                    { $unwind: "$company.roles" },
                    { $match: 
                        { $expr: 
                            { $eq: [ "$company.roles._id", "$$roleID" ] }
                        }
                    },
                    { $replaceRoot: {
                        newRoot: "$company.roles"
                    } }
                ],
                as: "role"
            } },
            { $unwind: "$role" }
        ]);
        let updateIDs: string[] = [];

        employees.forEach((e) => {
            let finalPayday: DateTime = DateTime.fromMillis((e.startDate as Date).getTime());
            if (e.lastPay.length) finalPayday = DateTime.fromJSDate(e.lastPay[0].lastPayday);

            if (e.role.paymentPeriod === PaymentPeriod.Monthly) {
                if (finalPayday
                        .plus({ months: 1 })
                        .diffNow('days')
                        .days <= 0)
                    updateIDs.push(e._id);
            }
            else if (e.role.paymentPeriod === PaymentPeriod.Hourly) {
                if (finalPayday
                        .plus({ days: 15 })
                        .diffNow('days')
                        .days <= 0)
                    updateIDs.push(e._id);
            }
        });

        await EmployeeModel.updateMany({
            _id: { $in: updateIDs }
        }, {
            $set: { paymentDue: true }
        });
        console.log(`${DateTime.now().toLocaleString()} is payday for ${updateIDs.length} employees, marked as payment due.`);
    } catch (error) { logError('various functions', 'checking payments due', error); }

    // 3 - check if passed day is a holiday
    let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0,0,0,0);
    try {
        let holidays = await HolidayModel.find({
            $or: [
                { $and: [
                    { startDate: { $lte: yesterday } },
                    { $expr: {
                        $gt: [
                            { $dateAdd: { 
                                startDate: '$startDate', 
                                unit: 'day', 
                                amount: '$numberOfDaysOff' 
                            } },
                            yesterday
                        ]
                    } }
                ]},
                { $and: [
                    { $expr: { 
                        $eq: [
                            '$startDate',
                            { $dateFromParts : {
                                year: { $year: '$startDate' }, 
                                month: yesterday.getMonth() + 1, 
                                day: yesterday.getDate(),
                                timezone: '+0700'
                            } }
                        ]
                    } },
                    { repeatYearly: true }
                ] }
            ]
        });
        if (holidays.length) {
            console.log(`${yesterday.toLocaleDateString()} is part of a holiday, no absent check will be performed. Holidays details:`);
            console.log(holidays);
            compileMonthlyReport();
            return;
        }
    } catch (error) { logError('HolidayModel.find()', 'Holiday check', error); }

    // 4 - add penalties for all absent employees in case today isn't a holiday
    try {
        let attendantIDs = await ClockInModel.aggregate([
            { $match: { 
                clockedIn: { $gt: yesterday }
             } },
            { $group: { _id: '$employeeID' } },
            { $project: { _id: true } }
        ]);
        let absentees = await EmployeeModel.find({
            $and: [
                { _id: { $nin: attendantIDs } },
                { $or: [
                    { resignDate: null },
                    { resignDate: { $gt: DateTime.now().endOf('day') } }
                ] }
            ]
        });
        
        yesterday.setHours(23, 59, 0); // so that penalty.occurredAt will be at 23:59:00 yesterday
        console.log(`${yesterday.toLocaleDateString()} absent penalty list: [`);
        for (let employee of absentees) {
            let leaves = await LeavesModel.find({
                $and: [
                    {
                        employeeID: employee.id,
                        leaveType: { $ne: LeaveType.Unpaid },
                        startDate: { $lte: yesterday },
                    },
                    { $expr: {
                        $gt: [
                            { $dateAdd: { 
                                startDate: '$startDate', 
                                unit: 'day', 
                                amount: '$numberOfDays' 
                            } },
                            yesterday
                        ]
                    } }
                ]
            });
            if (leaves.length) continue;

            let pen = new PenaltyModel({
                type: 'Absent',
                employeeID: employee.id,
                occurredAt: yesterday
            });
            // ---UNCOMMENT IN PRODUCTION---
            // await pen.save();
            console.log(pen);
        }
        console.log(']');
    } catch (error) { logError('various functions', 'processing absence penalty', error); }

    // 5 - update monthly report on clock in/out
    compileMonthlyReport();
});

export async function compileMonthlyReport() {
    let currentReport = await ReportModel.findOne({
        compileDate: { $lte: DateTime.now() },
        compiledUpTo: { $gte: DateTime.now() }
    });
    if (currentReport) {
        await updateReport(currentReport.id);
    }
    else {
        let companies = 
            await UserModel
                .find({})
                .select("-_id company._id");
        for (let company of companies) {
            let report = await compileReport(company.company._id!.toString());
            let repModel = new ReportModel(report);
            await repModel.save();
            // console.log(repModel.toJSON());
        }
    }
}

function logError(fn?: string, phase?: string, error?: any): void {
    let phaseDesc = phase ? ` during ${phase}` : '';
    let fnDesc = fn ? ` while executing ${fn}` : '';
    console.log(`Error occurred` + fnDesc + phaseDesc + '. Details:');
    console.log(error);
}

export default task;
import cron from 'node-cron';
import { ClockInModel } from "../models/clockInModel";
import { EmployeeModel } from '../models/employeeModel';
import { LeavesModel, LeaveType } from '../models/leavesModel';
import { PenaltyModel } from "../models/penaltiesModel";
import { HolidayModel } from "../models/holidayModel";

// change timestamp back to 00:00:00 in production, now running once per 10 seconds for testing purposes
let task = cron.schedule('0 0 0 * * *', async () => {
    // This can use some logging

    // 1 - clock out all employees who haven't
    try {
        await ClockInModel.updateMany(
            { clockedOut: { $exists: false } }, 
            { clockedOut: new Date() }
        );
    } catch (error) { logError('ClockInModel.updateMany()'); }

    // 2 - add penalties for all absent employees
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
            compileClockInReport();
            return;
        }
    } catch (error) { logError('HolidayModel.find()', 'Holiday check', error); }

    try {
        let attendantIDs = await ClockInModel.aggregate([
            { $match: { 
                clockedIn: { $gt: yesterday }
             } },
            { $group: { _id: '$employeeID' } },
            { $project: { _id: true } }
        ]);
        let absentees = await EmployeeModel.find({
            _id: { $nin: attendantIDs }
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

    // 3 - update monthly report on clock in/out
    compileClockInReport();
});

function compileClockInReport() {
    // compile monthly clock in reports
    //
}

function logError(fn?: string, phase?: string, error?: any): void {
    let phaseDesc = phase ? ` during ${phase}` : '';
    let fnDesc = fn ? ` while executing ${fn}` : '';
    console.log(`Error occurred` + fnDesc + phaseDesc + '. Details:');
    console.log(error);
}

export default task;
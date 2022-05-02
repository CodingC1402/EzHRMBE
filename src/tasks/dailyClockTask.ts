import cron from 'node-cron';
import { ClockInModel } from "../models/clockInModel";
import { EmployeeModel } from '../models/employeeModel';
import { LeavesModel, LeaveType } from '../models/leavesModel';
import { PenaltyModel } from "../models/penaltiesModel";

let task = cron.schedule('*/10 * * * * *' /* '0 0 0 * * *' */, async () => {
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
        // ---THIS IS FOR WHEN HOLIDAY HAS BEEN MERGED---
        
        // let holidays = await ClockInModel.find({
        //     $or: [{
        //         $and: [
        //             { startDate: { $lte: yesterday } },
        //             { $expr: {
        //                 $gt: [
        //                     { $dateAdd: { 
        //                         startDate: '$startDate', 
        //                         unit: 'day', 
        //                         amount: '$numOfDays' 
        //                     } },
        //                     yesterday
        //                 ]
        //             } }
        //         ]},
        //         {
        //             startDate: { 
        //                 $expr: { 
        //                     $eq: new Date(yesterday).setFullYear(
        //                         { $year: { date: '$startDate' } } as unknown as number
        //                     ) 
        //                 } 
        //             },
        //             repeatYearly: true
        //         }
        //     ]
        // });
        // if (holidays) {
        //     console.log(`${new Date().toLocaleDateString()} is part of a holiday, no absent check will be performed.`);
        //     return;
        // }

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
        console.log(`${new Date().toLocaleDateString()} absent penalty list: [`);
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
    } catch (error) { logError('function', 'processing absense penalty'); }

    // 3 - update monthly report on clock in/out

});

function logError(fn?: string, phase?: string): void {
    let phaseDesc = phase ? ` during ${phase}` : '';
    let fnDesc = fn ? ` while executing ${fn}` : '';
    console.log(`Error occurred` + fnDesc + phaseDesc + '.');
}

export default task;
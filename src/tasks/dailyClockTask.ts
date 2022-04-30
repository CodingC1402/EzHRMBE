import cron from 'node-cron';
import { ClockInModel } from "../models/clockInModel";
import { EmployeeModel } from '../models/employeeModel';
import { PenaltyModel } from "../models/penaltiesModel";

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
        let attendants = await ClockInModel.aggregate([
            { $match: { 
                clockedIn: { $gt: yesterday }
             } },
            { $group: { _id: '$employeeID' } },
            { $project: { _id: true } }
        ]);
        let absentees = await EmployeeModel.find({
            _id: { $nin: attendants }
        });
        
        yesterday.setHours(23, 59, 0);
        console.log(`${new Date().toLocaleDateString()} absent penalty list: [`);
        absentees.forEach(async (employee) => {
            let pen = new PenaltyModel({
                type: 'Absent',
                employeeID: employee.id,
                occurredAt: yesterday
            });
            // await pen.save();
            console.log(pen);
        });
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
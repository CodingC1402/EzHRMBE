import express from "express";
import ClockInController from "../controllers/clockInController";

let clockInRouter = express.Router();

const GET_BY_COMID_PATH: string = "/comid/:comid";
const GET_BY_EMPID_PATH: string = "/empid/:empid";
const GET_BY_WOKID_PATH: string = "/comid/:compid/empid/:empid";
const UPDATE_BY_ID_PATH: string = "/:id";

clockInRouter.post('/', ClockInController.createClockIn);
clockInRouter.put(UPDATE_BY_ID_PATH, ClockInController.updateClockIn);

clockInRouter.get(GET_BY_COMID_PATH, ClockInController.getAllClockInsByCompanyID);
clockInRouter.get(GET_BY_EMPID_PATH, ClockInController.getAllClockInsByEmployeeID);
clockInRouter.get(GET_BY_WOKID_PATH, ClockInController.getAllClockInsByEmployeeWorkID);

export default clockInRouter;
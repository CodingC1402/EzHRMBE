import express from "express";
import ClockInController from "../controllers/clockInController";

let router = express.Router();

const GET_BY_COMID_PATH: string = "/comid/:comid";
const GET_BY_EMPID_PATH: string = "/empid/:empid";
const GET_BY_WOKID_PATH: string = "/comid/:compid/wokid/:wokid";

const UPDATE_BY_ID_PATH: string = "/empid/:empid";
const DELETE_PATH: string = "/empid/:empid";

router.post('/', ClockInController.createClockIn);
router.put(UPDATE_BY_ID_PATH, ClockInController.updateClockIn);

router.get(GET_BY_COMID_PATH, ClockInController.getAllClockInsByCompanyID);
router.get(GET_BY_EMPID_PATH, ClockInController.getAllClockInsByEmployeeID);
router.get(GET_BY_WOKID_PATH, ClockInController.getAllClockInsByEmployeeWorkID);

router.delete(DELETE_PATH, ClockInController.deleteClockIn);

export default router;
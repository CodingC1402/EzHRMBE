import express from "express";
import ClockInController from "../controllers/clockInController";

let router = express.Router();

const GET_BY_COMID_PATH: string = "/comid/:comid";
const GET_BY_EMPID_PATH: string = "/empid/:empid";
const GET_BY_WOKID_PATH: string = "/comid/:comid/wokid/:wokid";

const GET_BY_EMPID_DATE_RANGE_PATH: string = "/date/empid/:empid";
const GET_BY_WOKID_DATE_RANGE_PATH: string = "/date/comid/:comid/wokid/:wokid";

const UPDATE_BY_ID_PATH: string = "/empid/:empid";
const DELETE_PATH: string = "/empid/:empid";

router.post('/', ClockInController.createClockIn);
router.put(UPDATE_BY_ID_PATH, ClockInController.updateClockIn);

router.get(GET_BY_COMID_PATH, ClockInController.getAllClockInsByCompanyID);
router.get(GET_BY_EMPID_PATH, ClockInController.getAllClockInsByEmployeeID);
router.get(GET_BY_WOKID_PATH, ClockInController.getAllClockInsByEmployeeWorkID);

router.get(GET_BY_EMPID_DATE_RANGE_PATH, ClockInController.getClockInsByEmployeeIDInDateRange);
router.get(GET_BY_WOKID_DATE_RANGE_PATH, ClockInController.getClockInsByEmployeeWorkIDInDateRange);

router.delete(DELETE_PATH, ClockInController.deleteClockIn);

export default router;
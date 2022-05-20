import express from "express";
import ClockInController from "../controllers/clockInController";

let router = express.Router();

const GET_BY_COMPID_PATH: string = "/";
const GET_BY_EMPID_PATH: string = "/:empid";
const GET_BY_WORKID_PATH: string = "/workid/:workid";
const GET_ACCM_WORK_HOURS_BY_EMPID_PATH: string = "/accm-work-hours/:empid";

const UPDATE_PATH: string = "/:empid";
const DELETE_PATH: string = "/:empid";
const CREATE_PATH: string = "/";

router.post(CREATE_PATH, ClockInController.createClockIn);
router.put(UPDATE_PATH, ClockInController.updateClockIn);

router.get(GET_BY_COMPID_PATH, ClockInController.getAllClockInsByCompanyID);
router.get(GET_BY_EMPID_PATH, ClockInController.getAllClockInsByEmployeeID);
router.get(GET_BY_WORKID_PATH, ClockInController.getAllClockInsByEmployeeWorkID);
router.get(GET_ACCM_WORK_HOURS_BY_EMPID_PATH, ClockInController.getAccumulatedWorkHoursByEmployeeID);

router.delete(DELETE_PATH, ClockInController.deleteClockIn);

export default router;
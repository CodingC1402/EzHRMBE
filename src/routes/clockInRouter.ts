import express from "express";
import ClockInController from "../controllers/clockInController";

let router = express.Router();

const GET_BY_OBJID_PATH: string = "/id/:empid";
const GET_BY_WORKID_PATH: string = "/comp/:compid/:workid";
const GET_BY_COMPID_PATH: string = "/comp/:compid";

const UPDATE_BY_ID_PATH: string = "/id/:empid";
const DELETE_PATH: string = "/id/:empid";

router.post('/', ClockInController.createClockIn);
router.put(UPDATE_BY_ID_PATH, ClockInController.updateClockIn);

router.get(GET_BY_OBJID_PATH, ClockInController.getAllClockInsByEmployeeID);
router.get(GET_BY_WORKID_PATH, ClockInController.getAllClockInsByEmployeeWorkID);
router.get(GET_BY_COMPID_PATH, ClockInController.getAllClockInsByCompanyID);

router.delete(DELETE_PATH, ClockInController.deleteClockIn);

export default router;
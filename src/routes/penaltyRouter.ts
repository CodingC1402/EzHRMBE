import express from "express";
import PenaltyController from "../controllers/penaltyController";

const router = express.Router();

const GET_BY_COMID_PATH: string = "/comid/:comid";
const GET_BY_EMPID_PATH: string = "/empid/:empid";
const GET_BY_WOKID_PATH: string = "/comid/:comid/wokid/:wokid";

const UPDATE_PATH: string = "/:id";
const DELETE_PATH: string = "/:id";

router.get(GET_BY_COMID_PATH, PenaltyController.getAllPenaltiesByCompanyID);
router.get(GET_BY_EMPID_PATH, PenaltyController.getAllPenaltiesByEmployeeID);
router.get(GET_BY_WOKID_PATH, PenaltyController.getAllPenaltiesByEmployeeWorkID);

router.post('/', PenaltyController.createPenalty);
router.put(UPDATE_PATH, PenaltyController.updatePenalty);
router.delete(DELETE_PATH, PenaltyController.deletePenalty);

export default router;
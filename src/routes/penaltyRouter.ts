import express from "express";
import PenaltyController from "../controllers/penaltyController";

const router = express.Router();

const GET_BY_OBJID_PATH: string = "/id/:id";
const GET_BY_WORKID_PATH: string = "/comp/:compid/:workid";
const GET_BY_COMPID_PATH: string = "/comp/:compid";

const UPDATE_PATH: string = "/:id";
const DELETE_PATH: string = "/:id";

router.get(GET_BY_COMPID_PATH, PenaltyController.getAllPenaltiesByCompanyID);
router.get(GET_BY_OBJID_PATH, PenaltyController.getAllPenaltiesByEmployeeID);
router.get(GET_BY_WORKID_PATH, PenaltyController.getAllPenaltiesByEmployeeWorkID);

router.post('/', PenaltyController.createPenalty);
router.put(UPDATE_PATH, PenaltyController.updatePenalty);
router.delete(DELETE_PATH, PenaltyController.deletePenalty);

export default router;
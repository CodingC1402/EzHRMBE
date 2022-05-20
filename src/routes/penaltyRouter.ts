import express from "express";
import PenaltyController from "../controllers/penaltyController";

const router = express.Router();

const GET_BY_COMPID_PATH: string = "/";
const GET_BY_EMPID_PATH: string = "/:empid";
const GET_BY_WORKID_PATH: string = "/workid/:workid";
const GET_ACCM_DEDUCTION_BY_EMPID_PATH: string = "/accm-deduction/:empid";

const CREATE_PATH: string = "/";
const UPDATE_PATH: string = "/:id";
const DELETE_PATH: string = "/:id";

router.get(GET_BY_COMPID_PATH, PenaltyController.getAllPenaltiesByCompanyID);
router.get(GET_BY_EMPID_PATH, PenaltyController.getAllPenaltiesByEmployeeID);
router.get(GET_BY_WORKID_PATH, PenaltyController.getAllPenaltiesByEmployeeWorkID);
router.get(GET_ACCM_DEDUCTION_BY_EMPID_PATH, PenaltyController.getAccumulatedDeductionByEmployeeID);

router.post(CREATE_PATH, PenaltyController.createPenalty);
router.put(UPDATE_PATH, PenaltyController.updatePenalty);
router.delete(DELETE_PATH, PenaltyController.deletePenalty);

export default router;
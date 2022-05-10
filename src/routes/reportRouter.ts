import express from "express";
import ReportController from "../controllers/reportController";

const GET_BY_COMPID_PATH: string = "/comp/:compid";

const CREATE_PATH: string = "/:compid";
const UPDATE_PATH: string = "/:id";
const DELETE_PATH: string = "/:id";

const router = express.Router();

router.get(GET_BY_COMPID_PATH, ReportController.getAllReportsByCompanyID);
router.post(CREATE_PATH, ReportController.createReport);
router.put(UPDATE_PATH, ReportController.updateReport);
router.delete(DELETE_PATH, ReportController.deleteReport);

export default router;
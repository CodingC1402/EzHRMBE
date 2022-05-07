import express from "express";
import SalaryController from "../controllers/salaryController";

const router = express.Router();

const GET_BY_EMPID_PATH: string = "/id/:empid";
const GET_BY_WORKID_PATH: string = "/comp/:compid/:workid";

const CREATE_PATH: string = "/";
const UPDATE_PATH: string = "/:id";
const DELETE_PATH: string = "/:id";

router.get(GET_BY_EMPID_PATH, SalaryController.getSalariesByEmployeeID);
router.get(GET_BY_WORKID_PATH, SalaryController.getSalariesByEmployeeWorkID);

router.post(CREATE_PATH, SalaryController.createSalary);
router.put(UPDATE_PATH, SalaryController.updateSalary);
router.delete(DELETE_PATH, SalaryController.deleteSalary);

export default router;
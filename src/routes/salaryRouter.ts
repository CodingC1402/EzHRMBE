import express from "express";
import SalaryController from "../controllers/salaryController";

const router = express.Router();

const GET_BY_COMPID_PATH: string = "/";
const GET_BY_EMPID_PATH: string = "/:empid";
const GET_BY_WORKID_PATH: string = "/workid/:workid";

const CREATE_PATH: string = "/";
const UPDATE_PATH: string = "/:id";
const DELETE_PATH: string = "/:id";

router.get(GET_BY_EMPID_PATH, SalaryController.getSalariesByEmployeeID);
router.get(GET_BY_WORKID_PATH, SalaryController.getSalariesByEmployeeWorkID);
router.get(GET_BY_COMPID_PATH, SalaryController.getSalariesByCompanyID);

router.post(CREATE_PATH, SalaryController.createSalary);
router.put(UPDATE_PATH, SalaryController.updateSalary);
router.delete(DELETE_PATH, SalaryController.deleteSalary);

export default router;
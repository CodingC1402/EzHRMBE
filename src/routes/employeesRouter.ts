import express from 'express';
import SessionAuthentication from '../security/session';
import Status from '../configurations/status';
import responseMessage from '../utils/responseError';
import EmployeeController from '../controllers/employeesController';

export const UPDATE_PATH: string = "/update/:id";
export const DELETE_PATH: string = "/:id"
export const GET_DETAILS_PATH: string = "/:id/details";
export const CREATE_PATH: string = "/create";
export const GET_ALL_PATH: string = "/all";
export const GET_ALL_PATH_DETAILS: string = "/all/details";

const router = express.Router();

router.get(GET_ALL_PATH_DETAILS, )
router.get(GET_ALL_PATH, EmployeeController.getAllEmployees);
router.get(GET_DETAILS_PATH, EmployeeController.getEmployeeDetail);

router.put(UPDATE_PATH, EmployeeController.updateEmployee);
router.delete(DELETE_PATH, EmployeeController.deleteEmployee);

router.post(CREATE_PATH, EmployeeController.createEmployee);

const employeesRouter = router;
export default employeesRouter;
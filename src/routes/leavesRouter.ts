import express from 'express';
import LeavesController from '../controllers/leavesController';

// This is is the employeeID
export const GET_PATH: string = "/:id"
export const UPDATE_PATH: string = "/:id";
export const DELETE_PATH: string = "/:id"
export const CREATE_PATH: string = "/create";

const router = express.Router();

router.get(GET_PATH, LeavesController.getAllLeavesOfEmployee);
router.post(CREATE_PATH, LeavesController.create);
router.delete(DELETE_PATH, LeavesController.delete);
router.put(UPDATE_PATH, LeavesController.update);

const leavesRouter = router;
export default leavesRouter;


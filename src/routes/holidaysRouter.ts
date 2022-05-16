import express from "express";
import HolidayController from "../controllers/holidaysController";

export const UPDATE_PATH: string = "/:id";
export const DELETE_PATH: string = "/:id";
export const GET_PATH: string = "/:id";
export const GET_ALL_PATH: string = "/all";
export const CREATE_PATH: string = "/create";

let router = express.Router();
router.get(GET_ALL_PATH, HolidayController.getAllHolidays);
router.get(GET_PATH, HolidayController.getHolidayById);

router.put(UPDATE_PATH, HolidayController.updateHoliday);
router.delete(DELETE_PATH, HolidayController.deleteHoliday);

router.post(CREATE_PATH, HolidayController.createHoliday);

const holidaysRouter = router;
export default holidaysRouter;

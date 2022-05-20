import express from 'express';
import UserController from '../controllers/userController';

const router = express.Router();

const UPDATE_COMPANY_INFO_PATH: string = "/:id";
const UPDATE_RULES_PATH: string = "/:id/rules";
const CREATE_PEN_TYPE_PATH: string = "/:id/penalty-types";
const DELETE_PEN_TYPE_PATH: string = "/:id/penalty-types/:penalty";

router.put(UPDATE_COMPANY_INFO_PATH, UserController.updateCompanyInfo);
router.put(UPDATE_RULES_PATH, UserController.updateCompanyRule);
router.post(CREATE_PEN_TYPE_PATH, UserController.createPenaltyType);
router.delete(DELETE_PEN_TYPE_PATH, UserController.deletePenaltyType);

export default router;
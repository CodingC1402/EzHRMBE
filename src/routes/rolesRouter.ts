import express from "express";
import RolesController from "../controllers/rolesController";
export const UPDATE_PATH: string = "/:id";
export const DELETE_PATH: string = "/:id";
export const GET_PATH: string = "/:id";
export const GET_ALL_PATH: string = "/all";
export const CREATE_PATH: string = "/create";

let router = express.Router();
router.get(GET_ALL_PATH, RolesController.getAllRoles);
router.get(GET_PATH, RolesController.getRoleById);

router.put(UPDATE_PATH, RolesController.updateRole);
router.delete(DELETE_PATH, RolesController.deleteRole);

router.post(CREATE_PATH, RolesController.createRole);

const rolesRouter = router;
export default rolesRouter;

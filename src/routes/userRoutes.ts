import express from "express";
import UserController from "../controllers/userController";
import validators from "../middleware/validators";

const router = express.Router();

router.get("/users", UserController.getUsers);
router.get("/users/:id", UserController.getUser);
router.put(
  "/users/:id",
  validators.updateProfileValidation,
  UserController.updateProfile
);
router.delete("/users/:id", UserController.deleteUser);
router.post("/users/delete", UserController.deleteUsers)
router.post(
  "/user/create",
  validators.createUserValidation,
  UserController.createUser
);

export default router;

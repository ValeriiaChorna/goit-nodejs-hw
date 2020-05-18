import { Router } from "express";
import { authController } from "./auth.controller";
import { validations } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validations.validateRegisterContact,
  authController.registerContact
);
router.post(
  "/login",
  validations.validateLogInContact,
  authController.logInContact
);

export const authRouter = router;

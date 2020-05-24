import { Router } from "express";
import { authController } from "./auth.controller";
import { authValidations } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  authValidations.validateRegisterContact,
  authController.registerContact
);
router.post(
  "/login",
  authValidations.validateLogInContact,
  authController.logInContact
);

router.post("/logout", authController.authorize, authController.logOutContact);

export const authRouter = router;

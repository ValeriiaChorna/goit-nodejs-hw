import { Router } from "express";
import { contactsController } from "./contacts.controller";
import { authController } from "../auth/auth.controller";
import { upload, compressImage } from "./upload.avatar.middleware";
import { contactValidations } from "./contact.validation";

const router = Router();

router.get("/", authController.authorize, contactsController.getListContacts);

router.get(
  "/current",
  authController.authorize,
  contactsController.getCurrentContact
);

router.get(
  "/:contactId",
  authController.authorize,
  contactsController.getContactById
);

router.delete(
  "/:contactId",
  authController.authorize,
  contactsController.deleteContact
);
router.put(
  "/:contactId",
  authController.authorize,
  contactValidations.validateUpdateContact,
  contactsController.updateContact
);

router.patch(
  "/avatars",
  authController.authorize,
  upload.single("avatar"),
  compressImage,
  contactValidations.validateUpdateAllContactFields,
  contactsController.updateAllContactFields
  // (req, res, next) => {
  //   return res.status(200).json("image was saved");
  // }
);

export const contactsRouter = router;

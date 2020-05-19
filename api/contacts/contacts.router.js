import { Router } from "express";
import { contactsController } from "./contacts.controller";
import { authController } from "../auth/auth.controller";

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
// router.post(
//   "/",
//   contactsController.validateCreateContact,
//   contactsController.createContact
// );
router.delete(
  "/:contactId",
  authController.authorize,
  contactsController.deleteContact
);
router.put(
  "/:contactId",
  authController.authorize,
  contactsController.validateUpdateContact,
  contactsController.updateContact
);

export const contactsRouter = router;

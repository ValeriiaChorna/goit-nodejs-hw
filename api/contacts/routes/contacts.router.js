import { Router } from "express";
import { contactsController } from "../controllers/contacts.controller";

const router = Router();

router.get("/", contactsController.getListContacts);
router.get("/:contactId", contactsController.getContactById);
router.post(
  "/",
  contactsController.validateCreateContact,
  contactsController.createContact
);
router.delete("/:contactId", contactsController.deleteContact);
router.patch(
  "/:contactId",
  contactsController.validateUpdateContact,
  contactsController.updateContact
);

export const contactsRouter = router;

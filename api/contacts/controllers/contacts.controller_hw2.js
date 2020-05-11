import contactsFunc from "./contacts.functions_hw1";
import {
  NotFound,
  ValidationError,
  DeletedContactSuccess,
} from "../../helpers/errorConstructors";
import { createControllerProxy } from "../../helpers/controllerProxy";
import { v4 } from "uuid";
import Joi from "joi";

class ContactsController {
  getListContacts(req, res, next) {
    res.statusCode = 200;
    res.send(JSON.stringify(contactsFunc.listContacts()));
  }

  getContactById(req, res, next) {
    try {
      const { contactId } = req.params;
      const foundedContact = contactsFunc.getContactById(contactId);
      if (!foundedContact) {
        throw new NotFound("Not found");
      }
      return res.status(200).json(foundedContact);
    } catch (err) {
      next(err);
    }
  }

  createContact(req, res, next) {
    try {
      const newContactId = v4();
      const { name, email, phone } = req.body;
      contactsFunc.addContact(newContactId, name, email, phone);
      const newContact = contactsFunc.getContactById(newContactId);
      return res.status(201).json(newContact);
    } catch (err) {
      next(err);
    }
  }
  validateCreateContact(req, res, next) {
    const contactRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });
    const validationResult = Joi.validate(req.body, contactRules);
    if (validationResult.error) {
      throw new ValidationError("missing required name field");
    }
    next();
  }

  deleteContact(req, res, next) {
    try {
      const contactId = req.params.contactId;
      const foundedContact = contactsFunc.getContactById(contactId);
      if (!foundedContact) {
        throw new NotFound("Not found");
      }
      contactsFunc.removeContact(contactId);
      throw new DeletedContactSuccess("contact deleted");
    } catch (err) {
      next(err);
    }
  }

  updateContact(req, res, next) {
    try {
      const { contactId } = req.params;
      const foundedContact = contactsFunc.getContactById(contactId);
      if (!foundedContact) {
        throw new NotFound("Not found");
      }
      contactsFunc.updateContact(contactId, req.body);
      const updatedContact = contactsFunc.getContactById(contactId);
      return res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  }
  validateUpdateContact(req, res, next) {
    const contactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    });
    const { name, email, phone } = req.body;
    if (!(name || email || phone)) {
      throw new ValidationError("missing fields");
    }
    const validationResult = Joi.validate(req.body, contactRules);
    if (validationResult.error) {
      throw new ValidationError("missing required name field");
    }
    next();
  }
}

export const contactsController = createControllerProxy(
  new ContactsController()
);

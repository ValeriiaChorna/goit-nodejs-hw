import { contactModel } from "../models/contacts.model";
import {
  NotFound,
  ValidationError,
  DeletedContactSuccess,
} from "../../helpers/errorConstructors";
import { createControllerProxy } from "../../helpers/controllerProxy";
import Joi from "joi";

class ContactsController {
  async getListContacts(req, res, next) {
    const contacts = await contactModel.getAllContacts();
    res.status(200).json(contacts);
  }

  async getContactById(req, res, next) {
    try {
      const { contactId } = req.params;
      const foundedContact = await this.getContactByIdOrThrow(contactId);
      return res.status(200).json(foundedContact);
    } catch (err) {
      next(err);
    }
  }

  async createContact(req, res, next) {
    try {
      const newContact = await contactModel.createContact(req.body);
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
      password: Joi.string().required(),
    });
    const validationResult = Joi.validate(req.body, contactRules);
    if (validationResult.error) {
      throw new ValidationError("missing required name field");
    }
    next();
  }

  async deleteContact(req, res, next) {
    try {
      const contactId = req.params.contactId;
      await this.getContactByIdOrThrow(contactId);
      await contactModel.deleteContact(contactId);
      throw new DeletedContactSuccess("contact deleted");
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const { contactId } = req.params;
      await this.getContactByIdOrThrow(contactId);
      const updatedContact = await contactModel.updateContact(
        contactId,
        req.body
      );
      return res.status(200).json(updatedContact.value);
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

  async getContactByIdOrThrow(contactId) {
    const foundedContact = await contactModel.getContactById(contactId);
    if (!foundedContact) {
      throw new NotFound("Not found");
    }
    return foundedContact;
  }
}

export const contactsController = createControllerProxy(
  new ContactsController()
);

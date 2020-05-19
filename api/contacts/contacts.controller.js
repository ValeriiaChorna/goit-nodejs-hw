import { contactModel } from "./contacts.model";
import {
  NotFound,
  ValidationError,
  DeletedContactSuccess,
} from "../helpers/errorConstructors";
import { createControllerProxy } from "../helpers/controllerProxy";
import Joi from "joi";
import { authActions } from "../auth/auth.actions";

class ContactsController {
  async getListContacts(req, res, next) {
    try {
      const { page, limit, sort, sub } = req.query;
      if (!sub) {
        const contacts = await this.getContactsWithPagination(
          page,
          limit,
          sort
        );
        return res.status(200).json(contacts.docs);
      }
      const filteredContactsList = await this.filterContactBySub(sub);
      return res.status(200).json(filteredContactsList.docs);
    } catch (err) {
      next(err);
    }
  }
  async getContactsWithPagination(page, limit, sort) {
    const options = limit && { page, limit, sort };
    return contactModel.paginate({}, options);
  }

  async filterContactBySub(sub) {
    return contactModel.paginate({ subscription: sub });
  }

  async getContactById(req, res, next) {
    try {
      const { contactId } = req.params;
      const foundedContact = await this.getContactByIdOrThrow(contactId);
      const { email, subscription } = foundedContact;
      return res.status(200).json({ email, subscription });
    } catch (err) {
      next(err);
    }
  }

  async getCurrentContact(req, res, next) {
    try {
      const { _id: contactId } = req.contact;
      const foundedContact = await this.getContactByIdOrThrow(contactId);
      const { email, subscription } = foundedContact;
      return res.status(200).json({ email, subscription });
    } catch (err) {
      next(err);
    }
  }

  async createContact(req, res, next) {
    try {
      const passwordHash = await authActions.hashPassword(req.body.password);
      const newContact = await contactModel.createNewContact({
        ...req.body,
        passwordHash,
      });
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
      await contactModel.removeContact(contactId);
      throw new DeletedContactSuccess("contact deleted");
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const { contactId } = req.params;
      await this.getContactByIdOrThrow(contactId);
      const updatedContact = await contactModel.updateExistedContact(
        contactId,
        req.body
      );
      const { name, email, subscription } = updatedContact;
      return res.status(200).json({ name, email, subscription });
    } catch (err) {
      next(err);
    }
  }

  validateUpdateContact(req, res, next) {
    const contactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      subscription: Joi.string().valid(["free", "pro", "premium"]),
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
      throw new NotFound("Contact not found");
    }
    return foundedContact;
  }
}

export const contactsController = createControllerProxy(
  new ContactsController()
);

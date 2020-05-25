import { contactModel } from "./contacts.model";
import { NotFound, DeletedContactSuccess } from "../helpers/errorConstructors";
import { createControllerProxy } from "../helpers/controllerProxy";
import { authActions } from "../auth/auth.actions";
import fs from "fs";
import path from "path";

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

  async updateAllContactFields(req, res, next) {
    try {
      const { _id: contactId, avatarURL: oldAvatarUrl } = req.contact;

      if (!(req.file && req.file.fieldname === "avatar")) {
        const updatedContact = await contactModel.updateExistedContact(
          contactId,
          req.body
        );
        const { name, email, subscription } = updatedContact;
        return res.status(200).json({ name, email, subscription });
      }

      const newAvatarURL = `${process.env.SERVER_URL}/${process.env.COMPRESSED_IMAGES_BASE_URL}/${req.file.filename}`;
      await this.findAndDeleteOldAvatar(oldAvatarUrl);

      // await this.getContactByIdOrThrow(contactId);
      console.log("req.body:", req.body);
      const newContactData = { ...req.body, avatarURL: newAvatarURL };
      const updatedContact = await contactModel.updateExistedContact(
        contactId,
        newContactData
      );
      const { name, email, subscription, avatarURL } = updatedContact;
      return res.status(200).json({ avatarURL, name, email, subscription });
    } catch (err) {
      next(err);
    }
  }

  async findAndDeleteOldAvatar(oldAvatarUrl) {
    const OldAvatar = oldAvatarUrl.replace(
      `${process.env.SERVER_URL}/${process.env.COMPRESSED_IMAGES_BASE_URL}/`,
      ""
    );
    const pathOldAvatar = path.join(
      __dirname,
      "../../static/public/images/",
      `${OldAvatar}`
    );
    await fs.unlink(pathOldAvatar, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
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

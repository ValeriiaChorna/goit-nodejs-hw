import { contactModel } from "../contacts/contacts.model";
import { ConflictError, UnauthorizedError } from "../helpers/errorConstructors";
import { createControllerProxy } from "../helpers/controllerProxy";
import { authActions } from "./auth.actions";
import createAvatar from "../helpers/avatarBuilder";
import shortId from "shortid";
import path from "path";
import { promises as fsPromises } from "fs";

class AuthController {
  async registerContact(req, res, next) {
    try {
      const { email, password } = req.body;
      const existedContact = await contactModel.getContactByEmail(email);
      if (existedContact) {
        throw new ConflictError("Email in use");
      }

      const userAvatar = await createAvatar(email);
      const id = shortId();
      const avatarFileName = `avatar-${id}.png`;
      const avatarPath = path.join(
        __dirname,
        `../../static/public/images/${avatarFileName}`
      );
      await fsPromises.writeFile(avatarPath, userAvatar);
      const avatarURL = `${process.env.SERVER_URL}/${process.env.COMPRESSED_IMAGES_BASE_URL}/${avatarFileName}`;

      const passwordHash = await authActions.hashPassword(password);
      const newContact = await contactModel.createNewContact({
        email,
        avatarURL,
        passwordHash,
      });

      const token = authActions.createToken(newContact._id);
      await contactModel.updateExistedContact(newContact._id, { token });
      // res.cookie("auth_token", token, { httpOnly: true });

      return res
        .status(201)
        .json({ token, contact: this.composeContactForResReg(newContact) });
    } catch (err) {
      next(err);
    }
  }

  composeContactForResReg(contact) {
    return {
      email: contact.email,
      subscription: contact.subscription,
      avatarURL: contact.avatarURL,
    };
  }

  async logInContact(req, res, next) {
    try {
      const { email, password } = req.body;
      const existedContact = await contactModel.getContactByEmail(email);
      if (!existedContact) {
        throw new UnauthorizedError("Email or password is wrong");
      }
      const isPasswordCorrect = await authActions.comparePasswordHash(
        password,
        existedContact.passwordHash
      );
      if (!isPasswordCorrect) {
        throw new UnauthorizedError("Email or password is wrong");
      }
      const token = authActions.createToken(existedContact._id);
      await contactModel.updateExistedContact(existedContact._id, { token });
      return res
        .status(200)
        .json({ token, contact: this.composeContactForResReg(existedContact) });
    } catch (err) {
      next(err);
    }
  }

  async authorize(req, res, next) {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer ", "");
      try {
        authActions.varifyToken(token);
      } catch (err) {
        throw new UnauthorizedError("Not authorized1");
      }

      const contact = await contactModel.getContactByToken(token);
      if (!contact) {
        throw new UnauthorizedError("Not authorized2");
      }

      req.contact = contact;
      req.token = token;

      next();
    } catch (err) {
      next(err);
    }
  }

  async logOutContact(req, res, next) {
    try {
      await contactModel.updateExistedContact(req.contact._id, { token: "" });
      return res.status(204).json();
    } catch (err) {
      next(err);
    }
  }
}

export const authController = createControllerProxy(new AuthController());

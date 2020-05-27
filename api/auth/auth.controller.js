import { contactModel, CONTACT_STATUSES } from "../contacts/contacts.model";
import {
  ConflictError,
  UnauthorizedError,
  NotFound,
} from "../helpers/errorConstructors";
import { createControllerProxy } from "../helpers/controllerProxy";
import { authActions } from "./auth.actions";
import createAvatar from "../helpers/avatarBuilder";
import shortId from "shortid";
import path from "path";
import { promises as fsPromises } from "fs";
import { v4 } from "uuid";
import sgMail from "@sendgrid/mail";

class AuthController {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async registerContact(req, res, next) {
    try {
      const { email, password } = req.body;
      const existedContact = await contactModel.getContactByEmail(email);
      if (existedContact) {
        throw new ConflictError("Email in use");
      }

      const avatarURL = await this.createDefaultContactAvatar(email);
      const passwordHash = await authActions.hashPassword(password);
      const verificationToken = v4();

      const newContact = await contactModel.createNewContact({
        email,
        avatarURL,
        passwordHash,
        verificationToken,
      });

      this.sendVerificationEmail(newContact);

      return res
        .status(201)
        .json({ contact: this.composeContactForResReg(newContact) });
    } catch (err) {
      next(err);
    }
  }

  async createDefaultContactAvatar(email) {
    const contactAvatar = await createAvatar(email);
    const id = shortId();
    const avatarFileName = `avatar-${id}.png`;
    const avatarPath = path.join(
      __dirname,
      `../../static/public/images/${avatarFileName}`
    );
    await fsPromises.writeFile(avatarPath, contactAvatar);
    const avatarURL = `${process.env.SERVER_URL}/${process.env.COMPRESSED_IMAGES_BASE_URL}/${avatarFileName}`;
    return avatarURL;
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

      if (user.status !== USER_STATUSES.ACTIVE) {
        throw new UnauthorizedError("User not verified");
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

  async verifyContact(req, res, next) {
    try {
      const { verificationToken } = req.params;
      const contactToVerify = await contactModel.getByVerificationToken(
        verificationToken
      );
      if (!contactToVerify) {
        throw new NotFound("Contact not found");
      }
      await contactModel.verifyContact(verificationToken);

      const token = authActions.createToken(contactToVerify._id);
      await contactModel.updateExistedContact(contactToVerify._id, {
        token,
        status: CONTACT_STATUSES.ACTIVE,
      });
      // res.cookie("auth_token", token, { httpOnly: true });

      return res.status(200).json({ token });
    } catch (err) {
      next(err);
    }
  }

  async sendVerificationEmail(contact) {
    const verificationLink = `${process.env.SERVER_URL}/auth/verify/${contact.verificationToken}`;

    await sgMail.send({
      to: contact.email,
      from: process.env.SENDER_EMAIL,
      subject: "Please verify your email",
      html: `<p>Complete verification your account. </p><button><a href="${verificationLink}">Click to verify your email</a></button>`,
      // html: `<p>For complete verification enter the code ${contact.verificationToken}</p><form action='${verificationLink}' method="post"><input  name="verificationLink" placeholder="Enter code"></input><button type="submit">Click to confirm</button></form>`,
    });
  }
}

export const authController = createControllerProxy(new AuthController());

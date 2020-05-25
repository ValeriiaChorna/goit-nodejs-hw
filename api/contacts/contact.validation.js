import Joi from "joi";
import { ValidationError } from "../helpers/errorConstructors";

class ContactValidations {
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

  validateUpdateAllContactFields(req, res, next) {
    const contactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      subscription: Joi.string().valid(["free", "pro", "premium"]),
    });
    const { name, email, phone } = req.body;
    const hasAvatarFile = req.file && req.file.fieldname === "avatar";
    if (!(name || email || phone || hasAvatarFile)) {
      throw new ValidationError("missing fields");
    }

    // if (!hasAvatarFile) {
    //   return res.status(400).json({ message: "Avatar file was not provided" });
    // }

    const validationResult = Joi.validate(req.body, contactRules);
    if (validationResult.error) {
      throw new ValidationError("missing required name field");
    }
    next();
  }
}

export const contactValidations = new ContactValidations();

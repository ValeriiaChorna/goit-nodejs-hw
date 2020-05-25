import Joi from "joi";
import { ValidationError } from "../helpers/errorConstructors";

class AuthValidations {
  validateRegisterContact(req, res, next) {
    const contactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string().required(),
      phone: Joi.string(),
      password: Joi.string().required(),
    });
    const validationResult = Joi.validate(req.body, contactRules);
    if (validationResult.error) {
      throw new ValidationError(
        "Ошибка от Joi или другой валидационной библиотеки"
      );
    }
    next();
  }

  validateLogInContact(req, res, next) {
    const contactRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    const validationResult = Joi.validate(req.body, contactRules);
    if (validationResult.error) {
      throw new ValidationError(
        "Ошибка от Joi или другой валидационной библиотеки"
      );
    }
    next();
  }
}

export const authValidations = new AuthValidations();

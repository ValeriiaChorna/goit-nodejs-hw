import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthActions {
  constructor() {
    this._saltRounds = 5;
  }

  async hashPassword(password) {
    return bcryptjs.hash(password, this._saltRounds);
  }

  async comparePasswordHash(password, passwordHash) {
    return bcryptjs.compare(password, passwordHash);
  }

  createToken(contactId) {
    return jwt.sign({ contactId }, process.env.JWT_SECRET);
  }

  varifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

export const authActions = new AuthActions();

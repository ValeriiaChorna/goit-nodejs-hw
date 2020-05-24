import express from "express";
import { contactsRouter } from "./contacts/contacts.router";
import { authRouter } from "./auth/auth.router";
import morgan from "morgan";
// import cors from "cors";
import path from "path";
import mongoose from "mongoose";
// import cookieParser from "cookie-parser";

export class CrudServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddleware();
    await this.initDatabase();
    this.initRoutes();
    this.handleErrors();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddleware() {
    this.server.use(express.json());
    this.server.use(morgan("tiny"));
    // this.server.use(cors());
    // this.server.use(cookieParser());
  }

  initRoutes() {
    this.server.use(express.static(path.join(__dirname, "../static")));
    this.server.use("/contacts", contactsRouter);
    this.server.use("/auth", authRouter);
  }

  handleErrors() {
    this.server.use((err, req, res, next) => {
      delete err.stack;
      return res.status(err.status || 500).send(`${err.name}: ${err.message}`);
    });
  }

  async initDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      console.log("Database connection successful");
    } catch (err) {
      console.log("MongoDB connection error", err);
      process.exit(1);
    }
  }

  startListening() {
    this.server.listen(process.env.PORT, () => {
      console.log("Server started listening on port", process.env.PORT);
    });
  }
}

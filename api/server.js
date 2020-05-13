import express from "express";
import { contactsRouter } from "./contacts/routes/contacts.router";
import morgan from "morgan";
// import cors from "cors";
import path from "path";
import mongoose from "mongoose";

const PORT = 3000;

export class CrudServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddleware();
    this.initRoutes();
    this.handleErrors();
    this.handleErrors2();
    await this.initDatabase();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddleware() {
    this.server.use(express.json());
    this.server.use("/static", express.static(path.join(__dirname, "static")));
    this.server.use(morgan("tiny"));
    // this.server.use(cors());
  }

  initRoutes() {
    this.server.use("/api/contacts", contactsRouter);
  }

  handleErrors() {
    this.server.use((err, req, res, next) => {
      delete err.stack;
      return res.status(err.status).send(`${err.name}: ${err.message}`);
    });
  }

  handleErrors2() {
    //добавила из-за ошибки RangeError [ERR_HTTP_INVALID_STATUS_CODE]: Invalid status code: undefined
    this.server.use((err, req, res, next) => {
      if (err && err.status !== 500) {
        res
          .status(err.status || 400)
          .send(
            "RangeError [ERR_HTTP_INVALID_STATUS_CODE]: Invalid status code: undefined"
          );
      } else {
        res.status(500).json({ message: "Internal server occured..." });
      }
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
    this.server.listen(PORT, () => {
      console.log("Server started listening on port", PORT);
    });
  }
}

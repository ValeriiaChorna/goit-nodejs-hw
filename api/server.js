import express from "express";
import { contactsRouter } from "./contacts/contacts.router";
import morgan from "morgan";
import cors from "cors";
import path from "path";
const PORT = 3000;

export class CrudServer {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddleware();
    this.initRoutes();
    this.handleErrors();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddleware() {
    this.server.use(express.json());
    this.server.use("/static", express.static(path.join(__dirname, "static")));
    this.server.use(morgan("tiny"));
    this.server.use(cors());
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

  startListening() {
    this.server.listen(PORT, () => {
      console.log("Server started listening on port", PORT);
    });
  }
}

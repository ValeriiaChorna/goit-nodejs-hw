require = require("esm")(module);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { CrudServer } = require("./api/server");

new CrudServer().start();

require = require("esm")(module);
require("./config");
const { CrudServer } = require("./api/server");

new CrudServer().start();

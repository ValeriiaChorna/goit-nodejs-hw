require = require("esm")(module);
const { CrudServer } = require("./api/server");

new CrudServer().start();

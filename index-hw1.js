const argv = require("yargs").argv;
const contacts = require("./api/contacts/contacts.functions");

// TODO: рефакторить
function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
      console.table(contacts.listContacts());
      break;

    case "get":
      console.log(contacts.getContactById(id));
      break;

    case "add":
      contacts.addContact(name, email, phone);
      console.table(contacts.listContacts());
      break;

    case "remove":
      contacts.removeContact(id);
      console.table(contacts.listContacts());
      break;

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(argv);

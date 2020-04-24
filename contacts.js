const fs = require("fs");
const path = require("path");

const contactsPath = path.join(__dirname, "./db/contacts.json");

function listContacts() {
  try {
    return JSON.parse(
      fs.readFileSync(contactsPath, "utf8", async (err) => {
        if (err) throw err;
      })
    );
  } catch (err) {
    console.log("error:", err);
  }
}

function getContactById(contactId) {
  try {
    const contactList = listContacts();
    return contactList.find((contact) => contact.id === contactId);
  } catch (err) {
    console.log("error:", err);
  }
}

function removeContact(contactId) {
  try {
    const contactList = listContacts();
    const newList = contactList.filter((contact) => contact.id !== contactId);
    return fs.writeFileSync(contactsPath, JSON.stringify(newList), (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.log("error:", err);
  }
}

function addContact(name, email, phone) {
  try {
    const contactList = listContacts();
    const newId = contactList.length + 1;
    const newContact = {
      id: newId,
      name,
      email,
      phone,
    };
    return fs.writeFileSync(
      contactsPath,
      JSON.stringify([...contactList, newContact]),
      (err) => {
        if (err) throw err;
      }
    );
  } catch (err) {
    console.log("error:", err);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};

const fs = require("fs");
const path = require("path");

const contactsPath = path.join(__dirname, "../../db/contacts.json");

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

function addContact(id, name, email, phone) {
  try {
    const contactList = listContacts();
    const newContact = {
      id,
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

function updateContact(id, updates) {
  try {
    const contactList = listContacts();
    const indexContact = contactList.findIndex((el) => el.id === id);
    const updatedContact = { ...contactList[indexContact], ...updates };
    contactList[indexContact] = updatedContact;
    return fs.writeFileSync(
      contactsPath,
      JSON.stringify(contactList),
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
  updateContact,
};

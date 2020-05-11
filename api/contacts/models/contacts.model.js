import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Types;

const contactSchema = new Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  phone: { type: String, require: true },
  password: { type: String, require: true },
  subscription: { type: String, require: true, default: "free" },
  token: { type: String, require: true, default: "" },
});

contactSchema.statics.getAllContacts = getAllContacts;
contactSchema.statics.getContactById = getContactById;
contactSchema.statics.createContact = createContact;
contactSchema.statics.deleteContact = deleteContact;
contactSchema.statics.updateContact = updateContact;

async function getAllContacts() {
  return this.find();
}

async function getContactById(contactId) {
  if (!ObjectId.isValid(contactId)) {
    return null;
  }

  return this.findById(contactId);
}

async function createContact(newContactParams) {
  return this.create(newContactParams);
}

async function deleteContact(contactId) {
  if (!ObjectId.isValid(contactId)) {
    return null;
  }

  return this.findByIdAndDelete(contactId);
}

async function updateContact(contactId, newContactParams) {
  if (!ObjectId.isValid(contactId)) {
    return null;
  }

  return this.findByIdAndUpdate(
    contactId,
    { $set: newContactParams },
    { new: true }
  );
}

export const contactModel = mongoose.model("Contact", contactSchema);
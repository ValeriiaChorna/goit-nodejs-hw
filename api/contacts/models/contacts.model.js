import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Types;

const contactSchema = new Schema({
  name: { type: String, require: true, maxlength: 255, minlength: 3 },
  email: { type: String, require: true, unique: true },
  phone: { type: String, require: true, max: 20, min: 7 },
  password: { type: String, require: true },
  subscription: { type: String, require: true, default: "free" },
  token: { type: String, require: true, default: "" },
});

contactSchema.statics.getAllContacts = getAllContacts;
contactSchema.statics.getContactById = getContactById;
contactSchema.statics.createNewContact = createNewContact;
contactSchema.statics.removeContact = removeContact;
contactSchema.statics.updateExistedContact = updateExistedContact;

async function getAllContacts() {
  return this.find();
}

async function getContactById(contactId) {
  if (!ObjectId.isValid(contactId)) {
    return null;
  }

  return this.findById(contactId);
}

async function createNewContact(newContactParams) {
  return this.create(newContactParams);
}

async function removeContact(contactId) {
  if (!ObjectId.isValid(contactId)) {
    return null;
  }

  return this.findByIdAndDelete(contactId);
}

async function updateExistedContact(contactId, newContactParams) {
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

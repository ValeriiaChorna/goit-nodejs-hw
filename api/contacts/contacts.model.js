import mongoose, { Schema } from "mongoose";
const mongoosePaginate = require("mongoose-paginate-v2");
const { ObjectId } = mongoose.Types;

export const CONTACT_STATUSES = {
  NOT_VERIFIED: "NOT_VERIFIED",
  ACTIVE: "ACTIVE",
};

const contactSchema = new Schema({
  name: { type: String, require: true, maxlength: 255, minlength: 3 },
  email: { type: String, require: true, unique: true },
  phone: { type: String, require: true, max: 20, min: 7 },
  verificationToken: { type: String, require: false },
  passwordHash: { type: String, require: true },
  status: {
    type: String,
    required: true,
    default: CONTACT_STATUSES.NOT_VERIFIED,
    enum: Object.values(CONTACT_STATUSES),
  },
  avatarURL: String,
  subscription: {
    type: String,
    require: true,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: { type: String, require: true, default: "" },
});

contactSchema.statics.getAllContacts = getAllContacts;
contactSchema.statics.getContactById = getContactById;
contactSchema.statics.getContactByEmail = getContactByEmail;
contactSchema.statics.getContactByToken = getContactByToken;
contactSchema.statics.createNewContact = createNewContact;
contactSchema.statics.removeContact = removeContact;
contactSchema.statics.updateExistedContact = updateExistedContact;
contactSchema.statics.getByVerificationToken = getByVerificationToken;
contactSchema.statics.verifyContact = verifyContact;
contactSchema.plugin(mongoosePaginate);

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

async function getContactByEmail(email) {
  return this.findOne({ email });
}

async function getContactByToken(token) {
  return this.findOne({ token });
}

async function getByVerificationToken(verificationToken) {
  return this.findOne({ verificationToken });
}
async function verifyContact(verificationToken) {
  return this.updateOne(
    { verificationToken },
    { $set: { verificationToken: null, status: CONTACT_STATUSES.ACTIVE } }
  );
}

export const contactModel = mongoose.model("Contact", contactSchema);

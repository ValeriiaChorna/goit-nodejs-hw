import { MongoClient, ObjectId } from "mongodb";

class ContactAction {
  constructor() {
    this.contacts = null;
  }

  async getAllContacts() {
    await this.getContactCollection();
    return this.contacts.find().toArray();
  }

  async getContactById(contactId) {
    await this.getContactCollection();
    if (!ObjectId.isValid(contactId)) {
      return null;
    }

    return this.contacts.findOne({ _id: new ObjectId(contactId) });
  }

  async createContact(newContactParams) {
    await this.getContactCollection();
    const insertNewContact = await this.contacts.insertOne(newContactParams);

    return this.contacts.findOne({
      _id: new ObjectId(insertNewContact.insertedId),
    });
  }

  async deleteContact(contactId) {
    await this.getContactCollection();
    if (!ObjectId.isValid(contactId)) {
      return null;
    }
    return this.contacts.deleteOne({ _id: new ObjectId(contactId) });
  }

  async updateContact(contactId, newContactParams) {
    await this.getContactCollection();
    if (!ObjectId.isValid(contactId)) {
      return null;
    }

    return this.contacts.updateOne(
      { _id: new ObjectId(contactId) },
      { $set: newContactParams },
      { new: true }
    );
  }

  async getContactCollection() {
    if (this.contacts) {
      return;
    }

    const client = await MongoClient.connect(process.env.MONGODB_DB_URI);
    const db = client.db(process.env.MONGODB_NAME);
    this.contacts = await db.collection("contacts");
  }
}

export const contactAction = new ContactAction();

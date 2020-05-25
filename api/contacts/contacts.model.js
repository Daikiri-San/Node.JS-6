const mongoose = require("mongoose");
const { Schema, Types } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { ObjectId } = Types;

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
});

contactSchema.plugin(mongoosePaginate);

contactSchema.statics.findAllContacts = findAllContacts;
contactSchema.statics.findContactById = findContactById;
contactSchema.statics.createContact = createContact;
contactSchema.statics.updateContactById = updateContactById;
contactSchema.statics.deleteContactById = deleteContactById;

async function findAllContacts(page, limit) {
  return this.paginate(
    {},
    {
      page: page || 1,
      limit: limit || 20,
    }
  );
}

async function findContactById(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return this.findById(id);
}

async function createContact(contactParams) {
  return this.create(contactParams);
}

async function updateContactById(id, contactParams) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return this.findByIdAndUpdate(id, { $set: contactParams }, { new: true });
}

async function deleteContactById(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return this.findByIdAndDelete(id);
}

module.exports = {
  ContactModel: mongoose.model("Contact", contactSchema),
};

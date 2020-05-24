const { ContactModel } = require("./contacts.model");

class ContactsController {
  async listContacts(req, res, next) {
    try {
      const filterParams = req.query.sub;
      const pageParams = Number(req.query.page);
      const limitParams = Number(req.query.limit);
      const contacts = await ContactModel.findAllContacts(
        pageParams,
        limitParams
      );

      if (filterParams) {
        const filteredContacts = contacts.filter(({ subscription }) => {
          return subscription === filterParams;
        });

        return res.status(200).json(filteredContacts);
      }

      return res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { contactId } = req.params;

      const searchedUser = await ContactModel.findContactById(contactId);
      if (!searchedUser) return res.status(404).json({ message: "Not found" });
      return res.status(200).json(searchedUser);
    } catch (err) {
      next(err);
    }
  }

  async addContact(req, res, next) {
    try {
      const newContact = await ContactModel.createContact(req.body);

      return res.status(201).json(newContact);
    } catch (err) {
      next(err);
    }
  }

  validateAddContact(req, res, next) {
    const { name, email, phone } = req.body;
    if (!name) {
      return res.status(400).json({ message: "missing required name field" });
    }
    if (!email) {
      return res.status(400).json({ message: "missing required email field" });
    }
    if (!phone) {
      return res.status(400).json({ message: "missing required phone field" });
    }
    next();
  }

  async removeContact(req, res, next) {
    const { contactId } = req.params;

    try {
      const searchedUser = await ContactModel.findContactById(contactId);
      if (!searchedUser) return res.status(404).json({ message: "Not found" });

      await ContactModel.deleteContactById(contactId);

      return res.status(200).json({ message: "contact deleted" });
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    const { name, email, phone } = req.body;
    if (!name && !email && !phone) {
      return res.status(400).json({
        message:
          "missing fields. You need any of name/email/phone to update contact",
      });
    }

    const { contactId } = req.params;

    try {
      const searchedUser = await ContactModel.findContactById(contactId);
      if (!searchedUser) return res.status(404).json({ message: "Not found" });
      const updatedContact = await ContactModel.updateContactById(
        contactId,
        req.body
      );

      return res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = {
  ContactsController: new ContactsController(),
};

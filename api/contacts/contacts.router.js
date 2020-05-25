const { Router } = require("express");
const { ContactsController } = require("./contacts.controller");

const contactsRouter = Router();

contactsRouter.get("/:contactId", ContactsController.getById);
contactsRouter.get("/", ContactsController.listContacts);
contactsRouter.post(
  "/",
  ContactsController.validateAddContact,
  ContactsController.addContact
);
contactsRouter.delete("/:contactId", ContactsController.removeContact);
contactsRouter.patch("/:contactId", ContactsController.updateContact);

module.exports = { contactsRouter };

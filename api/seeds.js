const path = require("path");
const { Seeder } = require("mongo-seeding");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const config = {
  database: process.env.MONGODB_DB_ADMIN,
  dropDatabase: true,
};
const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(path.resolve("./api/db"), {
  extensions: ["json", "js"],
  transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
});

seeder
  .import(collections)
  .then(() => {
    console.log("Success seeding");
  })
  .catch((err) => {
    console.log("Error seeding", err);
  });

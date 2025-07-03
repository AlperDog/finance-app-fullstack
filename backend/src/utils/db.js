const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "sqlite3",
  connection: {
    filename: process.env.DATABASE_URL || "./finansdb.sqlite",
  },
  useNullAsDefault: true,
});

module.exports = db;

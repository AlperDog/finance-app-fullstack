const db = require("../utils/db");
const bcrypt = require("bcrypt");

// Kullanıcı tablosunu oluştur (varsa atla)
async function createUserTable() {
  const exists = await db.schema.hasTable("users");
  if (!exists) {
    await db.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
      table.string("name");
      table.timestamps(true, true);
    });
  }
}

async function createUser({ email, password, name }) {
  const hashed = await bcrypt.hash(password, 10);
  const [id] = await db("users").insert({ email, password: hashed, name });
  return { id, email, name };
}

async function findUserByEmail(email) {
  return db("users").where({ email }).first();
}

module.exports = {
  createUserTable,
  createUser,
  findUserByEmail,
};

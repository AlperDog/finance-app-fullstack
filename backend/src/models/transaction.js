const db = require("../utils/db");

// Transaction tablosunu oluştur (varsa atla)
async function createTransactionTable() {
  const exists = await db.schema.hasTable("transactions");
  if (!exists) {
    await db.schema.createTable("transactions", (table) => {
      table.increments("id").primary();
      table.integer("user_id").notNullable();
      table.string("type").notNullable(); // income | expense
      table.float("amount").notNullable();
      table.string("category");
      table.string("description");
      table.date("date").notNullable();
      table.timestamps(true, true);
    });
  }
}

async function addTransaction({
  user_id,
  type,
  amount,
  category,
  description,
  date,
}) {
  const [id] = await db("transactions").insert({
    user_id,
    type,
    amount,
    category,
    description,
    date,
  });
  return { id, user_id, type, amount, category, description, date };
}

async function getTransactionsByUser(user_id) {
  return db("transactions").where({ user_id }).orderBy("date", "desc");
}

async function updateTransaction(id, user_id, data) {
  await db("transactions").where({ id, user_id }).update(data);
  return db("transactions").where({ id, user_id }).first();
}

async function deleteTransaction(id, user_id) {
  return db("transactions").where({ id, user_id }).del();
}

module.exports = {
  createTransactionTable,
  addTransaction,
  getTransactionsByUser,
  updateTransaction,
  deleteTransaction,
};

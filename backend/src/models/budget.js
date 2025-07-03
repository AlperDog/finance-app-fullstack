const db = require("../utils/db");

// Budget tablosunu oluştur (varsa atla)
async function createBudgetTable() {
  const exists = await db.schema.hasTable("budgets");
  if (!exists) {
    await db.schema.createTable("budgets", (table) => {
      table.increments("id").primary();
      table.integer("user_id").notNullable();
      table.integer("category_id"); // null ise genel bütçe
      table.float("amount").notNullable();
      table.string("period").notNullable(); // monthly, yearly, custom
      table.timestamps(true, true);
    });
  }
}

async function addBudget({ user_id, category_id, amount, period }) {
  const [id] = await db("budgets").insert({
    user_id,
    category_id,
    amount,
    period,
  });
  return { id, user_id, category_id, amount, period };
}

async function getBudgetsByUser(user_id) {
  return db("budgets").where({ user_id });
}

async function updateBudget(id, user_id, data) {
  await db("budgets").where({ id, user_id }).update(data);
  return db("budgets").where({ id, user_id }).first();
}

async function deleteBudget(id, user_id) {
  return db("budgets").where({ id, user_id }).del();
}

module.exports = {
  createBudgetTable,
  addBudget,
  getBudgetsByUser,
  updateBudget,
  deleteBudget,
};

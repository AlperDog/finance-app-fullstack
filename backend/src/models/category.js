const db = require("../utils/db");

// Category tablosunu oluştur (varsa atla)
async function createCategoryTable() {
  const exists = await db.schema.hasTable("categories");
  if (!exists) {
    await db.schema.createTable("categories", (table) => {
      table.increments("id").primary();
      table.integer("user_id").notNullable();
      table.string("name").notNullable();
      table.string("type").notNullable(); // income | expense
      table.timestamps(true, true);
    });
  }
}

async function addCategory({ user_id, name, type }) {
  const [id] = await db("categories").insert({ user_id, name, type });
  return { id, user_id, name, type };
}

async function getCategoriesByUser(user_id) {
  return db("categories").where({ user_id });
}

async function updateCategory(id, user_id, data) {
  await db("categories").where({ id, user_id }).update(data);
  return db("categories").where({ id, user_id }).first();
}

async function deleteCategory(id, user_id) {
  return db("categories").where({ id, user_id }).del();
}

module.exports = {
  createCategoryTable,
  addCategory,
  getCategoriesByUser,
  updateCategory,
  deleteCategory,
};

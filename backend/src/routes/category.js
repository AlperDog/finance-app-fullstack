const {
  addCategory,
  getCategoriesByUser,
  updateCategory,
  deleteCategory,
} = require("../models/category");
const authMiddleware = require("../utils/auth");

async function categoryRoutes(fastify, options) {
  // Tüm endpointler JWT ile korumalı
  fastify.addHook("preHandler", authMiddleware);

  // Listele
  fastify.get("/", async (request, reply) => {
    const user_id = request.user.id;
    const categories = await getCategoriesByUser(user_id);
    reply.send(categories);
  });

  // Ekle
  fastify.post("/", async (request, reply) => {
    const user_id = request.user.id;
    const { name, type } = request.body;
    if (!name || !type) {
      return reply.code(400).send({ error: "name ve type zorunlu." });
    }
    const category = await addCategory({ user_id, name, type });
    reply.send(category);
  });

  // Güncelle
  fastify.put("/:id", async (request, reply) => {
    const user_id = request.user.id;
    const { id } = request.params;
    const updated = await updateCategory(id, user_id, request.body);
    if (!updated)
      return reply.code(404).send({ error: "Kategori bulunamadı." });
    reply.send(updated);
  });

  // Sil
  fastify.delete("/:id", async (request, reply) => {
    const user_id = request.user.id;
    const { id } = request.params;
    const deleted = await deleteCategory(id, user_id);
    if (!deleted)
      return reply.code(404).send({ error: "Kategori bulunamadı." });
    reply.send({ success: true });
  });
}

module.exports = categoryRoutes;

const {
  addBudget,
  getBudgetsByUser,
  updateBudget,
  deleteBudget,
} = require("../models/budget");
const authMiddleware = require("../utils/auth");

async function budgetRoutes(fastify, options) {
  // Tüm endpointler JWT ile korumalı
  fastify.addHook("preHandler", authMiddleware);

  // Listele
  fastify.get("/", async (request, reply) => {
    const user_id = request.user.id;
    const budgets = await getBudgetsByUser(user_id);
    reply.send(budgets);
  });

  // Ekle
  fastify.post("/", async (request, reply) => {
    const user_id = request.user.id;
    const { category_id, amount, period } = request.body;
    if (!amount || !period) {
      return reply.code(400).send({ error: "amount ve period zorunlu." });
    }
    const budget = await addBudget({
      user_id,
      category_id,
      amount,
      period,
    });
    reply.send(budget);
  });

  // Güncelle
  fastify.put("/:id", async (request, reply) => {
    const user_id = request.user.id;
    const { id } = request.params;
    const updated = await updateBudget(id, user_id, request.body);
    if (!updated) return reply.code(404).send({ error: "Bütçe bulunamadı." });
    reply.send(updated);
  });

  // Sil
  fastify.delete("/:id", async (request, reply) => {
    const user_id = request.user.id;
    const { id } = request.params;
    const deleted = await deleteBudget(id, user_id);
    if (!deleted) return reply.code(404).send({ error: "Bütçe bulunamadı." });
    reply.send({ success: true });
  });
}

module.exports = budgetRoutes;

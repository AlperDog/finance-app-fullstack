const {
  addTransaction,
  getTransactionsByUser,
  updateTransaction,
  deleteTransaction,
} = require("../models/transaction");
const authMiddleware = require("../utils/auth");

async function transactionRoutes(fastify, options) {
  // Tüm endpointler JWT ile korumalı
  fastify.addHook("preHandler", authMiddleware);

  // Listele
  fastify.get("/", async (request, reply) => {
    const user_id = request.user.id;
    const transactions = await getTransactionsByUser(user_id);
    reply.send(transactions);
  });

  // Ekle
  fastify.post("/", async (request, reply) => {
    const user_id = request.user.id;
    const { type, amount, category, description, date } = request.body;
    if (!type || !amount || !date) {
      return reply.code(400).send({ error: "type, amount ve date zorunlu." });
    }
    const transaction = await addTransaction({
      user_id,
      type,
      amount,
      category,
      description,
      date,
    });
    reply.send(transaction);
  });

  // Güncelle
  fastify.put("/:id", async (request, reply) => {
    const user_id = request.user.id;
    const { id } = request.params;
    const updated = await updateTransaction(id, user_id, request.body);
    if (!updated) return reply.code(404).send({ error: "Kayıt bulunamadı." });
    reply.send(updated);
  });

  // Sil
  fastify.delete("/:id", async (request, reply) => {
    const user_id = request.user.id;
    const { id } = request.params;
    const deleted = await deleteTransaction(id, user_id);
    if (!deleted) return reply.code(404).send({ error: "Kayıt bulunamadı." });
    reply.send({ success: true });
  });
}

module.exports = transactionRoutes;

const db = require("../utils/db");
const authMiddleware = require("../utils/auth");
const redis = require("../utils/redis");

async function analyticsRoutes(fastify, options) {
  fastify.addHook("preHandler", authMiddleware);

  // Özet: toplam gelir, gider, net bakiye (Redis cache)
  fastify.get("/summary", async (request, reply) => {
    const user_id = request.user.id;
    const { start, end } = request.query;
    const cacheKey = `summary:${user_id}:${start || ""}:${end || ""}`;
    const cached = await redis.get(cacheKey);
    if (cached) return reply.send(JSON.parse(cached));
    const query = db("transactions").where({ user_id });
    if (start) query.andWhere("date", ">=", start);
    if (end) query.andWhere("date", "<=", end);
    const transactions = await query;
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const result = { income, expense, balance: income - expense };
    await redis.setEx(cacheKey, 60, JSON.stringify(result));
    reply.send(result);
  });

  // Kategori bazlı toplamlar (Redis cache)
  fastify.get("/by-category", async (request, reply) => {
    const user_id = request.user.id;
    const { start, end } = request.query;
    const cacheKey = `bycat:${user_id}:${start || ""}:${end || ""}`;
    const cached = await redis.get(cacheKey);
    if (cached) return reply.send(JSON.parse(cached));
    const query = db("transactions").where({ user_id });
    if (start) query.andWhere("date", ">=", start);
    if (end) query.andWhere("date", "<=", end);
    const transactions = await query;
    const grouped = {};
    for (const t of transactions) {
      const key = `${t.type}:${t.category || "Diğer"}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += t.amount;
    }
    await redis.setEx(cacheKey, 60, JSON.stringify(grouped));
    reply.send(grouped);
  });

  // Bütçe hedeflerine göre durum (cache yok, çünkü genelde daha dinamik)
  fastify.get("/budget-status", async (request, reply) => {
    const user_id = request.user.id;
    const { period, date } = request.query; // ör: period=monthly, date=2024-07-01
    let start, end;
    if (period === "monthly" && date) {
      const d = new Date(date);
      start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-01`;
      end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-31`;
    }
    // Diğer period türleri için ek kod eklenebilir
    const budgets = await db("budgets").where({ user_id });
    const query = db("transactions").where({ user_id });
    if (start) query.andWhere("date", ">=", start);
    if (end) query.andWhere("date", "<=", end);
    const transactions = await query;
    // Her bütçe için harcama/gelir durumu
    const status = budgets.map((budget) => {
      const relevant = transactions.filter(
        (t) =>
          (!budget.category_id || t.category === budget.category_id) &&
          ((budget.period === "monthly" && period === "monthly") || true)
      );
      const spent = relevant
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const earned = relevant
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        budget,
        spent,
        earned,
        remaining: budget.amount - spent,
      };
    });
    reply.send(status);
  });
}

module.exports = analyticsRoutes;
 
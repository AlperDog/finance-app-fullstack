const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const { createUserTable } = require("./models/user");
const transactionRoutes = require("./routes/transaction");
const { createTransactionTable } = require("./models/transaction");
const categoryRoutes = require("./routes/category");
const { createCategoryTable } = require("./models/category");
const budgetRoutes = require("./routes/budget");
const { createBudgetTable } = require("./models/budget");
const analyticsRoutes = require("./routes/analytics");

fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

fastify.get("/", async (request, reply) => {
  return { status: "ok", message: "Kişisel Finans API çalışıyor!" };
});

fastify.register(authRoutes, { prefix: "/auth" });
fastify.register(transactionRoutes, { prefix: "/transactions" });
fastify.register(categoryRoutes, { prefix: "/categories" });
fastify.register(budgetRoutes, { prefix: "/budgets" });
fastify.register(analyticsRoutes, { prefix: "/analytics" });

const start = async () => {
  try {
    await createUserTable();
    await createTransactionTable();
    await createCategoryTable();
    await createBudgetTable();
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    fastify.log.info(`Server running on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

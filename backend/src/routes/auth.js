const { createUser, findUserByEmail } = require("../models/user");
const { signToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");

async function authRoutes(fastify, options) {
  // Kayıt
  fastify.post("/register", async (request, reply) => {
    const { email, password, name } = request.body;
    if (!email || !password) {
      return reply.code(400).send({ error: "Email ve şifre zorunlu." });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return reply.code(400).send({ error: "Bu email zaten kayıtlı." });
    }
    const user = await createUser({ email, password, name });
    const token = signToken({ id: user.id, email: user.email });
    reply.send({ user, token });
  });

  // Giriş
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;
    if (!email || !password) {
      return reply.code(400).send({ error: "Email ve şifre zorunlu." });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return reply.code(400).send({ error: "Kullanıcı bulunamadı." });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.code(400).send({ error: "Şifre hatalı." });
    }
    const token = signToken({ id: user.id, email: user.email });
    reply.send({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  });
}

module.exports = authRoutes;

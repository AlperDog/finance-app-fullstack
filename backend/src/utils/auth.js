const { verifyToken } = require("./jwt");

async function authMiddleware(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new Error("Token yok");
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    request.user = payload;
  } catch (err) {
    reply.code(401).send({ error: "Geçersiz veya eksik token" });
    throw err;
  }
}

module.exports = authMiddleware;

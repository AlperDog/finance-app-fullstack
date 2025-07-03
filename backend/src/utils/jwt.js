const jwt = require("fastify-jwt");
require("dotenv").config();

const secret = process.env.JWT_SECRET || "supersecretkey";

function signToken(payload) {
  return require("jsonwebtoken").sign(payload, secret, { expiresIn: "7d" });
}

function verifyToken(token) {
  return require("jsonwebtoken").verify(token, secret);
}

module.exports = { signToken, verifyToken };

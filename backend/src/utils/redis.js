const Redis = require("redis");
require("dotenv").config();

const client = Redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.connect().catch(console.error);

module.exports = client;

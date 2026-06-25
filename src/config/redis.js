const redis = require("redis");

const redisClient = redis.createClient({ url: "redis://localhost:6379" });

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

module.exports = { redisClient };

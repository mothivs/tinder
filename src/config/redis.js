const redis = require("redis");
const IOredis = require("ioredis");

const redisClient = redis.createClient({
   url: "redis://localhost:6379" 
  });

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

const ioRedisClient = new IOredis(
  "redis://localhost:6379",
  {
  maxRetriesPerRequest: null,
})

ioRedisClient.on("error", (err) => {
  console.error("IORedis client error:", err);
});

module.exports = { redisClient, ioRedisClient };

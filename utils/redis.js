const IORedis = require("ioredis");

const redis =  new IORedis({
  host: "redis-13379.c305.ap-south-1-1.ec2.cloud.redislabs.com",
  port: "13379",
  password: "rRTONzjsDkHzdATDQ7nzcke5ozqrqZwZ",
});

class Redis {
  get(key) {
    return redis.get(key);
  }

  set(key, value) {
    return redis.set(key, value);
  }
}

module.exports = Redis;

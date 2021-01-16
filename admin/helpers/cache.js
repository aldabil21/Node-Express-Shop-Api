const _pool = require("../../config/db");
const util = require("util");
const redis = require("redis");
const url = "redis://127.0.0.1:6379";
const redisClient = redis.createClient(url);
redisClient.get = util.promisify(redisClient.get);

_pool.cache = function (key = "root", seconds = 10) {
  // this.useCache = true;
  this.cacheKey = key;
  this.cacheTime = seconds;
  return this;
};

_pool.query = async function (sql, values, cb) {
  const query = this.format(sql, values);

  if (!this.useCache) {
    // console.log(sql);
    // console.log("SERVED FROM DB");
    return this.execute(query);
  }

  //Using Cache
  //check if key exist
  const key = JSON.stringify(query);
  const _key = this.cacheKey + key;
  const cached = await redisClient.get(_key);
  //Return Cached if Existed
  if (cached) {
    // console.log(`FROM CACHE: ${this.cacheKey}`);
    console.log("SERVED FROM CACHE");
    // console.log(_key);
    const _cached = JSON.parse(cached);
    return [_cached, []];
  }

  //Return From DB if no cached result & Set cached
  const result = await this.execute(query);
  redisClient.set(_key, JSON.stringify(result[0]), "EX", this.cacheTime);
  this.emit("resetCache", this);
  return result;
};

_pool.addListener("resetCache", (_this) => {
  _this.useCache = false;
  _this.cacheKey = "root";
  _this.cacheTime = 10;
});

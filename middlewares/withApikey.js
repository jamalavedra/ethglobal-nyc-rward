const Redis = require("ioredis");
let client = new Redis(process.env.REDIS_CONNECTION);

const getRedisData = async (client, apikey) => {
  let dt = new Date();
  let date =
    String(dt.getMonth() + 1).padStart("2", "0") +
    String(parseInt(dt.getFullYear())).slice(2);

  let promise = new Promise((res, rej) => {
    client
      .multi()
      .get(apikey)
      .get(`${apikey}-usage-${date}`)
      .exec(async (err, data) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
  });
  let result = await promise;
  return result;
};

const withApikey = (next) => async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    let user_apikey = "";

    if (Object.keys(req.query).includes("apikey") === true) {
      user_apikey = req.query.apikey;
    } else if (Object.keys(req.headers).includes("x-api-key") === true) {
      user_apikey = req.headers["x-api-key"];
    } else {
      return res.status(401).json({
        success: false,
        error: "No API key",
      });
    }
    const CAP = 10000000; //10M
    let data = await getRedisData(client, user_apikey);

    let dt = new Date();
    let date =
      String(dt.getMonth() + 1).padStart("2", "0") +
      String(parseInt(dt.getFullYear())).slice(2);

    console.log(data);
    if (data[0][1] == "true") {
      // Valid API key
      if (data[1][1] && parseInt(data[1][1]) >= CAP) {
        // Over the limit
        res.setHeader("X-Rate-Limit-Limit", CAP);
        res.setHeader("X-Rate-Limit-Remaining", 0);
        return res.status(429).end("Rate limit exceeded");
      } else {
        client.incr(`${user_apikey}-usage-${date}`);
        res.setHeader("X-Rate-Limit-Limit", CAP);
        res.setHeader("X-Rate-Limit-Remaining", CAP - parseInt(data[1][1]) - 1);
        return await next(req, res);
      }
    } else {
      return res.status(401).json({
        success: false,
        error: "Invalid API key.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      origin: "withApikey",
      error: error,
    });
  }
};

export default withApikey;

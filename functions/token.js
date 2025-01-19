const jwt = require("jsonwebtoken");

const key =
  "UwSK1zEaX1F4PmPncjdnnGYGGGYFhh%%55567S7D7HBCDSGGuHASIQHSHBDS$$$$Ry14wcIP9yn93x7J";

const generateToken = (data) =>
  jwt.sign(data, key, { expiresIn: "365000000000000000000000000days" });

const authenticate = async (req, resp) =>
  new Promise((resolve, reject) => {
    const token = req.headers.authorization;

    if (!token) return resp.send({ status: "FAILURE", msg: "Token not found" });

    jwt.verify(token.split(" ")[1], key, (err, decoded) => {
      if (err) {
        reject({ status: "FAILURE", msg: "Invalid token" });
        resp.fail("Invalid token");
      } else {
        req.user = decoded._id;
        return resolve(decoded._id);
      }
    });
  });

module.exports = { generateToken, authenticate };

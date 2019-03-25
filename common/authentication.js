const jwt = require("jsonwebtoken");
const models = require("../common/helpers");
const jwtDecode = require('jwt-decode')
const errorHelper = require('../error-helper/errorHelper')
const genToken = user => {
  return new Promise((res, rej) => {
    jwt.sign(user, "SECRET KEY", { expiresIn: "1h" }, (err, token) => {
      if (err) {
        rej(err);
      } else {
        res(token);
      }
    });
  });
};

const authenticate = (req, res, next) => {
  const token = req.get("Authorization");

  if (token) {
    jwt.verify(token, "SECRET KEY", (error, decoded) => {
      if (error) {
        res.status(401).json({ message: "You are not authorized" });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "You are not authorized" });
  }
};
const authenticateV2 = async (req, res, next) => {
  const token = req.get("Authorization");
  try {

    if (token) {
      const decoded = jwtDecode(token);
      console.log('---- decoded ---', decoded);
      const user = await models.findBy("usersV2", { email: decoded.email }).returning('id');

      if (user) {
        next()
      } else {
        res.status(401).json({ message: "You are not authorized" });

      }


    } else {
      res.status(401).json({ message: "You need to passed Headers !" });
    }

  } catch (err) {
    return errorHelper(500, error, res)
  }
};

module.exports = {
  genToken,
  authenticate,
  authenticateV2
};

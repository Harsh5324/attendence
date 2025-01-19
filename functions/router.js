const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const router = {
  get: (path, func) => {
    app.get(path, (req, resp, next) => {
      resp.suc = (data) => resp.send({ status: "SUCCESS", data });
      resp.fail = (msg) => resp.send({ status: "FAILURE", msg });

      func(req, resp, next);
    });
  },
  post: (path, func) => {
    app.post(path, (req, resp, next) => {
      resp.suc = (data) => resp.send({ status: "SUCCESS", data });
      resp.fail = (msg) => resp.send({ status: "FAILURE", msg });

      func(req, resp, next);
    });
  },
};

module.exports = { router, app, express };

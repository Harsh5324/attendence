const { getData } = require("../../functions/db");
const { authenticate } = require("../../functions/token");

const machines = async (req, resp) => {
  try {
    const admin = await authenticate(req, resp);

    let data = await getData(
      null,
      "machines",
      `admin = ${admin}`,
      null,
      null,
      "createdAt"
    );

    data = data.map((item) => ({
      ...item,
      nickName: `${item.head}/${item.area} ${item.name}`,
    }));

    resp.suc(data);
  } catch (err) {
    console.log("🚀 ~ file: machines.js:5 ~ machines ~ err:", err);
    resp.fail();
  }
};

module.exports = machines;

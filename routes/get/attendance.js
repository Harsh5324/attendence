const { getData } = require("../../functions/db");

const attendance = async (req, resp) => {
  try {
    let { startDate, endDate } = req.query;

    startDate = new Date(startDate).toISOString().split("T")[0];
    endDate = new Date(endDate);
    endDate = endDate.setDate(endDate.getDate() + 1);
    endDate = new Date(endDate).toISOString().split("T")[0];

    const data = await getData(
      null,
      "attendence",
      `createdAt BETWEEN '${startDate}' AND '${endDate}'`,
      null,
      null,
      "createdAt"
    );

    await Promise.all(
      data.map(async (item) => {
        try {
          const [{ name: employeeName }] = await getData(
            "name",
            "employees",
            `_id = ${item.employee}`
          );

          const [machine] = await getData(
            null,
            "machines",
            `_id = ${item.machine}`
          );

          item.machineName = `${machine.head}/${machine.area} ${machine.name}`;

          item.employeeName = employeeName;
        } catch (err) {
          console.log("🚀 ~ file: attendance.js:25 ~ attendance ~ err:", err);
        }
      })
    );

    resp.suc(data);
  } catch (err) {
    console.log("��� ~ file: attendance.js:4 ~ attendance ~ err:", err);
    resp.fail();
  }
};

module.exports = attendance;

const { getData } = require("../../functions/db");

const machineHistory = async (req, resp) => {
  try {
    let { machine, date } = req.query;

    const startDate = new Date(date).setDate(1);
    const endDate = new Date(date);

    let from = new Date(startDate).toISOString().split("T")[0];
    let to = new Date(endDate);
    to = to.setDate(to.getDate() + 1);
    to = new Date(to).toISOString().split("T")[0];

    const attendance = await getData(
      null,
      "attendence",
      `machine = ${machine} && createdAt BETWEEN '${from}' AND '${to}'`
    );

    let att = attendance.filter((i) => {
      return new Date(i.createdAt).getDate() == endDate.getDate();
    });

    att = await Promise.all(
      att?.map(async (item) => {
        try {
          const [machine] = await getData(
            null,
            "machines",
            `_id = ${item.machine}`
          );

          const [employee] = await getData(
            null,
            "employees",
            `_id = ${item.employee}`
          );

          return {
            ...item,
            machineName: `${machine?.head}/${machine?.area} ${machine?.name}`,
            employeeName: employee?.name,
          };
        } catch (err) {
          console.log(
            "🚀 ~ file: userDetails.js:40 ~ att=attendance?.map ~ err:",
            err
          );
        }
      })
    );

    att = att.filter((item) => item !== null);

    const data = Array(endDate.getDate() - 1)
      .fill({ active: false })
      .map((item, index) => {
        const isActive =
          attendance.some(
            (i) => new Date(i.createdAt).getDate() == index + 1 && i.shift == 0
          ) ||
          attendance.some(
            (i) => new Date(i.createdAt).getDate() == index + 1 && i.shift == 1
          );

        return { isActive, date: index + 1 };
      });

    resp.suc({ history: data, attendance: att });
  } catch (err) {
    console.log("��� ~ file: machineHistory.js:4 ~ machineHistory ~ err:", err);
    resp.fail();
  }
};

module.exports = machineHistory;

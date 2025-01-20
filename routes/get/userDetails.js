const moment = require("moment");
const { getData } = require("../../functions/db");
const groupBy = require("lodash.groupby");

const userDetails = async (req, resp) => {
  try {
    const { id } = req.params;

    let { date } = req.query;

    const [user] = await getData(null, "employees", `_id = '${id}'`);

    const userSingleMachineSalary = parseFloat(user.singleMachineSalary);
    const userDubleMachineSalary = parseFloat(user.dubleMachineSalary);

    const startDate = new Date(date).setDate(1);
    const endDate = new Date(date);

    let from = new Date(startDate).toISOString().split("T")[0];
    let to = new Date(endDate);
    to = to.setDate(to.getDate() + 1);
    to = new Date(to).toISOString().split("T")[0];

    const attendance = await getData(
      null,
      "attendence",
      `employee = ${id} && createdAt BETWEEN '${from}' AND '${to}'`
    );

    let advance = await getData(null, "advance", `user = ${id}`);

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

    const calendar = Array(endDate.getDate() - 1)
      .fill({ active: false })
      .map((item, index) => {
        const att = attendance.filter(
          (i) => new Date(i.createdAt).getDate() == index + 1
        );

        const machines = att.length;

        return { machines, date: index + 1 };
      });

    let salaryAttendance = await getData(
      null,
      "attendence",
      `employee = ${id}`,
      null,
      null,
      "createdAt"
    );

    salaryAttendance = salaryAttendance.map((i) => ({
      ...i,
      date: moment(i.createdAt).format("DD/MM/YYYY"),
      monthYear: moment(i.createdAt).format("MMM YYYY"),
    }));

    advance = advance.map((i) => ({
      ...i,
      date: moment(i.createdAt).format("DD/MM/YYYY"),
      monthYear: moment(i.createdAt).format("MMM YYYY"),
    }));

    salaryAttendance = groupBy(salaryAttendance, "monthYear");

    const attendances = [];

    Object.keys(salaryAttendance).forEach((monthYear) => {
      const attendanceByDate = {};
      salaryAttendance[monthYear].forEach((attendance) => {
        const date = attendance.date;
        attendanceByDate[date] = (attendanceByDate[date] || 0) + 1;
      });

      const hasDoubleAttendance = Object.values(attendanceByDate).some(
        (count) => count === 2
      );

      let salary = hasDoubleAttendance
        ? userDubleMachineSalary
        : userSingleMachineSalary;

      const year = parseFloat(monthYear.split(" ")[1]);
      const isFebruary = monthYear.split(" ")[0]?.toUpperCase() === "FEB";
      const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

      const requiredMachineScan = !isFebruary ? 60 : isLeapYear ? 58 : 56;
      const perMachineScanSalary = Math.floor(salary / 60);
      const machineNotScanned =
        requiredMachineScan - salaryAttendance[monthYear].length;
      const salaryCut = machineNotScanned * perMachineScanSalary;

      let totalAdvance = 0;

      advance
        ?.filter((i) => i.monthYear === monthYear)
        ?.forEach((item) => {
          totalAdvance += parseFloat(item.amount);
        });

      salary -= salaryCut + totalAdvance;

      attendances.push({
        monthYear,
        salary,
        advance: totalAdvance || undefined,
      });
    });

    resp.suc({
      user,
      attendance: att,
      calendar,
      salary: attendances,
      advance,
    });
  } catch (err) {
    console.log("��� ~ file: userDetails.js:3 ~ userDetails ~ err:", err);
    resp.fail();
  }
};

module.exports = userDetails;

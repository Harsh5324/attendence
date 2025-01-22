const moment = require("moment");
const { getData } = require("../../functions/db");
const groupBy = require("lodash.groupby");

const userDetails = async (req, resp) => {
  try {
    const { id } = req.params;

    let { date } = req.query;

    const [user] = await getData(null, "employees", `_id = '${id}'`);

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

    let advance = await getData(
      null,
      "advance",
      `user = ${id}`,
      null,
      null,
      "createdAt"
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
      let userSpecificDoubleSalary = 0;
      let userSpecificSingleSalary = 0;

      // Iterate through attendance and extract salary details
      salaryAttendance[monthYear].forEach((attendance) => {
        const date = attendance.date;
        attendanceByDate[date] = (attendanceByDate[date] || 0) + 1;

        userSpecificDoubleSalary = parseFloat(
          JSON.parse(attendance.salary).dubleMachineSalary
        );
        userSpecificSingleSalary = parseFloat(
          JSON.parse(attendance.salary).singleMachineSalary
        );
      });

      const hasDoubleAttendance = Object.values(attendanceByDate).some(
        (count) => count === 2
      );

      let salary = hasDoubleAttendance
        ? userSpecificDoubleSalary
        : userSpecificSingleSalary;

      // Fixed per-day salary cut (30,000 ÷ 30)
      const perDaySalaryCut = salary / 30;

      // Total days in the current month
      const [month, year] = monthYear.split(" ");
      const totalDaysInMonth = new Date(
        parseInt(year),
        new Date(Date.parse(month + " 1")).getMonth() + 1,
        0
      ).getDate();

      // Days not scanned
      const machineNotScanned =
        totalDaysInMonth - Object.keys(attendanceByDate).length;

      const salaryCut = machineNotScanned * perDaySalaryCut;

      console.log(
        `Month: ${monthYear}, Machine Not Scanned: ${machineNotScanned}`
      );
      console.log(`Salary Cut: ₹${salaryCut}`);

      // Calculate advances for the month
      let totalAdvance = advance
        .filter((i) => i.monthYear === monthYear)
        .reduce((acc, item) => acc + parseFloat(item.amount), 0);

      // Final salary after deductions
      salary -= salaryCut + totalAdvance;

      attendances.push({
        monthYear,
        salary: Math.floor(salary), // Round salary to nearest integer
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

const { Router } = require("express");
const { getApproval, deleteApproval } = require("../data/approvals");
const {
  createTrip,
  assertTripData,
  getTrip,
  getUserTrips,
  addTripExpenses,
  deleteTrip,
  removeTripExpenses,
} = require("../data/trips");
const {
  getAllExpensesByTrip,
  getExpense,
  addExpense,
} = require("../data/expenses");
const { getUser, getAllUsers } = require("../data/users");
const {
  assertObjectIdString,
  assertNonEmptyArray,
} = require("../utils/assertion");
const { HttpError } = require("../utils/errors");
const { getTemplateData } = require("../utils/routes");

const assertTripID = (id) => assertObjectIdString(id, "Trip ID");
const assertExpenseID = (id) => assertObjectIdString(id, "Expense ID");

const dataExist = (id, data, desc = "data") => {
  if (!data) throw new HttpError(`Cannot find ${desc} with ID: ${id}`, 404);
};

const approvalExist = (id, approval) => dataExist(id, approval, "approval");
const tripExist = (id, trip) => dataExist(id, trip, "trip");
const expenseExist = (id, trip) => dataExist(id, trip, "expense");

const getAuthorizedTrip = async (user, id) => {
  assertTripID(id);

  const trip = await getTrip(id);
  tripExist(id, trip);

  if (
    user.corporateId !== trip.corporateId ||
    !trip.employeeIdList.includes(user._id)
  ) {
    throw new HttpError("Unauthorized approval thread", 401);
  }

  return trip;
};

const getAuthorizedTripData = async (user, id) => {
  const trip = await getAuthorizedTrip(user, id);

  const approvalId = trip.approvalId;
  const approval = await getApproval(approvalId);
  approvalExist(id, approval);

  const expenses = await getAllExpensesByTrip(id);
  // const expenses = await Promise.all(trip.expenseIdList.map(expenseId => getExpense(expenseId)));

  return {
    approval,
    trip,
    expenses,
  };
};

const getAuthorizedExpense = async (user, expenseId) => {
  const userId = user._id;
  const expense = await getExpense(expenseId);
  expenseExist(expenseId, expense);

  if (expense.userId !== userId) {
    throw new HttpError(`Unauthorized to add expense ${expenseId}.`, 401);
  }

  return expense;
};

const router = Router();
router.get('/new', async (req, res, next) => {
  try {
    const { user } = req.session;
    const trips = await getUserTrips(user._id);
    const users = await getAllUsers(user);

    res.render("trip/new", { users, trips, ...getTemplateData(req, {title:'New Trip'}) });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    const trips = await getUserTrips(user._id);

    res.render("trip/index", { trips, ...getTemplateData(req, {title:'My Trips'})});
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    const corporateId = user.corporateId;
    const tripData = req.body;
    tripData.userId = user._id;
    tripData.corporateId = corporateId;
    tripData.startTime = Number(tripData.startTime);
    tripData.endTime = Number(tripData.endTime);
    assertTripData(tripData);

    const { managerId, employeeIdList } = tripData;
    const manager = await getUser(managerId);
    if (manager.corporateId !== corporateId) {
      throw new HttpError(`Invalid corporate manager ${managerId}`, 400);
    }

    await Promise.all(
      employeeIdList.map(async (employeeId, userId) => {
        const employee = await getUser(employeeId);

        if (employee.corporateId !== corporateId) {
          throw new HttpError(`Invalid corporate employee ${userId}`, 400);
        }

        if (employee.rank >= manager.rank) {
          throw new HttpError(`Invalid employee hierarchy for ${userId}`, 400);
        }
      })
    );

    const trip = await createTrip(tripData);
    tripExist("", trip);

    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    assertTripID(id);

    const { user } = req.session;
    const { trip, approval, expenses } = await getAuthorizedTripData(user, id);
    const approvalInfo = {
      status: approval.status,
      updatedAt: approval.updatedAt,
    };
    const total = expenses.reduce(
      (total, expense) => expense.payment.amount + total,
      0
    );

    for (const employeeId of trip.employeeIdList) {

    }
    const employees = await Promise.all(trip.employeeIdList.map(id => getUser(id)));
    const employeeById = employees.reduce((result, employee) => {
      result[employee._id] = employee;
      return result;
    }, {});

    res.render("trip/details", {
      trip,
      approvalInfo,
      total,
      startTime: new Date(trip.startTime).toLocaleString(),
      endTime: new Date(trip.endTime).toLocaleString(),
      expenses: expenses.map((expense) => ({
        ...expense,
        user: employeeById[expense.userId],
        isMine: expense.userId === user._id,
      })),
      manager: employeeById[trip.managerId],
      employees: employees.filter((employee) => employee._id !== trip.managerId),
      // TODO: corporate
      ...getTemplateData(req),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    assertTripID(id);

    const { user } = req.session;
    const trip = await getAuthorizedTrip(user, id);

    const deletedApproval = await deleteApproval(trip.approvalId);
    const deletedTrip = await deleteTrip(id);
    tripExist(id, deletedTrip);

    res.status(200).json(deletedTrip);
  } catch (error) {
    next(error);
  }
});

const getAddableExpense = async (user, expenseId) => {
  const expense = await getAuthorizedExpense(user, expenseId);

  if (!!expense.tripId) {
    throw new HttpError(`Expense ${expenseId} belongs to another trip`, 400);
  }

  return expense;
};

const addAuthorizedTripExpenses = async (user, tripId, expenseIdList) => {
  const trip = await getAuthorizedTrip(user, tripId);

  await Promise.all(
    expenseIdList.map((expenseId) => getAddableExpense(user, expenseId))
  );

  const updatedTrip = await addTripExpenses(tripId, user._id, expenseIdList);
  tripExist(tripId, updatedTrip);

  return updatedTrip;
};

router.put("/:id/expense/:expenseId", async (req, res, next) => {
  try {
    const { id, expenseId } = req.params;
    assertTripID(id);
    assertExpenseID(expenseId, "Expense ID");

    const { user } = req.session;
    const updatedTrip = await addAuthorizedTripExpenses(user, id, [expenseId]);

    res.status(200).json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

router.put("/:id/expenses", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expenseIdList } = req.body;
    assertTripID(id);
    assertNonEmptyArray(expenseIdList);
    expenseIdList.forEach((expenseId) => assertExpenseID(expneseId));

    const { user } = req.session;
    const updatedTrip = await addAuthorizedTripExpenses(
      user,
      id,
      expenseIdList
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

const assertExpenseData = (data) => {
  assertRequiredObject(data);

  const { userId, tripId, name, date, amount, currency, method } = data;
  assertObjectIdString(userId, "User ID");
  assertObjectIdString(tripId, "Trip ID");
  assertIsValuedString(name, "Expense name");
  assertDateString(date, "Payment date");
  assertRequiredNumber(amount, "Expense amount");
  assertIsValuedString(currency, "Expense curreny");
  assertIsValuedString(method, "Payment method");
};

router.post("/:id/expense", async (req, res, next) => {
  try {
    const { id } = req.params;
    assertTripID(id);

    const expenseData = req.body;
    assertExpenseData(expenseData);

    const { user } = req.session;
    const trip = await getAuthorizedTrip(user, id);

    const newExpense = await addExpense(expenseData);
    if (!newExpense) {
      throw new HttpError("Cannot add new expense", 500);
    }

    const updatedTrip = await addAuthorizedTripExpenses(
      user,
      trip._id,
      newExpense._id
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

const removeAuthorizedTripExpenses = async (user, tripId, expenseIdList) => {
  // const trip = await getAuthorizedTrip(user, tripId);
  // const existingExpenseIdSet = new Set(trip.expenseIdList);
  const { trip, expenses } = await getAuthorizedTripData(user, tripId);
  const existingExpenseIdSet = new Set(expenses.map(expense => expense._id));
  const invalidIdList = expenseIdList.filter(
    (expenseId) => !existingExpenseIdSet.has(expenseId)
  );

  if (invalidIdList.length > 0) {
    throw new HttpError(
      `Expense(s) not in trip ${tripId}: ${invalidIdList}`,
      400
    );
  }

  await Promise.all(
    expenseIdList.map((expenseId) => getAuthorizedExpense(user, expenseId))
  );

  const updatedTrip = await removeTripExpenses(tripId, user._id, expenseIdList);
  tripExist(tripId, updatedTrip);

  return updatedTrip;
};

router.delete("/:id/expense/:expenseId", async (req, res, next) => {
  try {
    const { id, expenseId } = req.params;
    assertTripID(id);
    assertExpenseID(expenseId, "Expense ID");

    const { user } = req.session;
    const updatedTrip = await removeAuthorizedTripExpenses(user, id, [
      expenseId,
    ]);

    res.status(200).json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/expenses", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expenseIdList } = req.body;
    assertTripID(id);
    assertNonEmptyArray(expenseIdList);
    expenseIdList.forEach((expenseId) => assertExpenseID(expenseId));

    const { user } = req.session;
    const updatedTrip = await removeAuthorizedTripExpenses(
      user,
      id,
      expenseIdList
    );

    res.redirect(`/trip/${id}`);
    // res.status(200).json(updatedTrip);
  } catch (error) {
    next(error);
  }
});


router.get("/:id/expense/:expenseId/edit", async (req, res, next) => {
  try {
    const { id, expenseId } = req.params;
    assertTripID(id);
    assertExpenseID(expenseId);

    const { user } = req.session;
    const trip = await getAuthorizedTrip(user, id);
    const expense = await getAuthorizedExpense(user, expenseId);
    const paymentMethodChecked = {
      'cash': false,
      'card': false,
      'gpay': false,
      'apple': false,
    };
    paymentMethodChecked[expense.payment.method] = true;
    res.render("trip/expense", {
      trip,
      expense: {
        ...expense,
        paymentMethodChecked,
        paymentDateValue: new Date(expense.payment.date).toISOString().split('T')[0],
      },
      ...getTemplateData(req, { title: `Edit Trip Expense (${trip.name})` }),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

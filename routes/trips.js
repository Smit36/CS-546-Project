const { Router } = require("express");
const {
  getApproval,
  // deleteApproval,
} = require("../data/approvals");
const {
  createTrip,
  // assertTripData,
  getTrip,
  // getUserTrips,
  addTripExpenses,
  deleteTrip,
  // removeTripExpenses,
} = require("../data/trips");
const {
  getAllExpensesByTrip,
  getExpense,
  addExpense,
} = require("../data/expenses");
const {
  assertObjectIdString,
  assertNonEmptyArray,
} = require("../utils/assertion");
const { HttpError } = require("../utils/errors");

const assertTripID = (id) => assertObjectIdString(id, "Trip ID");
const assertExpenseID = (id) => assertObjectIdString(id, "Expense ID");

const dataExist = (id, data, desc = "data") => {
  if (!data) throw new HttpError(`Cannot find approval with ID: ${id}`, 404);
};

const approvalExist = (id, approval) => dataExist(id, approval, "approval");
const tripExist = (id, trip) => dataExist(id, trip, "trip");
const expenseExist = (id, trip) => dataExist(id, trip, "expense");

const getAuthorizedTrip = async (user, id) => {
  assertTripID(id);

  const trip = await getTrip(id);
  tripExist(id, trip);

  if (
    user.corporteId !== trip.corporateId ||
    !trip.employeeIdList.contains(user)
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

  const expenses = await getAllExpensesByTrip(tripId);

  return {
    approval,
    trip,
    expenses,
    // TODO: expense payments
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

// TODO: get user trips
router.get("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    //const trips = await getUserTrips(user, id);
    const trips = [];

    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    const tripData = req.body;
    tripData.userId = user._id;
    // TODO: trip data error handling
    // assertTripData(tripData);

    // TODO: integrate user data functions
    // const { managerId, employeeIdList } = tripData;
    // const manager = await getUser(managerId);
    // if (!manager.corporateId !== corporateId) {
    //   throw new HttpError(`Invalid corporate manager ${managerId}`, 400);
    // }

    // await Promise.all(
    //   employeeIdList.map(async (employeeId, userId) => {
    //     const employee = await getUser(employeeId);

    //     if (employee.corporateId !== corporateId) {
    //       throw new HttpError(`Invalid corporate employee ${userId}`, 400);
    //     }

    //     if (employee.rank >= manager.rank) {
    //       throw new HttpError(`Invalid employee hierarchy for ${userId}`, 400);
    //     }
    //   })
    // );

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

    res.status(200).json({
      ...trip,
      expenses,
      approval: approvalInfo,
      // TODO: total
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

    // TODO: delete approval data function
    // const deletedApproval = await deleteApproval(trip.approvalId);
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

  const updatedTrip = await addTripExpenses(id, user._id, expenseIdList);
  tripExist(id, updatedTrip);

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

router.post("/:id/expense", async (req, res, next) => {
  try {
    const { id } = req.params;
    const expenseData = req.body;

    assertTripID(id);
    // TODO: expense data error handling

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
  const trip = await getAuthorizedTrip(user, tripId);

  const existingExpenseIdSet = new Set(trip.expneseIdList);
  const invalidIdList = expneseIdList.filter(
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

  // TODO: removal data function
  // const updatedTrip = await removeTripExpenses(id, user._id, expenseIdList);
  // tripExist(id, updatedTrip);

  // return updatedTrip;
  return null;
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

    res.status(200).json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

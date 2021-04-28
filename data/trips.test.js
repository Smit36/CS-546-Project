const { ObjectId } = require("mongodb");
const { connect, disconnect } = require("../config/mongoConnection");
const { ValidationError, QueryError } = require("../utils/errors");
const { stringifyObjectId } = require("../utils/mongodb");

const {
  createTrip,
  getTrip,
  deleteTrip,
  addTripExpenses,
} = require("./trips");

const expectAsyncError = async (promise, error) =>
  await expect(promise).rejects.toThrow(error);
const expectAsyncValidationError = async (promise) =>
  await expectAsyncError(promise, ValidationError);
const expectAsyncQueryError = async (promise) =>
  await expectAsyncError(promise, QueryError);

let db;

beforeAll(async () => {
  const testDb = await connect();
  db = testDb;

  if (!!db) {
  }
});

afterAll(async () => {
  if (!!db) {
    await db.dropDatabase();
  }
  await disconnect();
});

describe("Trips data function", () => {
  const testTimestamp1 = new Date().getTime();
  const testTimestamp2 = new Date().getTime();
  const testTimestamp3 = new Date().getTime();

  const testUserId1 = new ObjectId();
  const testUserId2 = new ObjectId();
  const testUserId3 = new ObjectId();
  const testUserId4 = new ObjectId();
  const testUserId5 = new ObjectId();

  const testCorporateId1 = new ObjectId();
  const testCorporateId2 = new ObjectId();

  const testTripData1 = {
    userId: stringifyObjectId(testUserId1),
    corporateId: stringifyObjectId(testCorporateId1),
    managerId: stringifyObjectId(testUserId1),
    employeeIdList: [stringifyObjectId(testUserId2)],
    name: "Business trip to Death Star",
    description: "Business trip to Death Star traveling on the Star Destroyer",
    startTime: testTimestamp1,
    endTime: testTimestamp3,
  };


  const testTripData2 = {
    userId: stringifyObjectId(testUserId3),
    corporateId: stringifyObjectId(testCorporateId2),
    managerId: stringifyObjectId(testUserId3),
    employeeIdList: [stringifyObjectId(testUserId4), stringifyObjectId(testUserId5)],
    name: "Business trip to Terra",
    description: "Intersteller business trip to Earth for secret meeting",
    startTime: testTimestamp1,
    endTime: testTimestamp3,
  };

  let testTrip1 = null;
  let testTrip2 = null;
  let testTripId2 = null;

  describe("createTrip", () => {
    test("invalid input data", async () => {
      await expectAsyncValidationError(createTrip());
      await expectAsyncValidationError(createTrip(123));
      await expectAsyncValidationError(createTrip("asdfasdf"));
      await expectAsyncValidationError(createTrip({}));
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          userId: "",
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          userId: 123,
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          corporateId: new ObjectId(testTripData1.userId),
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          corporateId: null,
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          managerId: [stringifyObjectId(testUserId1)],
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          managerId: "123asdf",
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          employeeIdList: stringifyObjectId(testUserId1),
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          employeeIdList: [testUserId1],
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          name: "",
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          name: 1234,
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          description: "  ",
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          description: ["Some", "string", "array"],
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          startTime: new Date,
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          startTime: "2020/02/02",
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          endTime: undefined,
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          endTime: {},
        })
      );
      await expectAsyncValidationError(
        createTrip({
          ...testTripData1,
          createdAt: new Date(),
        })
      );
    });

    test("create and seed", async () => {
      const userId = stringifyObjectId(testUserId1);
      const createResult1 = await createTrip(testTripData1);
      expect(createResult1).toMatchObject({
        corporateId: stringifyObjectId(testCorporateId1),
        managerId: userId,
        employeeIdList: [userId, stringifyObjectId(testUserId2)],
        expenseIdList: [],
        createdBy: userId,
        updatedBy: userId,
      });

      testTrip1 = createResult1;
      testTrip2 = await createTrip(testTripData2);
    });
  });

  describe("getTrip", () => {
    test("invalid ID", async () => {
      await expectAsyncValidationError(getTrip());
      await expectAsyncValidationError(getTrip(" "));
      await expectAsyncValidationError(getTrip(123));
      await expectAsyncValidationError(getTrip("asdfasdf"));
      await expectAsyncValidationError(getTrip(new ObjectId()));
    });

    test("non-existant ID", async () => {
      const nullTrip = await getTrip(stringifyObjectId(new ObjectId()));
      expect(nullTrip).toEqual(null);
    });

    test("get test trip 1 and 2", async () => {
      const getResult1 = await getTrip(testTrip1._id);
      expect(getResult1).toEqual(testTrip1);
      const getResult2 = await getTrip(testTrip2._id);
      expect(getResult2).toEqual(testTrip2);
    });
  });

  describe("deleteTrip", () => {
    test("invalid ID", async () => {
      await expectAsyncValidationError(getTrip());
      await expectAsyncValidationError(getTrip(" "));
      await expectAsyncValidationError(getTrip(123));
      await expectAsyncValidationError(getTrip("asdfasdf"));
      await expectAsyncValidationError(getTrip(new ObjectId()));
    });

    test('delete non-existant', async () => {
      await expectAsyncQueryError(
        deleteTrip(stringifyObjectId(new ObjectId()))
      );
    });

    test('delete test trip 2', async () => {
      const deletedTrip = await deleteTrip(testTrip2._id);
      expect(deletedTrip).toEqual(testTrip2);
      testTrip2 = null;
    });
  });

  describe("addTripExpenses", () => {
    const testExpenseId1 = new ObjectId();
    const testExpenseId2 = new ObjectId();

    test("invalid trip ID", async () => {
      await expectAsyncValidationError(addTripExpenses(testTrip1._id));
      await expectAsyncValidationError(addTripExpenses(" "));
      await expectAsyncValidationError(addTripExpenses(123));
      await expectAsyncValidationError(addTripExpenses("asdfasdf"));
      await expectAsyncValidationError(addTripExpenses(new ObjectId()));
    });

    test("invalid updater user ID list", async () => {
      const tripId = testTrip1._id;
      await expectAsyncValidationError(addTripExpenses(tripId));
      await expectAsyncValidationError(addTripExpenses(tripId, " "));
      await expectAsyncValidationError(addTripExpenses(tripId, 123));
      await expectAsyncValidationError(addTripExpenses(tripId, "asdfasdf"));
      await expectAsyncValidationError(addTripExpenses(tripId, new ObjectId()));
    });
  
    test("invalid expenses ID list", async () => {
      const tripId = testTrip1._id;
      const userId = stringifyObjectId(testUserId1);
      await expectAsyncValidationError(addTripExpenses(tripId, userId));
      await expectAsyncValidationError(addTripExpenses(tripId, userId, " "));
      await expectAsyncValidationError(addTripExpenses(tripId, userId, 123));
      await expectAsyncValidationError(addTripExpenses(tripId, userId, "asdfasdf"));
      await expectAsyncValidationError(addTripExpenses(tripId, userId, new ObjectId()));
      await expectAsyncValidationError(addTripExpenses(tripId, userId, stringifyObjectId(testExpenseId1)));
      await expectAsyncValidationError(addTripExpenses(tripId, userId, [new ObjectId()]));
    });

    test("non-existant trip ID", async () => {
      await expectAsyncQueryError(
        addTripExpenses(stringifyObjectId(new ObjectId()), stringifyObjectId(testUserId1), [
          stringifyObjectId(testExpenseId1),
        ])
      );
    });

    test("add expenses to trip", async () => {
      const tripId = testTrip1._id;
      const userId = stringifyObjectId(testUserId1);
      const expenseId1 = stringifyObjectId(testExpenseId1);
      const expenseId2 = stringifyObjectId(testExpenseId2);
      
      const updateResult1 = await addTripExpenses(tripId, userId, [expenseId1]);

      expect(updateResult1).toMatchObject({
        ...testTrip1,
        expenseIdList: [expenseId1],
        updatedBy: userId,
        updatedAt: updateResult1.updatedAt,
      });
      expect(updateResult1.updatedAt).toBeGreaterThan(testTrip1.updatedAt);

      const updateResult2 = await addTripExpenses(tripId, userId, [expenseId1, expenseId2]);
      expect(updateResult2).toMatchObject({
        ...testTrip1,
        expenseIdList: [expenseId1, expenseId2],
        updatedBy: userId,
        updatedAt: updateResult2.updatedAt,
      });
      expect(updateResult2.updatedAt).toBeGreaterThan(updateResult1.updatedAt);

      const updateResult3 = await addTripExpenses(tripId, userId, [expenseId2]);
      expect(updateResult3).toMatchObject({
        ...testTrip1,
        expenseIdList: [expenseId1, expenseId2],
        updatedBy: userId,
        updatedAt: updateResult3.updatedAt,
      });

      testTrip1 = updateResult3;
    });
  });
});

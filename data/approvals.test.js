const { ObjectId } = require("mongodb");
const { connect, disconnect } = require("../config/mongoConnection");
const { ValidationError, QueryError } = require("../utils/errors");
const { stringifyObjectId } = require("../utils/mongodb");

const {
  APPROVAL_STATUS,
  createApproval,
  getApproval,
  updateApproval,
} = require("./approvals");

const expectAsyncError = async (promise, error) =>
  await expect(promise).rejects.toThrow(error);
const expectAsyncValidationError = async (promise) =>
  await expectAsyncError(promise, ValidationError);
const expectAsyncQeuryError = async (promise) =>
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

describe("Approvals data function", () => {
  const testTimestamp1 = new Date().getTime();
  const testTimestamp2 = new Date().getTime();
  const testTimestamp3 = new Date().getTime();
  const testTimestamp4 = new Date().getTime();

  const testUserId1 = new ObjectId();
  const testUserId2 = new ObjectId();

  const testTripId1 = new ObjectId();
  const testTripId2 = new ObjectId();

  const testApprovalData1 = {
    tripId: stringifyObjectId(testTripId1),
    userId: stringifyObjectId(testUserId1),
    createdAt: testTimestamp1,
  };

  const testApprovalData2 = {
    tripId: stringifyObjectId(testTripId2),
    userId: stringifyObjectId(testUserId1),
    createdAt: testTimestamp2,
  };

  const testUpdateData = {
    userId: stringifyObjectId(testUserId2),
    status: APPROVAL_STATUS.PENDING,
    message: "please approve thanks",
    createdAt: testTimestamp3,
  };

  let testApproval1 = null;
  let testApproval2 = null;

  describe("createApproval", () => {
    test("invalid input data", async () => {
      await expectAsyncValidationError(createApproval());
      await expectAsyncValidationError(createApproval(123));
      await expectAsyncValidationError(createApproval("asdfasdf"));
      await expectAsyncValidationError(createApproval({}));
      await expectAsyncValidationError(
        createApproval({
          ...testApprovalData1,
          tripId: "",
        })
      );
      await expectAsyncValidationError(
        createApproval({
          ...testApprovalData1,
          tripId: 123,
        })
      );
      await expectAsyncValidationError(
        createApproval({
          ...testApprovalData1,
          userId: new ObjectId(testApprovalData1.userId),
        })
      );
      await expectAsyncValidationError(
        createApproval({
          ...testApprovalData1,
          createdAt: null,
        })
      );
      await expectAsyncValidationError(
        createApproval({
          ...testApprovalData1,
          createdAt: new Date(),
        })
      );
    });

    test("create and seed", async () => {
      const createResult1 = await createApproval(testApprovalData1);
      expect(createResult1).toMatchObject({
        tripId: stringifyObjectId(testTripId1),
        status: APPROVAL_STATUS.CREATED,
        createdAt: testTimestamp1,
        updatedAt: testTimestamp1,
      });
      expect(createResult1.updates).toHaveProperty("length", 1);
      expect(createResult1.updates[0]).toMatchObject({
        userId: stringifyObjectId(testUserId1),
        status: APPROVAL_STATUS.CREATED,
        message: "",
        createdAt: testTimestamp1,
      });

      testApproval1 = createResult1;
      testApproval2 = await createApproval(testApprovalData2);
    });
  });

  describe("getApproval", () => {
    test("invalid ID", async () => {
      await expectAsyncValidationError(getApproval());
      await expectAsyncValidationError(getApproval(" "));
      await expectAsyncValidationError(getApproval(123));
      await expectAsyncValidationError(getApproval("asdfasdf"));
      await expectAsyncValidationError(getApproval(new ObjectId()));
    });

    test("non-existant ID", async () => {
      const nullApproval = await getApproval(stringifyObjectId(new ObjectId()));
      expect(nullApproval).toEqual(null);
    });

    test("get test approval 1 and 2", async () => {
      const getResult1 = await getApproval(testApproval1._id);
      expect(getResult1).toEqual(testApproval1);
      const getResult2 = await getApproval(testApproval2._id);
      expect(getResult2).toEqual(testApproval2);
    });
  });

  describe("updateApproval", () => {
    const getUpdateData = () => {
      const updates = testApproval1.updates || [];
      return {
        ...testUpdateData,
        lastUpdateId:
          updates.length === 0 ? null : updates[updates.length - 1]._id,
      };
    };

    test("invalid ID", async () => {
      await expectAsyncValidationError(updateApproval(testApproval1._id));
      await expectAsyncValidationError(updateApproval(" "));
      await expectAsyncValidationError(updateApproval(123));
      await expectAsyncValidationError(updateApproval("asdfasdf"));
      await expectAsyncValidationError(updateApproval(new ObjectId()));
    });

    test("invalid update data", async () => {
      const approvalId = testApproval1._id;
      const updateData = getUpdateData();
      await expectAsyncValidationError(updateApproval(approvalId));
      await expectAsyncValidationError(updateApproval(approvalId, " "));
      await expectAsyncValidationError(updateApproval(approvalId, 123));
      await expectAsyncValidationError(updateApproval(approvalId, "asdfasdf"));
      await expectAsyncValidationError(
        updateApproval(approvalId, {
          ...updateData,
          userId: "",
        })
      );
      await expectAsyncValidationError(
        updateApproval(approvalId, {
          ...updateData,
          userId: new ObjectId(),
        })
      );
      await expectAsyncValidationError(
        updateApproval(approvalId, {
          ...updateData,
          userId: 123,
        })
      );
      await expectAsyncValidationError(
        updateApproval(approvalId, {
          ...updateData,
          lastUpdateId: null,
        })
      );
      await expectAsyncValidationError(
        updateApproval(approvalId, {
          ...updateData,
          status: "NOTASTATUS",
        })
      );
      await expectAsyncValidationError(
        updateApproval(approvalId, {
          ...updateData,
          message: {},
        })
      );
      await expectAsyncValidationError(
        updateApproval(approvalId, {
          ...updateData,
          message: [],
        })
      );
    });

    test("non-existant ID", async () => {
      await expectAsyncQeuryError(
        updateApproval(stringifyObjectId(new ObjectId()), getUpdateData())
      );
    });

    test("updated approval", async () => {
      const newIndex = testApproval1.updates.length;
      const updateData = getUpdateData();
      const updateResult = await updateApproval(testApproval1._id, updateData);

      expect(updateResult.updates).toHaveProperty("length", newIndex + 1);
      expect(updateResult.updates[newIndex]).toMatchObject({
        userId: updateData.userId,
        status: updateData.status,
        message: updateData.message,
      });
      expect(updateResult).toMatchObject({
        status: updateData.status,
        updatedAt: updateResult.updates[newIndex].createdAt,
      });

      testApproval1 = updateResult;
    });

    test("out-dated update", async () => {
      let updateData = getUpdateData();
      updateData.lastUpdateId = testApproval1.updates[0]._id;
      await expectAsyncQeuryError(
        updateApproval(testApproval1._id, updateData)
      );
    });
  });
});

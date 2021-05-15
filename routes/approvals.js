const { Router } = require("express");
const {
  getApproval,
  updateApproval,
  assertApprovalUpdates,
  APPROVAL_STATUS,
} = require("../data/approvals");
const { getTrip } = require("../data/trips");
const { getUser } = require("../data/users");
const { assertObjectIdString } = require("../utils/assertion");
const { HttpError } = require("../utils/errors");
const { getTemplateData, guardXSS } = require("../utils/routes");

const dataExist = (id, data, desc = "data") => {
  if (!data) throw new HttpError(`Cannot find approval with ID: ${id}`, 404);
};

const approvalExist = (id, approval) => dataExist(id, approval, "approval");
const tripExist = (id, trip) => dataExist(id, trip, "trip");

const getAuthorizedData = async (user, approvalId) => {
  assertObjectIdString(approvalId);

  const approval = await getApproval(approvalId);
  approvalExist(approvalId, approval);

  const { tripId } = approval;
  const trip = await getTrip(tripId);
  tripExist(tripId, trip);

  if (
    user.corporateId !== trip.corporateId ||
    !trip.employeeIdList.includes(user._id)
  ) {
    throw new HttpError("Unauthorized approval thread", 401);
  }

  return {
    approval,
    trip,
  };
};

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    assertObjectIdString(id);

    const { user } = req.session;
    const { approval, trip } = await getAuthorizedData(user, id);

    let userById = {};
    let updates = [];
    for (const update of approval.updates) {
      if (!userById[update.userId]) {
        userById[update.userId] = await getUser(update.userId);
      }
      updates.push({
        user: userById[update.userId],
        status: update.status,
        message: update.message,
        time: new Date(update.createdAt).toLocaleString(),
      });
    }

    const lastUpdateId = approval.updates[approval.updates.length - 1]._id;
    res.render("trip/approval", {
      trip,
      approval,
      updates,
      isApprovalManager: trip.managerId === user._id,
      lastUpdateId,
      ...getTemplateData(req, { title: `Approval Thread (${trip.name})` }),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req.session;
    const updateData = guardXSS(req.body, ['message', 'status', 'lastUpdateId']);
    updateData.userId = user._id;
    assertApprovalUpdates(id, updateData);

    const { trip, approval } = await getAuthorizedData(user, id);

    const isManager = user._id === trip.managerId;
    if (
      !isManager &&
      (updateData.status === APPROVAL_STATUS.APPROVED ||
        updateData.status === APPROVAL_STATUS.REJECTED)
    ) {
      throw new HttpError("Unauthorized update: not the trip manager", 401);
    }

    const lastUpdateId = approval.updates[approval.updates.length - 1]._id;
    if (lastUpdateId != updateData.lastUpdateId) {
      throw new HttpError("Update is based on out-dated history", 400);
    }

    const updatedApproval = await updateApproval(id, updateData);
    approvalExist(id, updatedApproval);

    res.status(200).json(updatedApproval);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

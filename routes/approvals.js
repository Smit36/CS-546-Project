const { Router } = require("express");
const {
  getApproval,
  updateApproval,
  assertApprovalUpdates,
} = require("../data/approvals");
const { getTrip } = require("../data/trips");
const { assertObjectIdString } = require("../utils/assertion");
const { HttpError } = require("../utils/errors");
const { getTemplateData } = require("../utils/routes");

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

    res.render("trip/approval", { trip, approval });
    // res.status(200).json(approval);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.body;
    const { user } = req.session;
    const updateData = req.body;
    updateData.userId = user._id;
    assertApprovalUpdates(id, updateData);

    const { trip, approval } = await getAuthorizedData(user, id);

    const isManager = user._id === trip.managerId;
    if (!isManager && !!updateData.status) {
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

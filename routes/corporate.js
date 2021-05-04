const { ObjectId } = require("bson");
const { Router } = require("express");
const router = Router();

const {
  createCorporate,
  getCorporate,
  getAllCorporates,
  updateCorporate,
  deleteCorporate,
} = require("../data/corporate");

const {
  assertObjectIdString,
  assertRequiredObject,
  assertIsValuedString,
  assertEmailString,
  assertContactString
} = require("../utils/assertion");

const { HttpError } = require("../utils/errors");

const isDataExist = (id, data, desc = "data") => {
  if (!data)
    throw new HttpError(`Cannot find corporate data with ID: ${id}`, 404);
};

const isCorporateAdd = (id, data) => {
  if (!data) throw new HttpError(`Cannot Add new corporate data`, 400);
};

const isCorporateUpdate = (id, data) => {
  if (!data)
    throw new HttpError(`Cannot Update corporate data with ID: ${id}`, 400);
};

const corporateExist = (id, corporate) =>
  isDataExist(id, corporate, "corporate");

const assertCorporateData = (corporateData) => {
  assertIsValuedString(corporateData.name, "Corporate name");
  assertIsValuedString(corporateData.emailDomain, "Email");
  assertEmailString(corporateData.emailDomain, "Corporate Email");
  assertIsValuedString(corporateData.contactNo, "Contact Number");
  assertContactString(corporateData.contactNo, "Contact Number");
  assertIsValuedString(corporateData.address, "Address");
  assertRequiredObject(corporateData.createdBy, "Created By");
  assertRequiredObject(corporateData.updatedBy, "Update By");
};

//Add Corporate
router.post("/", async (req, res, next) => {
  try {
    // const { user } = req.session;
    // For Testing only(set user id statically)
    const user = { _id: new ObjectId("608c14d031a2df4a7cc07372") };
    assertRequiredObject(user._id);
    const corporateData = req.body;
    corporateData.createdBy = user._id;
    corporateData.updatedBy = user._id;
    assertCorporateData(corporateData);

    const newCorporate = await createCorporate(corporateData);
    isCorporateAdd(newCorporate._id, newCorporate);
    res.status(200).json(newCorporate);
  } catch (error) {
    next(error);
  }
});

//Get All corporate
router.get("/", async (req, res, next) => {
  try {
    const allCorporate = await getAllCorporates();
    res.status(200).json(allCorporate);
  } catch (error) {
    next(error);
  }
});

//Get single corporate by cororateId
router.get("/:corporateId", async (req, res, next) => {
  try {
    const { corporateId } = req.params;
    assertObjectIdString(corporateId);
    const corporate = await getCorporate(corporateId);
    corporateExist(corporate._id, corporate);
    res.status(200).json(corporate);
  } catch (error) {
    next(error);
  }
});

//Update corporate
router.put("/:corporateId", async (req, res, next) => {
  try {
    const { corporateId } = req.params;
    assertObjectIdString(corporateId);
    // const { user } = req.session;
    // For Testing only(set user id statically)
    const user = { _id: new ObjectId("608c1f4817e05f82c4b7ce1b") };
    assertRequiredObject(user._id);

    let corporateData = req.body;
    assertEmailString(corporateData.emailDomain, "Corporate Email");
    assertContactString(corporateData.contactNo, "Contact Number");
    
    corporateData.updatedBy = user._id;

    const corporate = await getCorporate(corporateId);
    corporateExist(corporate._id, corporate);

    const updatedCorporate = await updateCorporate(corporateId, corporateData);
    isCorporateUpdate(updatedCorporate._id, updatedCorporate);
    res.status(200).json(updatedCorporate);
  } catch (error) {
    next(error);
  }
});

//Delete corporate by corporateId
router.delete("/:corporateId", async (req, res, next) => {
  try {
    const { corporateId } = req.params;
    assertObjectIdString(corporateId);

    const corporate = await deleteCorporate(corporateId);
    if (corporate) {
      res
        .status(200)
        .json({
          deletedId: corporateId,
          deleteCorporate: "Corporate Successfully deleted",
        });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
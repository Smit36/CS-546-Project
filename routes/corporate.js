const { ObjectId } = require("bson");
const { Router } = require("express");
const router = Router();

const {
  createCorporate,
  getCorporate,
  getAllCorporates,
  updateCorporate,
  deleteCorporate,
  getCorporateByDomain,
  getCorporateDomainEmail
} = require("../data/corporate");

const {
  assertObjectIdString,
  assertRequiredObject,
  assertIsValuedString,
  assertDomainString,
  assertContactString,
} = require("../utils/assertion");

const { getTemplateData } = require('../utils/routes');
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
  assertDomainString(corporateData.emailDomain, "Corporate Domain");
  assertIsValuedString(corporateData.contactNo, "Contact Number");
  assertContactString(corporateData.contactNo, "Contact Number");
  assertIsValuedString(corporateData.address, "Address");
  assertRequiredObject(corporateData.createdBy, "Created By");
  assertRequiredObject(corporateData.updatedBy, "Update By");
};

//Add New Corporate
router.post("/", async (req, res, next) => {
  try {
    const { user } = req.session;
    const userId = ObjectId(user._id);

    assertRequiredObject(userId);
    const corporateData = req.body;
    corporateData.createdBy = userId;
    corporateData.updatedBy = userId;
    assertCorporateData(corporateData);
    const emailExist = await getCorporateByDomain(corporateData.emailDomain);
    if(!emailExist){
      const newCorporate = await createCorporate(corporateData);
      isCorporateAdd(newCorporate._id, newCorporate);
      res.status(200).json({ corporate: newCorporate });
    }
  } catch (error) {
    next(error);
  }
});

//Get All corporate
router.get("/", async (req, res, next) => {
  try {
    const allCorporate = await getAllCorporates();

    res
      .status(200)
      .render("corporates/corporates", {
        corporates: allCorporate,
        user: allCorporate.user,
        ...getTemplateData(req, { title: "Corporate Lists" })
      });
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
    res
      .status(200)
      .render("corporates/corporate", {
        ...getTemplateData(req, {title: `Corporate Information for ${corporate.name}`}),
        corporate: corporate
      });
  } catch (error) {
    next(error);
  }
});

// Get Single Corporate by Domain Email
router.get("/domain/:domain", async (req, res, next) => {
  try{
    const {domain} = req.params;
    assertDomainString(domain);
    const corporate = await getCorporateDomainEmail(domain);
    corporateExist(corporate._id, corporate);
    res.status(200).json({corporate: corporate});
  }catch (error){
    next(error);
  }
})

//Update corporate
router.put("/:corporateId", async (req, res, next) => {
  try {
    const { corporateId } = req.params;
    assertObjectIdString(corporateId);
    const { user } = req.session;
    const userId = ObjectId(user._id);
    assertRequiredObject(userId);

    let corporateData = req.body;
    assertContactString(corporateData.contactNo, "Contact Number");

    corporateData.updatedBy = userId;

    const corporate = await getCorporate(corporateId);
    corporateExist(corporate._id, corporate);

    const updatedCorporate = await updateCorporate(corporateId, corporateData);
    isCorporateUpdate(updatedCorporate._id, updatedCorporate);
    res.status(200).json({ corporate: updatedCorporate });
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
      res.status(200).json({
        deletedId: corporateId,
        deleteCorporate: "Corporate Successfully deleted",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

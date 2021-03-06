const { Router } = require("express");
const router = Router();
const bcrypt = require("bcrypt");
const usersData = require("../data/users");
const corporateData = require("../data/corporate");

const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
  assertUserRole,
  assertEmailString,
  assertContactString,
  assertPasswordString,
  assertHashedPasswordString,
  assertCorporateDomainString,
  assertNonEmptyArray,
} = require("../utils/assertion");
const { USER_ROLE } = require("../utils/constants");
const { QueryError, ValidationError, HttpError } = require("../utils/errors");
const { getTemplateData, guardXSS } = require("../utils/routes");
const { getAllRanks } = require("../data/rank");
const USER_PAGE_PATH = "users/index";
const USER_PAGE_TITLE = "Employees";

//add user
router.post("/", async (req, res) => {
  try {
    let reqBody = guardXSS(req.body, ['name', 'email', 'password', 'contact']);
    assertRequiredObject(reqBody);
    let sessionUser = req.session.user;
    reqBody.corporateId = sessionUser.corporateId;
    reqBody.createdBy = sessionUser._id.toString();

    const {
      corporateId,
      rankId,
      name,
      password,
      email,
      contact,
      designation,
      rank,
      role,
      createdBy,
      createdAt = new Date().getTime(),
    } = reqBody;

    assertUserRole(role, "User Role");
    assertPasswordString(password, "Password");
    let hashPassword = await bcrypt.hash(password, 8);

    if (
      role == USER_ROLE.ADMIN &&
      corporateId &&
      rankId &&
      designation &&
      rank
    ) {
      throw new ValidationError(`Super Admin has invalid data`);
    }

    if (role !== USER_ROLE.ADMIN) {
      assertObjectIdString(corporateId, "Corporate ID");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertObjectIdString(rankId, "Rank ID");
    }
    assertIsValuedString(name, "User name");
    assertHashedPasswordString(hashPassword, "Password");
    assertEmailString(email, "Email");
    reqBody.email = email.toLowerCase();
    assertContactString(contact, "Contact Number");
    if (role === USER_ROLE.EMPLOYEE) {
      assertIsValuedString(designation, "Designation");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertRequiredNumber(rank, "Rank");
    }
    assertIsValuedString(createdBy, "Created By");
    assertRequiredNumber(createdAt, "User created time");

    reqBody.password = hashPassword;

    const corporate = await corporateData.getCorporate(corporateId);
    assertCorporateDomainString(corporate.emailDomain, email);

    const userPresent = await usersData.getUserByEmail(email);

    if (userPresent) {
      throw new ValidationError(`User already exists.`);
    }

    const newUser = await usersData.createUser(reqBody);
    res.status(200).json(newUser);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Get all users
router.get("/", async (req, res) => {
  try {
    res.render(
      USER_PAGE_PATH,
      getTemplateData(req, { title: USER_PAGE_TITLE })
    );
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Get all users
router.get("/all", async (req, res) => {
  try {
    const user = req.session.user;
    const allUsers = await usersData.getAllUsers(user);
    return res.status(200).json(allUsers);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Update user
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let userReq = guardXSS(req.body, ['name', 'email', 'contact']);

    assertRequiredObject(userReq);
    let sessionUser = req.session.user;
    userReq.corporateId = sessionUser.corporateId;
    let updatedBy = sessionUser._id.toString();

    const {
      corporateId,
      rankId,
      name,
      email,
      contact,
      designation,
      rank,
      role,
    } = userReq;

    assertUserRole(role, "User Role");

    if (
      role == USER_ROLE.ADMIN &&
      corporateId &&
      rankId &&
      designation &&
      rank
    ) {
      throw new ValidationError(`Super Admin has invalid data`);
    }

    if (role !== USER_ROLE.ADMIN) {
      assertObjectIdString(corporateId, "Corporate ID");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertObjectIdString(rankId, "Rank ID");
    }
    assertIsValuedString(name, "User name");
    assertEmailString(email, "Email");
    userReq.email = email.toLowerCase();
    assertContactString(contact, "Contact Number");
    if (role === USER_ROLE.EMPLOYEE) {
      assertIsValuedString(designation, "Designation");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertRequiredNumber(rank, "Rank");
    }

    const corporate = await corporateData.getCorporate(corporateId);
    assertCorporateDomainString(corporate.emailDomain, email);

    const user = await usersData.updateUser(userId, updatedBy, userReq);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Delete single user by userId
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    assertObjectIdString(userId, "User ID");

    const user = await usersData.deleteUser(userId);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

const LOGIN_PAGE_PATH = "user/login";
const LOGIN_PAGE_TITLE = "User Login";
const renderLoginPage = (req, res, errors) =>
  res.render(LOGIN_PAGE_PATH, {
    errors,
    ...getTemplateData(req, { isLogin: true, title: LOGIN_PAGE_TITLE }),
  });

router.post("/login", async (req, res) => {
try {
  let reqBody = guardXSS(req.body, ['email', 'password']);
  let errors = [];
  let hasErrors = false;

  let { email, password } = reqBody;

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email is empty or not of required format.");
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.trim().length === 0
  ) {
    errors.push("Password is empty or not of required format.");
  }

  if (errors.length > 0) {
    renderLoginPage(req, res.status(400), errors);
    return;
  }

  email = email.toLowerCase();
  const user = await usersData.getUserByEmail(email);

  if (!user) {
    errors.push(`No user with ${email} found.`);
    renderLoginPage(req, res.status(404), errors);
    return;
  }

  let match = await bcrypt.compare(password, user.password);

  if (user.email === email && match) {
    if (user.corporateId) {
      try {
        const corporate = await corporateData.getCorporate(user.corporateId);
        req.session.corporate = corporate;
      } catch (error) {
        errors.push("Invalid username or password.");
        return renderLoginPage(req, res.status(401), errors);
      }
    }

    req.session.user = user;
    res.redirect("/");
  } else {
    errors.push("Invalid username or password.");
    return renderLoginPage(req, res.status(401), errors);
  }
} catch (error) {
  next(error);
}
});

router.get("/logout", async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/user/login");
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.get("/login", async (req, res) => {
  renderLoginPage(req, res);
});

const EMPLOYEE_UPLOAD_PAGE = "users/employee-upload";
const EMPLOYEE_UPLOAD_TITLE = "Employee Bulk Creation";
const renderEmployeeUpload = (req, res, errors) => {
  const { user } = req.session;
  if (user.role !== USER_ROLE.ADMIN && user.role !== USER_ROLE.CORPORATE) {
    throw new HttpError("Unauthorized to upload employees.", 401);
  }
  return res.render(EMPLOYEE_UPLOAD_PAGE, {
    errors,
    ...getTemplateData(req, { title: EMPLOYEE_UPLOAD_TITLE }),
  });
};

router.get("/bulk-upload", async (req, res, next) => {
  try {
    renderEmployeeUpload(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/bulk-upload", async (req, res, next) => {
  try {
    const { user } = req.session;
    const employeeDataList = req.body;
    assertNonEmptyArray(employeeDataList);

    const ranks = await getAllRanks(user);
    const rankMap = ranks.reduce((result, rank) => {
      const { name, level } = rank;
      result[level] = result[level] || {};
      result[level][name] = rank;
      return result;
    }, {});

    const userDataList = [];
    const errors = [];
    const creationTime = new Date().getTime();
    for (let i = 0; i < employeeDataList.length; i++) {
      const employeeData = employeeDataList[i];
      try {
        const { name, password, email, contact, designation, rank } =
          employeeData;
        assertPasswordString(password, "Password");
        let hashPassword = await bcrypt.hash(password, 8);
        assertIsValuedString(name, "User name");
        assertHashedPasswordString(hashPassword, "Password");
        assertEmailString(email, "Email");
        assertContactString(contact, "Contact Number");
        assertIsValuedString(designation, "Designation");
        assertRequiredNumber(Number(rank), "Rank level");

        const employeeRank = rankMap[rank][designation];
        if (!employeeRank) {
          throw new ValidationError("Invalid coporate employee rank");
        }

        const userPresent = await usersData.getUserByEmail(email);
        if (!!userPresent) {
          throw new ValidationError(`User ${email} already exists.`);
        }

        userDataList.push({
          ...employeeData,
          password: hashPassword,
          role: USER_ROLE.EMPLOYEE,
          rankId: employeeRank._id,
          designation: employeeRank.name,
          rank: employeeRank.level,
          corporateId: user.corporateId,
          createdBy: user._id,
          createdAt: creationTime,
        });
      } catch (employeeError) {
        errors.push(`Row ${i + 1}: ` + employeeError.message);
      }
    }

    if (errors.length > 0) {
      throw new HttpError(errors.join(";\n"), 400);
    } else {
      const users = await Promise.all(
        userDataList.map((userData) => usersData.createUser(userData))
      );
      res.send(users);
    }
  } catch (error) {
    next(error);
  }
});

//get user by Id
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await usersData.getUser(userId);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

module.exports = router;

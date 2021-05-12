const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const usersData = require('../data/users');
const corporateData = require('../data/corporate');
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
  assertCorporateDomainString
} = require("../utils/assertion");
const {
  USER_ROLE
} = require('../utils/constants')
const { QueryError, ValidationError } = require("../utils/errors");
const { getTemplateData } = require('../utils/routes');
const USER_PAGE_PATH = 'users/index';
const USER_PAGE_TITLE = 'Employee';

//add user
router.post('/', async (req, res) => {
  try {
    const reqBody = req.body;
    assertRequiredObject(reqBody);
    let sessionUser = req.session.user;
    reqBody.corporateId = sessionUser.corporateId;
    reqBody.createdBy = sessionUser._id.toString();

    const { corporateId, rankId, name, password, email, contact, designation, rank, role, createdBy, createdAt = new Date().getTime() } = reqBody;
  
    assertUserRole(role, "User Role");
    assertPasswordString(password, "Password");
    let hashPassword = await bcrypt.hash(password, 8);

    if (role == USER_ROLE.ADMIN && corporateId && rankId && designation && rank) {
      throw new ValidationError(`Super Admin has invalid data`);
    }
    else if (role == USER_ROLE.CORPORATE && rankId && designation && rank) {
      throw new ValidationError(`Corporate Admin has invalid data`);
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
router.get('/', async (req, res) => {
  try {  
    res.render(USER_PAGE_PATH, getTemplateData(req, { title: USER_PAGE_TITLE }));
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Get all users
router.get('/all', async (req, res) => {
  try {  
    const user = req.session.user;
    const allUsers = await usersData.getAllUsers(user);
    return res.status(200).json(allUsers);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Update user
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let userReq = req.body;

    assertRequiredObject(userReq);
    let sessionUser = req.session.user;
    userReq.corporateId = sessionUser.corporateId;
    let updatedBy = sessionUser._id.toString();

    const { corporateId, rankId, name, email, contact, designation, rank, role } = userReq;
  
    assertUserRole(role, "User Role");

    if (role == USER_ROLE.ADMIN && corporateId && rankId && designation && rank) {
      throw new ValidationError(`Super Admin has invalid data`);
    }
    else if (role == USER_ROLE.CORPORATE && rankId && designation && rank) {
      throw new ValidationError(`Corporate Admin has invalid data`);
    }
      
    if (role !== USER_ROLE.ADMIN) {
      assertObjectIdString(corporateId, "Corporate ID");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertObjectIdString(rankId, "Rank ID"); 
    }   
    assertIsValuedString(name, "User name");
    assertEmailString(email, "Email");
    assertContactString(contact, "Contact Number");
    if (role === USER_ROLE.EMPLOYEE) {
      assertIsValuedString(designation, "Designation");
    }
    if (role === USER_ROLE.EMPLOYEE) {
      assertRequiredNumber(rank, "Rank");
    }

    const user = await usersData.updateUser(userId, updatedBy, userReq);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

//Delete single user by userId
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    assertObjectIdString(userId, "User ID");

    const user = await usersData.deleteUser(userId);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.post('/login', async (req, res) => {
  const reqBody = req.body;
  let errors = [];
  let hasErrors = false;

  const { email, password } = reqBody;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is empty or not of required format.');
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    errors.push('Password is empty or not of required format.');
  }

  if (errors.length > 0) {
    res.status(401).json({ errors : errors });
    return;
  }

  const user = await usersData.getUserByEmail(email);

  if (!user) {
    errors.push(`No user with ${email} found.`); 
    res.status(401).json({ errors : errors });
    return;
  }

  let match = await bcrypt.compare(password, user.password);

  if (user.email === email && match) {
    if (user.corporateId) {
      const corporate = await corporateData.getCorporate(user.corporateId);
      if (corporate) {
        req.session.corporate = corporate;
      }
    }

    req.session.user = user;
    res.redirect('/');
  }
  else {
    errors.push('Invalid username or password.');
    res.status(401).json({ errors : errors });
    return;
  }    
});

router.get('/logout', async (req, res) => {
  try {  
    req.session.destroy();
    res.redirect('/user/login');
  } catch (e) {
    res.status(400).json({ error: e });
  }
});


const LOGIN_PAGE_PATH = "user/login";
const LOGIN_PAGE_TITLE = "User Login";
router.get('/login', async (req, res) => {
    res.render(LOGIN_PAGE_PATH, getTemplateData(req, { noUser: false, title: LOGIN_PAGE_TITLE }));
});

//get user by Id
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await usersData.getUser(userId);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});


module.exports = router;
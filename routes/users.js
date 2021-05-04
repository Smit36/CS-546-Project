const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const usersData = require('../data/users');

//add user
router.post('/', async (req, res) => {
    try {
      const reqBody = req.body;
      const newUser = await usersData.createUser(reqBody);
      res.status(200).json(newUser);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  });
  
//Get all users
router.get('/', async (req, res) => {
try {  
    const allUsers = await usersData.getAllUsers();
    res.status(200).json(allUsers);
} catch (e) {
    res.status(400).json({ error: e });
}
});

//Update user
router.put('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      let userReq = req.body;
      const user = await usersData.updateUser(userId, userId, userReq);
      res.status(200).json(user);
    } catch (e) {
      res.status(400).json({ error: e });
    }
});

//Delete single user by userId
router.delete('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
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
        // res.status(401)
        //    .render('login', { errors : errors, hasErrors : true, userInfo : userInfo, title : title });
        res.status(401).json({ errors : errors });
        return;
    }

    const user = await usersData.getUserByEmail(email);

    if (!user) {
        errors.push(`No user with ${email} found.`); 
        res.status(401).json({ errors : errors });

        // TODO: HTTP 401 status code
        // res.status(401)
        //    .render('login', { errors : errors, hasErrors : true, userInfo : userInfo, title : title });
        return;
    }

    user.password = await bcrypt.hash(user.password, 8);

    let match = await bcrypt.compare(password, user.password);

    if (user.email === email && match) {
        req.session.user = user;
        res.status(200).json(user);
        // res.redirect('/private');
    }
    else {
        errors.push('Invalid username or password.');
        res.status(401).json({ errors : errors });

        // res.status(401)
        //    .render('login', { errors : errors, hasErrors : true, userInfo : userInfo, title : title });
        return;
    }    
});

router.get('/logout', async (req, res) => {
  try {  
      req.session.destroy();
      res.status(200).json({ message : 'User logged out' });
  } catch (e) {
      res.status(400).json({ error: e });
  }
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
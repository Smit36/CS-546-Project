const { Router } = require('express');
const router = Router();

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

module.exports = router;
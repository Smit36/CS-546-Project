const { Router } = require('express');
const router = Router();
const { getTemplateData } = require('../utils/routes');
const {
  assertObjectIdString,
  assertIsValuedString,
  assertRequiredObject,
  assertRequiredNumber,
  assertUserRole,
} = require("../utils/assertion");

const rankData = require('../data/rank');
const { ValidationError } = require('../utils/errors');
const RANK_PAGE_PATH = 'rank/index';
const RANK_PAGE_TITLE = 'Expense';

//add rank
router.post('/', async (req, res) => {
    try {
      const reqBody = req.body;
      const user = req.session.user;

      assertRequiredObject(reqBody);
      assertRequiredObject(user);

      const rankPresent = await rankData.getRankByName(reqBody);

      if (rankPresent) {
        throw new ValidationError(`Rank ${reqBody.name} already exists.`);
      }

      const newRank = await rankData.createRank(reqBody, user.corporateId);
      return res.status(200).json(newRank);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  });
  
//Get all ranks
router.get('/', async (req, res) => {
try {  
    res.render(RANK_PAGE_PATH, getTemplateData(req, { title: RANK_PAGE_TITLE }));
} catch (e) {
    res.status(400).json({ error: e });
}
});

router.get('/all', async (req, res) => {
  try {  
      const user = req.session.user;
      assertRequiredObject(user);

      const allRanks = await rankData.getAllRanks(user);
  
      return res.status(200).json(allRanks);
  } catch (e) {
      res.status(400).json({ error: e });
  }
  });

  //Update rank
router.put('/:rankId', async (req, res) => {
    try {
      const { rankId } = req.params;
      let rankReq = req.body;

      assertObjectIdString(rankId);
      assertRequiredObject(rankReq);

      const rank = await rankData.updateRank(rankId, rankReq);
      res.status(200).json(rank);
    } catch (e) {
      res.status(400).json({ error: e });
    }
});

module.exports = router;
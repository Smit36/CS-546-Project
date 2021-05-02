const { Router } = require('express');
const router = Router();

const rankData = require('../data/rank');

//add rank
router.post('/', async (req, res) => {
    try {
      const reqBody = req.body;
      const newRank = await rankData.createRank(reqBody);
      res.status(200).json(newRank);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  });
  
//Get all ranks
router.get('/', async (req, res) => {
try {  
    const allRanks = await rankData.getAllRanks();
    res.status(200).json(allRanks);
} catch (e) {
    res.status(400).json({ error: e });
}
});

  //Update rank
router.put('/:rankId', async (req, res) => {
    try {
      const { rankId } = req.params;
      let rankReq = req.body;
      const rank = await rankData.updateRank(rankId, rankReq);
      res.status(200).json(rank);
    } catch (e) {
      res.status(400).json({ error: e });
    }
});

module.exports = router;
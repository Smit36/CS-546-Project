const { Router } = require("express");

const router = Router();

const LANDING_PAGE_PATH = "landing/index";
const LANDING_PAGE_TITLE = "Corporate Eraveling Expense Management";
router.get('/', async (req, res) => {
  res.render(LANDING_PAGE_PATH, { title: LANDING_PAGE_TITLE });
});

module.exports = router;

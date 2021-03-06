const { Router } = require("express");
const { getTemplateData } = require("../utils/routes");

const router = Router();

const LANDING_PAGE_PATH = "landing/index";
const LANDING_PAGE_TITLE = "Corporate Traveling Expense Management";
router.get('/', async (req, res) => {
  res.render(LANDING_PAGE_PATH, getTemplateData(req, { title: LANDING_PAGE_TITLE }));
});

module.exports = router;

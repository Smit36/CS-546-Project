const xss = require("xss");
const { assertRequiredObject } = require("./assertion");
const { USER_ROLE } = require("./constants");

const getTemplateData = (req, options = {}) => {
  const { user, corporate } = req.session;
  return {
    title: options.title || "",
    user,
    corporate,
    isLogin: !!options.isLogin,
    isEmployee: !!user && user.role === USER_ROLE.EMPLOYEE,
    isPortalAdmin: !!user && user.role === USER_ROLE.ADMIN,
    isCorporateAdmin: !!user && user.role === USER_ROLE.CORPORATE,
  };
};

const guardXSS = (data, fields) => {
  assertRequiredObject(data);

  const guardedData = {};
  const guardingSet = new Set(fields || Object.keys(data));
  for (const [field, value] of Object.entries(data)) {
    guardedData[field] =
      guardingSet.has(field) && typeof value === "string"
        ? xss(value, {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ["script"],
          })
        : value;
  }

  return guardedData;
};

module.exports = {
  getTemplateData,
  guardXSS,
};

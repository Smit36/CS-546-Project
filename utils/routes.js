const xss = require('xss');
const { assertRequiredObject } = require("./assertion");

const USER_ROLE = {
  ADMIN: 'ADMIN',
  CORPORATE: 'CORPORATE',
  EMPLOYEE: 'EMPLOYEE',
};

const getTemplateData = (req, options = {}) => {
  const { user, corporate } = req.session;
  return {
    title: options.title || '',
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

  const guardedData = { ...data };
  const guardingFields = fields || Object.keys(data);
  for (const field of guardingFields) {
    guardedData[field] = xss(data[field]);
  }

  return guardedData;
}

module.exports = {
  getTemplateData,
  guardXSS,
  USER_ROLE
};
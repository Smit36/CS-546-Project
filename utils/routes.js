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

module.exports = {
  getTemplateData,
  USER_ROLE
};
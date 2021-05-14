(async function () {
  try {
    await require('./seeding')();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    process.exit();
  }
})();
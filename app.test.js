const app = require("./app");

test("App server can run", (done) => {
  const port = process.env.PORT || 3000;
  try {
    app.listen(port).close();
  } catch (error) {
    done(error);
  } finally {
    done();
  }
});

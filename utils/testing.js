const { connect } = require("../config/mongoConnection");
const { create: createBook, getAll: getAllBooks } = require('../data/books');
const { create: createReview } = require('../data/Reviews');
const { books: booksData, reviews: reviewsData } = require("../data/testData.json");

class FunctionTester {
  constructor(name, f) {
    this.name = name;
    this.f = f;
    this.verbose = false;
    this.comparedResults = 0;
    this.comparedErrors = 0;
    this.failedResults = 0;
    this.failedErrors = 0;
    this.expectingResults = [];
    this.expectingErrors = [];
  }

  setVerbose(verbose = true) {
    this.verbose = verbose;
    return this;
  }

  getDescription(...args) {
    return `${this.name}(${args
      .map((arg) =>
        arg === undefined
          ? "undefined"
          : typeof arg === "function"
          ? "function(...){...}"
          : JSON.stringify(arg)
      )
      .join(", ")})`;
  }

  compareResult(expected, ...args) {
    const description = this.getDescription(...args);
    try {
      const result = this.f(...args);
      if (this.verbose) {
        console.log("-----");
        console.log(`Getting result from ${description}...`);
        console.log("expected:", expected);
        console.log("result:  ", result);
      }
      this.comparedResults++;
    } catch (error) {
      console.log("-----");
      console.error(`${description} threw an unexpected error:`, error);
      this.failedResults++;
    }
    return this;
  }

  compareError(expected, ...args) {
    const description = this.getDescription(...args);
    try {
      const result = this.f(...args);
      console.log("-----");
      console.error(
        `${description} did not throw an error as expected:`,
        result
      );
      this.failedErrors++;
    } catch (error) {
      if (this.verbose) {
        console.log("-----");
        console.log(`Getting error from ${description}...`);
        console.log("expected:", expected);
        console.log("error:   ", error instanceof Error ? error.message : error);
      }
      this.comparedErrors++;
    }
    return this;
  }

  expectResult(expected, ...args) {
    this.expectingResults.push({
      expected,
      args,
    });
    return this;
  }

  expectError(expected, ...args) {
    this.expectingErrors.push({
      expected,
      args,
    });
    return this;
  }

  reset() {
    this.comparedResults = 0;
    this.comparedErrors = 0;
    this.failedResults = 0;
    this.failedErrors = 0;
    this.expectingErrors = [];
    this.expectingResults = [];
    return this;
  }

  async summary() {
    await Promise.all([
      ...(this.expectingResults || []).map(async ({ expected, args }) => {
        const description = this.getDescription(...args);
        try {
          const result = await this.f(...args);
          if (this.verbose) {
            console.log("-----");
            console.log(`Got asynchronous result from ${description}...`);
            console.log("expected:", expected);
            console.log("result:  ", result);
          }
          this.comparedResults++;
        } catch (error) {
          console.log("-----");
          console.error(`${description} threw an unexpected error:`, error);
          this.failedResults++;
        }
        return;
      }),
      ...(this.expectingErrors || []).map(async ({ expected, args }) => {
        const description = this.getDescription(...args);
        try {
          const result = await this.f(...args);
          console.log("-----");
          console.error(
            `${description} did not throw an error as expected:`,
            result
          );
          this.failedErrors++;
        } catch (error) {
          if (this.verbose) {
            console.log("-----");
            console.log(`Got asynchronous from ${description}...`);
            console.log("expected:", expected);
            console.log("error:   ", error instanceof Error ? error.message : error);
          }
          this.comparedErrors++;
        }
        return;
      }),
    ]);

    console.log("==========");
    console.log(`${this.name}(...) comparisons:`);

    const resultInfos = [];
    if (!!this.comparedResults)
      resultInfos.push(`compared ${this.comparedResults} results`);
    if (!!this.failedResults)
      resultInfos.push(`failed to get ${this.failedResults} results`);
    console.log(resultInfos.join(", "));

    const errorInfos = [];
    if (!!this.comparedErrors)
      errorInfos.push(`compared ${this.comparedErrors} errors`);
    if (!!this.failedErrors)
      errorInfos.push(`failed to get ${this.failedErrors} errors`);
    console.log(errorInfos.join(", "));
  
    return this.reset();
  }
}

const shouldSucceed = async (description, f, ...args) => {
  try {
    const result = await f(...args);
    console.log(`(v) "${description}" ran successfully as expected:`, result);
    return result;
  } catch (error) {
    console.error(`(x) "${description}" threw an unexpected error:`, error);
  }
  return;
};

const shouldFail = async (description, f, ...args) => {
  try {
    const result = await f(...args);
    console.error(
      `(x) "${description}" did not throw an error as expected:`,
      result
    );
    return result;
  } catch (error) {
    console.log(`(v) "${description}" threw an error as expected:`, error);
  }
  return;
};

const populateTestData = async (dataList) => {
  for (const { reviews = [], ...bookData } of dataList) {
    const book = await createBook(bookData);
    for (const review of reviews) {
      await createReview(book._id, review);
    }
  }
  return await getAllBooks();
};

const prepareTestData = async (db) => {
  await db.dropDatabase();
  let testBooksData = [...booksData];
  testBooksData[0].reviews = [reviewsData[0], reviewsData[1]];
  testBooksData[1].reviews = [reviewsData[2]];
  testBooksData[2].reviews = [reviewsData[3]];
  testBooksData[3].reviews = [reviewsData[4], reviewsData[5]];
  testBooksData[4].reviews = [reviewsData[6], reviewsData[7]];
  const allBooks = await populateTestData(testBooksData);
  return allBooks;
};

const withTestDb = (runTest) => async () => {
  let db;
  try {
    const testDb = await connect();
    db = testDb;

    return await runTest(db);

  } catch (error) {
    console.log(error);
  } finally {
    if (!!db) {
      await db.dropDatabase();
      // await disconnect();
    }
  }
};


const withTestServer = (runTest) => async () => {
  let server;
  try {
    server = require('../app').server;

    return await runTest(server);

  } catch (error) {
    console.log(error);
  } finally {
    if (!!server) {
      server.close();
    }
  }
};

module.exports = {
  FunctionTester,
  shouldSucceed,
  shouldFail,
  populateTestData,
  prepareTestData,
  withTestDb,
  withTestServer,
};

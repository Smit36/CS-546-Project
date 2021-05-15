const { ValidationError } = require("./errors");
const { isObjectIdString } = require("./mongodb");
const { USER_ROLE } = require('./constants');

const stringifyData = (data) =>
  data === undefined
    ? "undefined"
    : typeof data === "function"
    ? "function(...){...}"
    : JSON.stringify(data);

const checkFieldTypes = (types, data, dataPath = "") => {
  const isArrayTyped = Array.isArray(types);
  const fieldTypes = isArrayTyped ? types[0] : types;

  const isArrayData = Array.isArray(data);
  const printData = stringifyData(data);
  if (isArrayTyped) {
    if (isArrayData) {
      for (let i = 0; i < data.length; i++) {
        checkFieldTypes(fieldTypes, data[i], `${dataPath}[${i}]`);
      }
    } else {
      throw new ValidationError(`${dataPath} should be an array: ${printData}`);
    }
  } else {
    if (isArrayData) {
      throw new ValidationError(
        `${dataPath} should not be an array: ${printData}`
      );
    } else if (fieldTypes instanceof RegExp) {
      if (!fieldTypes.test(data)) {
        throw new ValidationError(
          `${dataPath} has invalid format: ${printData}`
        );
      }
    } else if (typeof fieldTypes === "string") {
      if (typeof data !== fieldTypes) {
        throw new ValidationError(
          `${dataPath} should be a${
            /[aeiou]/.test(fieldTypes[0]) ? "n" : ""
          } ${fieldTypes}: ${printData}`
        );
      }
    } else if (typeof fieldTypes === "object") {
      if (typeof data !== "object") {
        throw new ValidationError(
          `${dataPath} should be an object: ${printData}`
        );
      }
      for (const [field, fieldType] of Object.entries(fieldTypes)) {
        checkFieldTypes(fieldType, data[field], `${dataPath}.${field}`);
      }
    }
  }

  return true;
};

const assertRequired = (data, description) => {
  if (data === undefined) {
    throw new ValidationError(`${description} is required.`);
  }
};

const assertType = (data, type, description) =>
  checkFieldTypes(type, data, description);

const assertRequiredType = (data, type, description) => {
  assertRequired(data, description);
  assertType(data, type, description);
};

const assertRequiredString = (data, description) =>
  assertRequiredType(data, "string", description);

const assertRequiredNumber = (data, description) =>
  assertRequiredType(data, "number", description);

const assertRequiredObject = (data, description) =>
  assertRequiredType(data, {}, description);

const assertNonEmptyArray = (data, description = 'Array') => {
  assertRequired(data, description);
  checkFieldTypes([], data, description);
  if (data.length === 0) {
    throw new ValidationError(`${description} should not be empty.`);
  }
};

const assertIsValuedString = (s, description) => {
  assertRequiredString(s, description);
  if (s.trim().length === 0) {
    throw new ValidationError(
      `${description} should be more than whitespaces.`
    );
  }
};

const assertObjectIdString = (id, description = "Identifier (_id)") => {
  assertIsValuedString(id, description);
  if (!isObjectIdString(id)) {
    throw new ValidationError(`${description} is not a valid ObjectId: ${id}`);
  }
};

const assertDateString = (s, description) => {
  assertIsValuedString(s, description);

  if (!/^[\d]{1,2}\/[\d]{1,2}\/[\d]{4}$/.test(s)) {
    throw new ValidationError(
      `${description} is not in MM/DD/YYYY format: ${s}`
    );
  }

  const [MM, DD, YYYY] = s.split("/");
  const date = new Date(parseInt(YYYY), parseInt(MM) - 1, parseInt(DD));
  if (
    !(date instanceof Date) ||
    isNaN(date) ||
    parseInt(MM) !== date.getMonth() + 1 ||
    parseInt(DD) !== date.getDate() ||
    parseInt(YYYY) !== date.getFullYear()
  ) {
    throw new ValidationError(`${description} is not a valid date: ${s}`);
  }
};

const assertEmailString = (email, description= "Email") => {
  assertIsValuedString(email, description);
  if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
    throw new ValidationError(`${description} is not a valid Email: ${email}`);
  }
};

const assertDomainString = (domain, description= "Domain") => {
  assertIsValuedString(domain, description);
  if (!domain.match(/^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i)) {
    throw new ValidationError(`${description} is not a valid Corporate Domain: ${domain}`);
  }
};

const assertCorporateDomainString = (corpDomain, userEmail, description= "User Email") => {
  assertDomainString(corpDomain);

  const userArr = userEmail.split('@');
  if (corpDomain !== userArr[1]) {
    throw new ValidationError(`${description} is not a valid Corporate email: ${userEmail}`);
  }
};

const assertContactString = (contact, description= "Contact") => {
  assertIsValuedString(contact, description);
  if (!contact.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)){
  throw new ValidationError(`${description} is not a valid Contact: ${contact}`);
  }
}

const assertPasswordString = (password, description = 'Password') => {
  assertIsValuedString(password, description);
  if (!password.match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)){
    throw new ValidationError(`${description} is not a valid Password: ${password}`);
    }
}

const assertHashedPasswordString = (password, description = 'Password') => {
  assertIsValuedString(password, description);
  if (password.trim().length !== 60) {
    throw new ValidationError(`${description} is not a valid Password: ${password}`);
  }
}

const assertUserRole = (role, description = 'User Role') => {
  assertIsValuedString(role, description);

  if (role ==! USER_ROLE.ADMIN || role ==! USER_ROLE.CORPORATE || role ==! USER_ROLE.EMPLOYEE) {
    throw new ValidationError(`${description} is not valid: ${password}`);
  }
}

module.exports = {
  checkFieldTypes,
  assertType,
  assertRequiredType,
  assertRequiredNumber,
  assertRequiredObject,
  assertNonEmptyArray,
  assertIsValuedString,
  assertDateString,
  assertObjectIdString,
  assertEmailString,
  assertContactString,
  assertPasswordString,
  assertUserRole,
  assertHashedPasswordString,
  assertDomainString,
  assertCorporateDomainString
};

const $loginForm = $("#login-form");
const $loginEmailInput = $("#login-form-email");
const $loginPasswordInput = $("#login-form-password");

const $loginEmailError = $("#login-form-email-error");
const $loginPasswordError = $("#login-form-password-error");

const $fieldErrors = {
  email: $loginEmailError,
  password: $loginPasswordError,
};

function resetFieldErrors() {
  for (const $fieldError of Object.values($fieldErrors)) {
    $fieldError.hide().empty();
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();

  resetFieldErrors();

  const inputEmail = $loginEmailInput.val();
  const inputPassword = $loginPasswordInput.val();

  const errors = {};
  if (!inputEmail) {
    errors.email = "Please enter user email";
  } else if (
    typeof inputEmail !== "string" ||
    !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(inputEmail)
  ) {
    errors.email = "Invalid email format";
  }

  if (!inputPassword) {
    errors.password = "Please enter the password";
  } else if (typeof inputPassword !== "string") {
    errors.password = "Password should be a string";
  }

  if (Object.keys(errors).length > 0) {
    for (const field in errors) {
      $fieldErrors[field].text(errors[field]).show();
    }
  } else {
    $loginForm[0].submit();
  }
}

$loginForm.submit(handleLoginSubmit);

const $queryObjectList = (qs) =>
  $(qs)
    .map((i, e) => $(e))
    .get();

const getTripExpenseId = () => $("#trip-expense__id").html().trim();
const getTripExpenseTripId = () => $("#trip-expense__trip-id").html().trim();
const getTripExpenseUserId = () => $("#trip-expense__user-id").html().trim();
const $teForm = $("#trip-expense__form");
const $teSubmit = $("#trip-expense__submit");
const $teNameInput = $("#trip-expense__name__input");
const $teDescriptionInput = $("#trip-expense__description__input");
const $tePaymentRadios = $queryObjectList(
  "input[id^=trip-expense__payment__radio--]"
);
const $teCurrencySelect = $("#trip-expense__currency__select");
const $teAmountInput = $("#trip-expense__amount__input");
const $teDateInput = $("#trip-expense__date__input");

const $teNameError = $("#trip-expense__name__error");
const $teDescriptionError = $("#trip-expense__description__error");
const $tePaymentError = $("#trip-expense__payment__error");
const $teCurrencyError = $("#trip-expense__currency__select");
const $teAmountError = $("#trip-expense__amount__error");
const $teDateError = $("#trip-expense__date__error");
const $teSubmitError = $("#trip-expense__submit__error");

const $fieldErrors = {
  name: $teNameError,
  description: $teDescriptionError,
  currency: $teCurrencyError,
  amount: $teAmountError,
  payment: $tePaymentError,
  date: $teDateError,
  submit: $teSubmitError,
};

function handleTripExpenseSubmit(e) {
  e.preventDefault();

  const inputName = $teNameInput.val();
  const inputDescription = $teDescriptionInput.val();
  const inputAmount = $teAmountInput.val();
  const inputDate = $teDateInput.val();
  const inputCurrency = $teCurrencySelect.val();
  let inputPaymentMethod = "";
  for (const $paymentRadio of $tePaymentRadios) {
    if (!!$paymentRadio.prop("checked")) {
      inputPaymentMethod = $paymentRadio.val();
      break;
    }
  }

  const errors = {};
  if (!inputName) {
    errors.name = "Name should not be empty";
  }

  if (!inputDescription) {
    errors.description = "Description should not be empty";
  }

  if (!inputAmount || !/^[0-9]+$/.test(inputAmount)) {
    errors.amount = "Payment amount should be a positive number";
  }

  if (!inputCurrency || !["$", "¥", "₹", "€"].includes(inputCurrency)) {
    errors.amount = "Please select from the availble currencies";
  }

  if (!inputPaymentMethod) {
    errors.payment = "Please select from the availble payment methods";
  }

  if (
    !inputDate ||
    !/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(inputDate)
  ) {
    errors.date = "Please input a valid date";
  }

  for (const field in errors) {
    const fieldErrorMessage = errors[field];
    const $fieldError = $fieldErrors[field];
    if (!!fieldErrorMessage) {
      $fieldError.text(fieldErrorMessage).show();
    } else {
      $fieldError.hide().empty();
    }
  }

  if (Object.keys(errors).length === 0) {
    const tripId = getTripExpenseTripId();
    const expenseId = getTripExpenseId();
    const userId = getTripExpenseUserId();
    $.ajax({
      url: !!expenseId ? `/expense/${expenseId}` : "/expense",
      method: !!expenseId ? "PUT" : "POST",
      data: JSON.stringify({
        userId: userId,
        tripId: tripId,
        name: inputName,
        description: inputDescription,
        currency: inputCurrency,
        amount: Number(inputAmount),
        date: new Date(inputDate).toLocaleDateString(),
        method: inputPaymentMethod,
      }),
      contentType: "application/json; charset=utf-8",
      success(_) {
        window.location.replace(`/trip/${tripId}`);
      },
      error({ responseJSON }, __, error) {
        const { message = "" } = responseJSON;
        $fieldErrors.submit
          .text(`${error}` + (!!message ? `: ${message}` : ""))
          .show();
      },
    });
  }
}

$teForm.submit(handleTripExpenseSubmit);

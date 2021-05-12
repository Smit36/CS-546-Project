const $queryObjectList = (qs) =>
  $(qs)
    .map((i, e) => $(e))
    .get();

/**
 * New trip page
 */
const $tripForm = $("#trip-form");
const $tripName = $("#trip-name");
const $tripDescription = $("#trip-description");
const $tripStartTime = $("#trip-start-time");
const $tripEndTime = $("#trip-end-time");
const $tripManager = $("#trip-manager");
const $tripEmployees = $("#trip-employees");

const $tripEmployeeSelection = $("#trip-employee-selection");
const $tripEmployeeOptions = $queryObjectList(
  "#trip-employee-selection>option"
);
const $tripEmployeeOptionsById = $tripEmployeeOptions.reduce(
  (result, $option) => {
    const employeeId = $option.val();
    if (!!employeeId) result[employeeId] = $option;
    return result;
  },
  {}
);
const $tripEmployeeAddButton = $("#trip-employee-add");
const $tripEmployeeSelectionPreview = $("#trip-employee-selection-preview");

const getEmployeeIdList = () =>
  $tripEmployees
    .val()
    .split(";")
    .filter((id) => !!id);
const setEmployeeIdList = (idList) => {
  const value = idList.filter((id) => !!id).join(";");
  $tripEmployees.val(value).trigger("change");
  return value;
};
const addEmployeeId = (employeeId) =>
  setEmployeeIdList([...getEmployeeIdList(), employeeId]);
const removeEmployeeId = (employeeId) =>
  setEmployeeIdList([...getEmployeeIdList().filter((id) => id !== employeeId)]);

function handleTripSubmit(e) {
  e.preventDefault();
  const inputName = $tripName.val();
  const inputDescription = $tripDescription.val();
  const inputStartTime = $tripStartTime.val();
  const inputEndTime = $tripEndTime.val();
  const inputManager = $tripManager.val();
  const inputEmployees = getEmployeeIdList();

  // TODO: error handling

  $.ajax({
    url: `/trip`,
    type: "POST",
    data: {
      name: inputName,
      description: inputDescription,
      startTime: new Date(inputStartTime).getTime(),
      endTime: new Date(inputEndTime).getTime(),
      managerId: inputManager,
      employeeIdList: inputEmployees,
    },
    success: function (response) {
      redirect(`/trip/${response._id}`);
      console.log(response);
    },
  });
}

function createEmployeePreviewItem(employeeId, isManager) {
  const $employeeOption = $tripEmployeeOptionsById[employeeId];
  const employeeDescription = $employeeOption.html();
  const $previewItem = $("<li>").html(employeeDescription);
  if (isManager) {
    const managerTag = $("<span>").text(" (manager)");
    $previewItem.append(managerTag);
  } else {
    const removalButton = $("<button>")
      .text("remove")
      .click(() => removeEmployeeId(employeeId));
    $previewItem.append(removalButton);
  }
  return $previewItem;
}

function updateEmployeesPreview() {
  const selectedManagerId = $tripManager.val();
  const selectedEmployeeIdSet = new Set([
    selectedManagerId,
    ...getEmployeeIdList(),
  ]);
  $tripEmployeeSelectionPreview.empty();
  for (const employeeId in $tripEmployeeOptionsById) {
    const $tripEmployeeOption = $tripEmployeeOptionsById[employeeId];
    if (selectedEmployeeIdSet.has(employeeId)) {
      $tripEmployeeOption.hide();
      $tripEmployeeSelectionPreview.append(
        createEmployeePreviewItem(employeeId, selectedManagerId === employeeId)
      );
    } else {
      $tripEmployeeOption.show();
    }
  }
}

function handleTripReset(e) {
  setTimeout(updateEmployeesPreview, 0);
}

function handleEmployeeSelection(e) {
  const employeeId = e.target.value;
  $tripEmployeeAddButton.prop("disabled", !employeeId);
}

function handleAddEmployee(e) {
  e.preventDefault();
  const employeeId = $tripEmployeeSelection.val();
  addEmployeeId(employeeId);
  $tripEmployeeSelection.val("");
}

function handleEmployeesChange(e) {
  updateEmployeesPreview();
}

$tripManager.change(handleEmployeesChange);
$tripEmployees.change(handleEmployeesChange);
$tripForm.submit(handleTripSubmit);
$tripForm.on("reset", handleTripReset);
$tripEmployeeSelection.change(handleEmployeeSelection);
$tripEmployeeAddButton.click(handleAddEmployee);

/**
 * Trip detail page
 */

const redirect = (url) => window.location.replace(url);
const $tripExpenseRemovals = $queryObjectList("li button[id^=trip-delete-]");
const $tripExpenseEdits = $queryObjectList("li button[id^=trip-edit-]");

const getTripId = () => $("#trip-id").html().trim();

function removeExpense(expenseId) {
  $.ajax({
    url: `/expense/${expenseId}`,
    type: "DELETE",
    success(response) {
      console.log(response);
      redirect(`/trip/${getTripId()}`);
    },
  });
}

for (const $expenseRemoval of $tripExpenseRemovals) {
  const expenseId = $expenseRemoval.attr("id").slice(12);
  $expenseRemoval.click((e) => {
    e.preventDefault();
    removeExpense(expenseId);
  });
}

for (const $expenseEdit of $tripExpenseEdits) {
  const expenseId = $expenseEdit.attr("id").slice(10);
  $expenseEdit.click((e) => {
    e.preventDefault();
    redirect(`/trip/${getTripId()}/expense/${expenseId}/edit`);
  });
}

/**
 * Trip expense form
 */

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

  // TODO: error handling

  const tripId = getTripExpenseTripId();
  const expenseId = getTripExpenseId();
  const userId = getTripExpenseUserId();
  $.ajax({
    url: !!expenseId ? `/expense/${expenseId}` : '/expense',
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
    success(res) {
      redirect(`/trip/${tripId}`);
    },
  });
}

$teForm.submit(handleTripExpenseSubmit);

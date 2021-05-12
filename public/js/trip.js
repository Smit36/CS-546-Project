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
const $tripEmployeeOptions = $("#trip-employee-selection>option")
  .map((i, e) => $(e))
  .get();
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

const $tripExpenseRemovals = $("li button[id^=trip-remove-]")
  .map((i, e) => $(e))
  .get();

const $tripId = $("#trip-id");

function removeExpense(expenseId) {
  $.ajax({
    url: `/trip/${$tripId.html()}/expense/${expenseId}`,
    type: "DELETE",
    success: function (response) {
      console.log(response);
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

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

const $tripNameError = $("#trip-name-error");
const $tripDescriptionError = $("#trip-description-error");
const $tripStartTimeError = $("#trip-start-time-error");
const $tripEndTimeError = $("#trip-end-time-error");
const $tripManagerError = $("#trip-manager-error");
const $tripEmployeesError = $("#trip-employees-error");
const $tripSubmitError = $("#trip-submit-error");

const $fieldErrors = {
  name: $tripNameError,
  description: $tripDescriptionError,
  startTime: $tripStartTimeError,
  endTime: $tripEndTimeError,
  manager: $tripManagerError,
  employees: $tripEmployeesError,
  submit: $tripSubmitError,
};

const getCurrentUserId = () => $('#user-id').html().trim();

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
  const inputEmployees = Array.from(new Set([inputManager, ...getEmployeeIdList()]));

  const errors = {};
  if (!inputName) {
    errors.name = 'Name should not be empty';
  }

  if (!inputDescription) {
    errors.description = 'Description should not be empty';
  }

  if (!inputStartTime || !/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(inputStartTime)) {
    errors.startTime = 'Please input a valid start date';
  }

  if (!inputEndTime || !/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(inputEndTime)) {
    errors.endTime = 'Please input a valid End date';
  }
  
  if (!inputManager) {
    errors.manager = 'Please select the manager of this trip.';
  }

  if (inputEmployees.length <= 1) {
    errors.employees = 'Please select at least one employee aside from manager to this trip.';
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
        window.location.replace(`/trip/${response._id}`);
      },
      error({ responseJSON }, __, error) {
        const { message = '' } = responseJSON;
        $fieldErrors.submit.text(`${error}` + (!!message ? `: ${message}`: '')).show();
      },
    });
  }
}

function createEmployeePreviewItem(employeeId, isManager) {
  const $employeeOption = $tripEmployeeOptionsById[employeeId];
  const employeeDescription = $employeeOption.html();
  const $previewItem = $("<li>").addClass('trip-li').html(employeeDescription);
  if (isManager) {
    const managerTag = $("<span>").text(" (manager)");
    $previewItem.append(managerTag);
  } else if (employeeId !== getCurrentUserId()) {
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
    getCurrentUserId(),
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
  $tripEmployeeSelection.val("").trigger("change");
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

addEmployeeId(getCurrentUserId());
$tripEmployees.trigger('change');
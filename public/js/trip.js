
const $tripForm = $("#trip-form");
const $tripName = $("#trip-name");
const $tripDescription = $("#trip-description");
const $tripStartTime = $("#trip-start-time");
const $tripEndTime = $("#trip-end-time");
const $tripManager = $("#trip-manager");
const $tripEmployee = $("#trip-employee");

function handleTripSubmit(e) {
  e.preventDefault();
  const inputName = $tripName.val();
  const inputDescription = $tripDescription.val();
  const inputStartTime = $tripStartTime.val();
  const inputEndTime = $tripEndTime.val();
  const inputManager = $tripManager.val();
  const inputEmployee = $tripEmployee.val();

  $.ajax({
    url: `/trip`,
    type: 'POST',
    data: {
      name: inputName,
      description: inputDescription,
      startTime: new Date(inputStartTime).getTime(),
      endTime: new Date(inputEndTime).getTime(),
      managerId: inputManager,
      employeeIdList: [inputEmployee],
    },
    success: function(response) {
      console.log(response);
    },
 });
}

$tripForm.submit(handleTripSubmit);
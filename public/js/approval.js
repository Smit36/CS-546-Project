const $approvalUpdateForm = $("#approval-update-form");
const $approvalMessageInput = $("#appoval-update-message");

const $approvalUpdateError = $("#approval-update-error");

const getApprovalId = () => $("#approval-id").html().trim();
const getLastUpdateId = () => $("#approval-last-id").html().trim();

const $getCheckedStatus = () =>
  $("input[name=status]:checked", "#approval-update-form");
function handleApprovalUpdateSubmit(e) {
  e.preventDefault();

  $approvalUpdateError.empty().hide();

  const $inputStatusRadio = $getCheckedStatus();
  const inputStatus = $inputStatusRadio.val();
  const inputMessage = $approvalMessageInput.val();
  const id = getApprovalId();
  const lastId = getLastUpdateId();

  if (
    !!inputStatus &&
    !["APPROVED", "REJECTED", "PENDING"].includes(inputStatus)
  ) {
    $approvalUpdateError.text("Invalid approval status.").show();
  } else if (!inputMessage && !inputStatus) {
    $approvalUpdateError
      .text("Approval updates requires at leaset a message or a new status.")
      .show();
  } else {
    $.ajax({
      url: `/approval/${id}`,
      type: "PUT",
      data: {
        status: inputStatus,
        message: inputMessage,
        lastUpdateId: lastId,
      },
      success(response) {
        console.log(response);
        window.location.replace(`/approval/${id}`);
      },
      error({ responseJSON }, __, error) {
        const { message = "" } = responseJSON;
        $approvalUpdateError
          .text(`${error}` + (!!message ? `: ${message}` : ""))
          .show();
      },
    });
  }
}

$approvalUpdateForm.submit(handleApprovalUpdateSubmit);

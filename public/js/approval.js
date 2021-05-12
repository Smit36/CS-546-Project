const $approvalUpdateForm = $("#approval-update-form");
const $approvalMessageInput = $("#appoval-update-message");
const $approvalId = $("#approval-id");
const $lastApprovalId = $("#approval-last-id");

const $getCheckedStatus = () =>
  $("input[name=status]:checked", "#approval-update-form");
function handleApprovalUpdateSubmit(e) {
  e.preventDefault();
  const $inputStatusRadio = $getCheckedStatus();
  const inputStatus = $inputStatusRadio.val();
  const inputMessage = $approvalMessageInput.val();
  const id = $approvalId.html();
  const lastId = $lastApprovalId.html();

  // TODO: error handling

  $.ajax({
    url: `/approval/${id}`,
    type: "PUT",
    data: {
      status: inputStatus,
      message: inputMessage,
      lastUpdateId: lastId,
    },
    success: function (response) {
      console.log(response);
      window.location.replace(`/approval/${id}`);
    },
  });
}

$approvalUpdateForm.submit(handleApprovalUpdateSubmit);

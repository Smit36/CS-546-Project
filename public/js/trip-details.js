const $queryObjectList = (qs) =>
  $(qs)
    .map((i, e) => $(e))
    .get();

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

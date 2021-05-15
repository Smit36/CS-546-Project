window.onload = function () {
  showExpense();
};

function addNewExpense() {
  var newExpense = $('#new-expense');
  var showForm = $('#show-form');
  var showExpenses = $('#show-expense');
  var getExpense = $('#get-expenses');
  var submitExpense = $('#submit-expense');

  newExpense.hide();
  showForm.show();
  showExpenses.show();
  getExpense.hide();

  $(submitExpense).on('click', function (event) {
    event.preventDefault();
    const validate = validateExpense();
    if (validate) {
      let data = {};
      let dateFormat = document.getElementById('date').value;
      const year = dateFormat.slice(0, 4);
      const month = dateFormat.slice(5, 7);
      const day = dateFormat.slice(8, 10);
      dateFormat = `${month}/${day}/${year}`;
      let method = document.getElementsByName('method');
      for (let i = 0; i < method.length; i++) {
        if (method[i].checked) {
          method = method[i].value;
          break;
        }
      }
      data = {
        userId: $('#user-id').text(),
        tripId: $('#expense-trip :selected').val(),
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        currency: $('#currency :selected').val(),
        amount: Number(document.getElementById('amount').value),
        method,
        date: dateFormat,
      };
      $.ajax({
        url: '/expense',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        success() {
          var successMessage = $('#success-expense');
          successMessage.show();
          $('#expense-form')[0].reset();
          setTimeout(function () {
            successMessage.hide();
          }, 5000);
        },
        error() {},
      });
    }
  });
}

function showExpense() {
  var newExpense = $('#new-expense');
  var showForm = $('#show-form');
  var showExpenses = $('#show-expense');
  var getExpense = $('#get-expenses');
  var expenseList = $('#expense-list');
  var modal = $('#modal');
  var total = $('.total-amount');

  showExpenses.hide();
  showForm.hide();
  newExpense.show();
  modal.hide();

  let totalExpense = 0;
  total.empty();
  expenseList.empty();
  let rates = [];

  $.ajax(`https://api.ratesapi.io/api/latest`, {
    success: function (data) {
      rates = data;
    },
  });

  $.ajax(`/expense/all`, {
    dataType: 'json',
    success: function (data, status, xhr) {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].payment.currency == '¥') {
            totalExpense += data[i].payment.amount / rates.rates.CNY / rates.rates.USD;
          } else if (data[i].payment.currency == '₹') {
            totalExpense += data[i].payment.amount / rates.rates.INR / rates.rates.USD;
          } else if (data[i].payment.currency == '€') {
            totalExpense += data[i].payment.amount / rates.rates.USD;
          } else {
            totalExpense += data[i].payment.amount;
          }
          $(expenseList).append(
            `<div class="row">
              <button class="expense" id=${data[i]._id}>
                <div class="row" >
                  <div class="col-25">${data[i].name}</div>
                  <div class="col-25">${data[i].payment.date}</div>
                  <div class="col-25">${data[i].payment.currency} ${data[i].payment.amount}</div>                
                  <div class="col-25">${data[i].trip.name}</div>
                </div>
              </button>
            </div>           
            `,
          );
          $(`#${data[i]._id}`).on('click', function (event) {
            event.preventDefault();
            modal.empty();
            modal.append(`
            <span onClick="showExpense()" class="close" title="Close Modal">×</span>
              <div class="detail">
                <h1>${data[i].name}</h1>
                <h2>${data[i].description}</h2>
                <p>Trip: ${data[i].trip.name}</p>
                <p>Created By: ${data[i].createdBy}</p>
                <p>Payment Amount:${data[i].payment.currency} ${data[i].payment.amount}</p>
                <p>Payment Mode: ${data[i].payment.method}</p>
                <p>Date: ${data[i].payment.date}</p>
                <p>Note*: ${data[i].payment.notes || ''}</p> 
                <input id="expenseId" value=${data[i]._id} hidden></input>               
                <button id="expense-delete" class="delete">Delete</button>
                <button id="expense-update" class="update">Update</button>              
              </div>
            `);
            window.onclick = function (event) {
              if (event.target == modal) {
                modal.hide();
              }
            };
            modal.show();
            $('#expense-update').on('click', function (event) {
              event.preventDefault();
              modal.empty();
              let dateFormat = data[i].payment.date;
              const year = dateFormat.slice(6, 10);
              const month = dateFormat.slice(3, 5);
              const day = dateFormat.slice(0, 2);
              dateFormat = `${year}-${day}-${month}`;
              if (data[i].payment.method == 'card') {
                card = true;
              } else if (data[i].payment.method == 'cash') {
                cash = true;
              } else if (data[i].payment.method == 'gpay') {
                gpay = true;
              } else {
                apple = true;
              }
              modal.append(`
              <span onClick="showExpense()" class="close" title="Close Modal">×</span>              
                <div class="detail">
                  <div id="update-expense-form">
                    <div class="row">
                      <div class="col-25">
                        <label for="name">Expense Name</label>
                      </div>
                      <div class="col-75">
                        <input type="text" id="update-name" name="expense_name" value=${
                          data[i].name
                        }>
                      </div>
                      <span id="update-name-error" hidden>Enter expense name.</span>                 
                    </div>
                    <div class="row">
                      <div class="col-25">
                        <label for="update-description">Description</label>
                      </div>
                      <div class="col-75">
                        <input type="text" id="update-description" name="update-description" value=${
                          data[i].description
                        }>
                      </div> 
                      <span id="update-description-error" hidden>Enter expense description.</span>
                    </div>
                    <div class="row">
                      <div class="col-25">
                        <label for="update-method">Payment Method</label>
                      </div>
                      <div class="col-25">
                        <div class="row">
                          <input type="radio" id="card" name="update-method" value="card" ${
                            data[i].payment.method == 'card' ? 'checked' : ''
                          }>
                          <label for="card">Card</label><br>
                          <input type="radio" id="cash" name="update-method" value="cash" ${
                            data[i].payment.method == 'cash' ? 'checked' : ''
                          }>
                          <label for="cash">Cash</label>
                        </div>                      
                        <span id="update-method-error" hidden>Select expense method.</span>
                      </div>
                      <div class="col-25">
                        <input type="radio" id="gpay" name="update-method" value="gpay" ${
                          data[i].payment.method == 'gpay' ? 'checked' : ''
                        } >
                        <label for="gpay">GPay</label><br>
                        <input type="radio" id="apple" name="update-method" value="apple" ${
                          data[i].payment.method == 'apple' ? 'checked' : ''
                        }>
                        <label for="Apple">Apple</label>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-25">
                        <label for="update-amount">Amount</label>
                      </div>
                      <div class="col-20">
                        <div class="row">
                          <select id="update-currency" name="currency">
                            <option id="$" value="$" ${
                              data[i].payment.currency == '$' ? 'selected' : ''
                            }>$-USD</option>
                            <option id="¥" value="¥" ${
                              data[i].payment.currency == '¥' ? 'selected' : ''
                            }>¥-CNY</option>
                            <option id="₹" value="₹" ${
                              data[i].payment.currency == '₹' ? 'selected' : ''
                            }>₹-INR</option>
                            <option id="€" value="€" ${
                              data[i].payment.currency == '€' ? 'selected' : ''
                            } >€-EUR</option>
                          </select>  
                        </div>
                        <span id="update-currency-error" hidden>Select expense currency.</span>
                      </div>
                      <div class="col-35">
                        <div class="row">                      
                          <input type="number" id="update-amount" name="amount" value=${
                            data[i].payment.amount
                          }>                     
                        </div>
                        <span id="update-amount-error" hidden>Enter expense amount.</span>     
                      </div>
                    </div> 
                    <div class="row">
                      <div class="col-25">
                        <label for="update-date">Date</label>
                      </div>
                      <div class="col-75">            
                        <div class="row">
                          <input type="date" id="update-date" name="date" value=${dateFormat}>
                        </div>
                        <span id="update-date-error" hidden>Select date.</span> 
                      </div>
                    </div>  
                    <span id="expense-update-success" hidden>Expense updated successfully!</span>            
                    <button type="button" class="confirm" id="expense-update-confirm">Save Changes</button>
                  </div>
                </div>
              `);

              var updateExpense = $('#expense-update-confirm');
              $(updateExpense).on('click', function (event) {
                event.preventDefault();
                const validate = validateUpdateExpense();
                if (validate) {
                  let update = {};
                  let dateFormat = document.getElementById('update-date').value;
                  const year = dateFormat.slice(0, 4);
                  const month = dateFormat.slice(5, 7);
                  const day = dateFormat.slice(8, 10);
                  dateFormat = `${month}/${day}/${year}`;
                  let method = document.getElementsByName('update-method');
                  for (let i = 0; i < method.length; i++) {
                    if (method[i].checked) {
                      method = method[i].value;
                      break;
                    }
                  }
                  update = {
                    userId: data[i].userId,
                    tripId: data[i].trip._id,
                    name: document.getElementById('update-name').value,
                    description: document.getElementById('update-description').value,
                    currency: document.getElementById('update-currency').value,
                    amount: Number(document.getElementById('update-amount').value),
                    method,
                    date: dateFormat,
                  };
                  $.ajax({
                    url: `/expense/${data[i]._id}`,
                    type: 'PUT',
                    data: JSON.stringify(update),
                    contentType: 'application/json; charset=utf-8',
                    success() {
                      var successMessage = $('#expense-update-success');
                      successMessage.show();
                      setTimeout(function () {
                        successMessage.hide();
                      }, 5000);
                    },
                    error() {},
                  });
                }
              });
            });
            $('#expense-delete').on('click', function (event) {
              event.preventDefault();
              modal.empty();
              modal.append(` 
              <span onClick="showExpense()" class="close" title="Close Modal">×</span>
                  <div class="detail">
                    <h1>Delete Expense</h1>
                    <p>Are you sure you want to delete your expense?</p>
                    <button id="delete-expense-confirm" class="confirm">Yes</button>
                    <button id="cancel" class="cancel">No</button>
                  </div>                
              `);
              $('#delete-expense-confirm').on('click', function () {
                $.ajax({
                  url: `/expense/${data[i]._id}`,
                  type: 'DELETE',
                  dataType: 'json',
                  success() {
                    modal.hide();
                    showExpense();
                  },
                });
              });
            });
          });
        }
        $(total).append(`<h2>Total Expense: $ ${totalExpense.toFixed(2)}</h2>`);

        expenseList.show();
        total.show();
      } else {
        $(expenseList).html(`<p>Expense not found</p>`);
        expenseList.show();
      }
      $(getExpense).show();
    },
    error: function (jqXhr, textStatus, errorMessage) {
      // error callback
      $(expenseList).html(`<p>Expense not found</p>`);
      expenseList.show();
      $(getExpense).show();
    },
  });
}

function validateExpense() {
  let error = 0;
  if (!$('#name').val()) {
    $('#name-error').show();
    error++;
  } else {
    $('#name-error').hide();
  }
  if (!$('#description').val()) {
    $('#description-error').show();
    error++;
  } else {
    $('#description-error').hide();
  }
  if (!$('input[name="method"]:checked').val()) {
    $('#method-error').show();
    error++;
  } else {
    $('#method-error').hide();
  }
  if (
    !$('#currency').find(':selected').text() ||
    $('#currency').find(':selected').text() == 'Currency'
  ) {
    $('#currency-error').show();
    error++;
  } else {
    $('#currency-error').hide();
  }
  if (!$('#amount').val()) {
    $('#amount-error').show();
    error++;
  } else {
    $('#amount-error').hide();
  }
  if (!$('#date').val()) {
    $('#date-error').show();
    error++;
  } else {
    $('#date-error').hide();
  }
  if (error == 0) return true;
  return false;
}

function validateUpdateExpense() {
  let error = 0;
  if (!$('#update-name').val()) {
    $('#update-name-error').show();
    error++;
  } else {
    $('#update-name-error').hide();
  }
  if (!$('#update-description').val()) {
    $('#update-description-error').show();
    error++;
  } else {
    $('#update-description-error').hide();
  }
  if (!$('input[name="update-method"]:checked').val()) {
    $('#update-method-error').show();
    error++;
  } else {
    $('#update-method-error').hide();
  }
  if (
    !$('#update-currency').find(':selected').text() ||
    $('#update-currency').find(':selected').text() == 'Currency'
  ) {
    $('#update-currency-error').show();
    error++;
  } else {
    $('#update-currency-error').hide();
  }
  if (!$('#update-amount').val()) {
    $('#update-amount-error').show();
    error++;
  } else {
    $('#update-amount-error').hide();
  }
  if (!$('#update-date').val()) {
    $('#update-date-error').show();
    error++;
  } else {
    $('#update-date-error').hide();
  }
  if (error == 0) return true;
  return false;
}

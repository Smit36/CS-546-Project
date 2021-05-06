function addNewExpense() {
  document.getElementById('new-expense').style.display = 'none';
  document.getElementById('show-form').style.display = 'block';
  document.getElementById('show-expense').style.display = 'block';

  var getExpense = $('#get-expenses');
  getExpense.hide();

  var submitExpense = $('.submit');
  $(submitExpense).on('click', function (event) {
    event.preventDefault();
    let data = {};
    let dateFormat = document.getElementById('date').value;
    const year = dateFormat.slice(0, 4);
    const month = dateFormat.slice(5, 7);
    const day = dateFormat.slice(8, 10);
    dateFormat = `${month}/${day}/${year}`;
    data = {
      userId: '60832c0f8b6948b77e6dc3c5',
      tripId: '60832c49d9bafeae5372234c',
      name: document.getElementById('name').value,
      description: document.getElementById('description').value,
      currency: document.getElementById('currency').value,
      amount: Number(document.getElementById('amount').value),
      method: document.getElementById('method').value,
      date: dateFormat,
    };
    $.ajax({
      url: 'http://localhost:3000/expense',
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      success(data) {
        console.log(data);
        $('#expense-form')[0].reset();
        alert('Successfully added');
      },
      error() {},
    });
  });
}

function showExpenses() {
  document.getElementById('show-expense').style.display = 'none';
  document.getElementById('show-form').style.display = 'none';
  document.getElementById('new-expense').style.display = 'block';
  document.getElementById('modal').style.display = 'none';
  let totalExpense = 0;
  var getExpense = $('#get-expenses');
  var expenseList = $('#expense-list');
  var total = $('.total-amount');
  total.empty();
  expenseList.empty();
  let tripId = '60832c49d9bafeae5372234c';
  $.ajax(`http://localhost:3000/expense/trip/${tripId}`, {
    dataType: 'json',
    success: function (data, status, xhr) {
      console.log(status);
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          totalExpense += data[i].payment.amount;
          $(expenseList).append(
            `<div class="row">
              <button class="expense" id=${data[i]._id}>
                <div class="row" >
                  <div class="col-25">${data[i].name}</div>
                  <div class="col-25">${data[i].payment.date}</div>
                  <div class="col-25">${data[i].payment.currency} ${data[i].payment.amount}</div>                
                  <div class="col-25">${data[i].userId}</div>
                </div>
              </button>
            </div>           
            `,
          );
          $(`#${data[i]._id}`).on('click', function (event) {
            event.preventDefault();
            let modal = $('#modal');
            modal.empty();
            modal.append(`
            <span onclick="document.getElementById('modal').style.display='none'" class="close" title="Close Modal">×</span>
              <div class="detail">
                <h1>${data[i].name}</h1>
                <h2>${data[i].description}</h2>
                <p>Trip: ${data[i].tripId}</p>
                <p>Created By: ${data[i].createdBy}</p>
                <p>Payment Amount:${data[i].payment.currency} ${data[i].payment.amount}</p>
                <p>Payment Mode: ${data[i].payment.method}</p>
                <p>Date: ${data[i].payment.date}</p>
                <p>Note*: ${data[i].payment.notes}</p>                
                <button class="delete-button">Delete</button>
                <button class="update-button">Update</button>              
              </div>
            `);
            window.onclick = function (event) {
              if (event.target == modal) {
                modal.style.display = 'none';
              }
            };
            $('#modal').show();
            $('.update-button').on('click', function (event) {
              event.preventDefault();
              let modal = $('#modal');
              modal.empty();
              modal.append(`<span onclick="document.getElementById('modal').style.display='none'" class="close" title="Close Modal">×</span>
              `);
              modal.append(`<div class="row detail">
              <div class="col-25">
                <label for="expense-name">Expense Name</label>
              </div>
              <div class="col-75">
                <input type="text" id="expense-name" name="expense_name"  value=${data[i].name}>
              </div>
            </div>
            <div class="row">
              <div class="col-25">
                <label for="description">Description</label>
              </div>
              <div class="col-75">
                <input type="text" id="description" name="description" value=${data[i].description}>
              </div>
            </div>
            <div class="row">
              <div class="col-25">
                <label for="method">Payment Method</label>
              </div>
              <div class="col-25">
                <input type="radio" id="card" name="currency" value="card">
                <label for="card">Card</label><br>
                <input type="radio" id="cash" name="currency" value="cash">
                <label for="cash">Cash</label>
              </div>
              <div class="col-25">
                <input type="radio" id="gpay" name="currency" value="gpay">
                <label for="gpay">GPay</label><br>
                <input type="radio" id="apple" name="currency" value="apple">
                <label for="Apple">Apple</label>
              </div>
            </div>
            <div class="row">
              <div class="col-25">
                <label for="currency">Currency</label>
              </div>
              <div class="col-10">
                <select id="currency" name="currency" value=${data[i].payment.currency}>
                  <option value="usd">$-USD</option>
                  <option value="cny">¥-CNY</option>
                  <option value="inr">₹-INR</option>
                  <option value="jpy">¥-JPY</option>
                </select>
              </div>
              <div class="col-25">
                <label for="amount">Amount</label>
              </div>
              <div class="col-35">
                <input type="text" id="amount" name="amount" value=${data[i].payment.amount}">
              </div>
            </div>
            <div class="row">
              <div class="col-25">
                <label for="date">Date</label>
              </div>
              <div class="col-75">
                <input type="date" id="expense-date" name="expense-date" value=${data[i].payment.date}>
              </div>
            </div>
            <button type="submit">Save Changes</button>`);
            });
            $('.delete-button').on('click', function (event) {
              event.preventDefault();
              console.log('hi');
              let modal = $('#modal');
              modal.empty();
              modal.append(`                
                  <div class="detail">
                    <h1>Delete Expense</h1>
                    <p>Are you sure you want to delete your expense?</p>
                    <button class="delete-expense">Yes</button>
                    <button class="cancel">No</button>
                  </div>                
              `);
              $('.delete-expense').on('click', function () {
                $.ajax({
                  url: `http://localhost:3000/expense/${data[i]._id}`,
                  type: 'DELETE',
                  dataType: 'json',
                  success(data) {
                    let modal = $('#modal');
                    modal.hide();
                    showExpenses();
                  },
                });
              });
            });
          });
        }
        $(total).append(`<h2>Total Expense: $ ${totalExpense}</h2>`);
        expenseList.show();
        total.show();
      }
      $(getExpense).show();
    },
    error: function (jqXhr, textStatus, errorMessage) {
      // error callback
      console.log(errorMessage);
    },
  });
}

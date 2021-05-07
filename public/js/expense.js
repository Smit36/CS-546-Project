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
    let method = document.getElementsByName('method');
    for (let i = 0; i < method.length; i++) {
      if (method[i].checked) {
        method = method[i].value;
        break;
      }
    }
    data = {
      userId: '60832c0f8b6948b77e6dc3c5',
      tripId: '60832c49d9bafeae5372234c',
      name: document.getElementById('name').value,
      description: document.getElementById('description').value,
      currency: document.getElementById('currency').value,
      amount: Number(document.getElementById('amount').value),
      method,
      date: dateFormat,
    };
    $.ajax({
      url: 'http://localhost:3000/expense',
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      success() {
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
                <input id="expenseId" value=${data[i]._id} hidden></input>               
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
              let dateFormat = data[i].payment.date;
              const year = dateFormat.slice(6, 10);
              const month = dateFormat.slice(3, 5);
              const day = dateFormat.slice(0, 2);
              dateFormat = `${year}-${month}-${day}`;
              modal.append(`<span onclick="document.getElementById('modal').style.display='none'" class="close" title="Close Modal">×</span>
              `);
              let card = false,
                cash = false,
                gpay = false,
                apple = false;
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
                <div class="detail">
                  <div id="update-expense-form">
                  <div class="row">
                  <div class="col-25">
                    <label for="name">Expense Name</label>
                  </div>
                  <div class="col-75">
                    <input type="text" id="update-name" name="expense_name" value=${data[i].name}>
                  </div>
                </div>
                <div class="row">
                  <div class="col-25">
                    <label for="update-description">Description</label>
                  </div>
                  <div class="col-75">
                    <input type="text" id="update-description" name="update-description" value=${data[i].description}>
                  </div>
                </div>
                <div class="row">
                  <div class="col-25">
                    <label for="update-method">Payment Method</label>
                  </div>
                  <div class="col-25">
                    <input type="radio" id="card" name="update-method" value="card" checked=${card}>
                    <label for="card">Card</label><br>
                    <input type="radio" id="cash" name="update-method" value="cash" checked=${cash}>
                    <label for="cash">Cash</label>
                  </div>
                  <div class="col-25">
                    <input type="radio" id="gpay" name="update-method" value="gpay" checked=${gpay}>
                    <label for="gpay">GPay</label><br>
                    <input type="radio" id="apple" name="update-method" value="apple" checked=${apple}>
                    <label for="Apple">Apple</label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-25">
                    <label for="update-amount">Amount</label>
                  </div>
                  <div class="col-15">
                    <select id="update-currency" name="currency" value=${data[i].payment.currency}>
                      <option id="$" value="$">$-USD</option>
                      <option id="¥" value="¥">¥-CNY</option>
                      <option id="₹" value="₹">₹-INR</option>
                      <option id="€" value="€">€-EUR</option>
                    </select>
                  </div>
                  <div class="col-35">
                    <input type="number" id="update-amount" name="amount" value=${data[i].payment.amount}>
                  </div>
                </div>
                <div class="row">
                  <div class="col-25">
                    <label for="update-date">Date</label>
                  </div>
                  <div class="col-75">
                    <input type="date" id="update-date" name="date" value=${dateFormat}>
                  </div>
                </div>
                <button type="button" class="update">Save Changes</button>
                  </div>
                </div>
              `);

              var updateExpense = $('.update');
              $(updateExpense).on('click', function (event) {
                event.preventDefault();
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
                console.log(document.getElementById('update-description').value);
                update = {
                  userId: '60832c0f8b6948b77e6dc3c5',
                  tripId: '60832c49d9bafeae5372234c',
                  name: document.getElementById('update-name').value,
                  description: document.getElementById('update-description').value,
                  currency: document.getElementById('update-currency').value,
                  amount: Number(document.getElementById('update-amount').value),
                  method,
                  date: dateFormat,
                };
                console.log(update);
                $.ajax({
                  url: `http://localhost:3000/expense/${data[i]._id}`,
                  type: 'PUT',
                  data: JSON.stringify(update),
                  contentType: 'application/json; charset=utf-8',
                  success() {
                    //$('#update-expense-form')[0].reset();
                    alert('Successfully updated');
                    modal.hide();
                  },
                  error() {},
                });
              });
            });

            $('.delete-button').on('click', function (event) {
              event.preventDefault();
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

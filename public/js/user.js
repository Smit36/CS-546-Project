window.onload = function () {
  showUsers();
};

var rankData = {};

function addNewUser() {
  document.getElementById('new-user').style.display = 'none';
  document.getElementById('show-form').style.display = 'block';
  document.getElementById('show-user').style.display = 'block';

  var getUser = $('#get-users');
  getUser.hide();

  let requestConfig = {
    method: 'GET',
    url: 'http://localhost:3000/rank/all',
  };

  $.ajax(requestConfig).then(function (responseMessage) {
    rankData = responseMessage;
    console.log(rankData);
    var rank = $('#rank');
    rank.empty();
    rank.append(`<option default>Select Rank</option>`);
    for (let i = 0; i < rankData.length; i++) {
      rank.append(
        `<option id="${rankData[i].name}" value="${rankData[i].name}">${rankData[i].name}</option>`,
      );
    }
  });

  var userForm = $('#user-form');
  var submitUser = $('.submit');
  userForm.submit(function (event) {
    event.preventDefault();

    const validate = validateUser();
    if (validate) {
      let data = {};

      let role = document.getElementsByName('role');
      for (let i = 0; i < role.length; i++) {
        if (role[i].checked) {
          role = role[i].value;
          break;
        }
      }

      let selectedRank = $('#rank :selected').val();
      let rankId = null;
      let level = 0;

      for (let r of rankData) {
        if (r.name === selectedRank.trim()) {
          rankId = r._id.toString();
          level = r.level;
        }
      }

      data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        contact: document.getElementById('contact').value,
        designation: selectedRank,
        rankId: rankId,
        rank: level,
        role: role,
      };

      console.log(data);

      $.ajax({
        url: 'http://localhost:3000/user',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        success() {
          $('#user-form')[0].reset();
          alert('Successfully added');
        },
        error() {},
      });
    }
  });
}

function getRankData() {
  let requestConfig = {
    method: 'GET',
    url: 'http://localhost:3000/rank/all',
  };

  $.ajax(requestConfig).then(function (responseMessage) {
    let ranksData = responseMessage;
    return ranksData;
  });
}

function showUsers() {
  document.getElementById('show-user').style.display = 'none';
  document.getElementById('show-form').style.display = 'none';
  document.getElementById('new-user').style.display = 'block';
  document.getElementById('modal').style.display = 'none';
  var getUser = $('#get-users');
  var userList = $('#user-list');
  userList.empty();

  $.ajax(`http://localhost:3000/user/all`, {
    dataType: 'json',
    success: function (data, status, xhr) {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          $(userList).append(
            `<div class="row">
                <button class="user" id=${data[i]._id}>
                  <div class="row" >
                    <div class="col-25">${data[i].name}</div>
                    <div class="col-25">${data[i].email}</div>
                    <div class="col-25">${data[i].contact}</div>                
                    <div class="col-25">${data[i].role}</div>
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
                  <h2>Corporate: ${data[i].corporateId}</h2>
                  <p>Email: ${data[i].email}</p>
                  <p>Contact: ${data[i].contact}</p>
                  <p>Role: ${data[i].role}</p>
                  <p>Designation: ${data[i].designation}</p>
                  <input id="userId" value=${data[i]._id} hidden></input>               
                  <button id="user-delete" class="delete">Delete</button>
                  <button id="user-update" class="update">Update</button>              
                </div>
              `);
            window.onclick = function (event) {
              if (event.target == modal) {
                modal.style.display = 'none';
              }
            };
            $('#modal').show();
            $('#user-update').on('click', function (event) {
              event.preventDefault();
              let modal = $('#modal');
              modal.empty();
              modal.append(`<span onclick="document.getElementById('modal').style.display='none'" class="close" title="Close Modal">×</span>
                `);

              let admin = false,
                corporate = false,
                employee = false;

              if (data[i].role == 'ADMIN') {
                admin = true;
              } else if (data[i].role == 'CORPORATE') {
                corporate = true;
              } else if (data[i].role == 'EMPLOYEE') {
                employee = true;
              }

              modal.append(`
                  <div class="detail">
                  <form id="update-user-form">
                    <div class="row">
                    <div class="col-25">
                      <label for="update-name">Name</label>
                    </div>
                    <div class="col-75">
                      <input type="text" id="update-name" name="name" pattern="^[a-zA-Z ']{2,30}$" value=${
                        data[i].name
                      } required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-25">
                      <label for="update-email">Email</label>
                    </div>
                    <div class="col-75">
                      <input type="email" id="update-email" name="update-email" value=${
                        data[i].email
                      } pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-25">
                      <label for="update-contact">Contact</label>
                    </div>
                    <div class="col-75">
                      <input type="tel" id="update-contact" name="update-contact" value=${
                        data[i].contact
                      } pattern="^\(?([0-9]{3})\)?[- ]+?([0-9]{3})[- ]+?([0-9]{4})$" required>
                    </div>
                  </div>  
                  <div class="row">
                    <div class="col-25">
                      <label for="update-role">Role</label>
                    </div>
                    <div class="col-25">
                      <input type="radio" id="admin" name="update-role" value="ADMIN" ${
                        admin ? (checked = 'checked') : ''
                      } required>
                      <label for="admin">Portal Admin</label><br>
                      <input type="radio" id="corporate" name="update-role" value="CORPORATE" ${
                        corporate ? (checked = 'checked') : ''
                      }>
                      <label for="corporate">Corporate Admin</label><br>
                      <input type="radio" id="employee" name="update-role" value="EMPLOYEE" ${
                        employee ? (checked = 'checked') : ''
                      }>
                      <label for="employee">Employee</label>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-25">
                      <label for="update-rank">Rank</label>
                    </div>
                    <div class="col-15">
                      <select id="update-rank" name="rank">
                        
                      </select>
                    </div>
                  </div>
                  <button type="button" class="confirm" id="user-update-confirm">Save Changes</button>                  
                  </form>
                  </div>
                `);
              let updateRank = $('#update-rank');
              let designation = data[i].designation;
              for (let i = 0; i < rankData.length; i++) {
                updateRank.append(`<option id="${rankData[i].name}" value="${rankData[i].name}"
                  ${designation == rankData[i].name ? 'selected' : ''}>${
                  rankData[i].name
                }</option>`);
              }

              var updateUserForm = $('#update-user-form');
              updateUserForm.submit(function (event) {
                event.preventDefault();
                let update = {};

                let role = document.getElementsByName('update-role');
                for (let i = 0; i < role.length; i++) {
                  if (role[i].checked) {
                    role = role[i].value;
                    break;
                  }
                }

                let selectedRank = $('#update-rank :selected').val();
                let rankId = null;
                let level = 0;

                for (let r of rankData) {
                  if (r.name === selectedRank.trim()) {
                    rankId = r._id.toString();
                    level = r.level;
                  }
                }

                update = {
                  name: document.getElementById('update-name').value,
                  email: document.getElementById('update-email').value,
                  contact: document.getElementById('update-contact').value,
                  designation: selectedRank,
                  rank: level,
                  rankId: rankId,
                  role: role,
                };
                console.log(update);
                $.ajax({
                  url: `http://localhost:3000/user/${data[i]._id}`,
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

            $('#user-delete').on('click', function (event) {
              event.preventDefault();
              let modal = $('#modal');
              modal.empty();
              modal.append(`                
                    <div class="detail">
                      <h1>Delete User</h1>
                      <p>Are you sure you want to delete your user?</p>
                      <button class="delete-user">Yes</button>
                      <button class="cancel">No</button>
                    </div>                
                `);
              $('.delete-user').on('click', function () {
                $.ajax({
                  url: `http://localhost:3000/user/${data[i]._id}`,
                  type: 'DELETE',
                  dataType: 'json',
                  success(data) {
                    let modal = $('#modal');
                    modal.hide();
                    showUsers();
                  },
                });
              });
            });
          });
        }
        userList.show();
      }
      $(getUser).show();
    },
    error: function (jqXhr, textStatus, errorMessage) {
      // error callback
      console.log(errorMessage);
    },
  });
}

function validateUser() {
  let error = 0;
  if (!$('input[name="role"]:checked').val()) {
    $('#role-error').show();
    error++;
  } else {
    $('#role-error').hide();
  }

  if (
    !$('#rank').find(':selected').text() ||
    $('#rank').find(':selected').text() == 'Select Rank'
  ) {
    $('#rank-error').show();
    error++;
  } else {
    $('#rank-error').hide();
  }

  if (error == 0) return true;

  return false;
}
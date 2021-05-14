var list = $(".link").val();
var del = $("#delete");
var card = $(".single-card");
var info = $("#title-info");
var edit = $("#edit");
var back = $("#previous");
var create = $(".corporate-create");
var createAdd = $(".add-create");
var corporateList = $(".corporates-list");
var error = $(".container-error");
card.show();
del.show();
edit.show();
back.show();
var emailError = false;
var contactError = false;

// Create Corporate Button Click
create.on("click", function (event) {
  create.hide();
  event.preventDefault();
  corporateList.hide();
  $(createAdd).append(`<form id='myform'>
    <h1 id = "info">New Corporate Information</h1>
    <p id="info-data">Please Fill all the Information to Add New Corporate Data.</p>
    <hr>
    <div id='input'>
    <label for="name" >Corporate Name
      <input type="text" id="name" placeholder="Enter Name" pattern="^[a-zA-Z ']{2,50}$" required>
      <span id="name-error" hidden>Please Enter Valid Name</apan>
    </label>
    </div>
    <div>
    <label for="email">Corporate Domain Email
      <input type="text" id="email"  placeholder="Enter Domain" pattern"^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$" required>
      <span id="email-error" hidden>Please Enter Valid Domain Email</span>
    </label>
    </div>
    <div>
    <label for="contact">Corporate Contact_No
      <input type="text" id="contact"  placeholder="Enter Contact" pattern="^\(?([0-9]{3})\)?[- ]+?([0-9]{3})[- ]+?([0-9]{4})$" required>
      <span id="contact-error" hidden>Please Enter Valid Contact</span>
    </label>
    </div>
    <div>
    <label for="address">Corporate Address
      <input type="text" id="address" placeholder="Enter Address" pattern="^[a-zA-Z ']{2,50}$" required>
      <span id="address-error" hidden>Please Enter Valid Address</span>
    </label>
    </div>
    <input type="submit" value="Submit" class="submit-create"/>
    <a href="/corporates" class='nav' id="previous">Back</a>
  </form>`);

  var submit_create = $(".submit-create");

  submit_create.on("click", function (event) {
    var corporate_name = $("#name").val();
    var corporate_email = $("#email").val();
    var corporate_contact = $("#contact").val();
    var corporate_address = $("#address").val();

    const validate = corporateEmptyValidation();
    
    var data = {
      name: corporate_name,
      emailDomain: corporate_email,
      contactNo: corporate_contact,
      address: corporate_address,
    };

    if (validate) {
      $.ajax({
        url: "/corporates",
        type: "POST",
        data: data,
        success(data) {
          window.location.replace(`/corporates/${data.corporate._id}`);
        },
        error(error) {
          if (error.responseJSON.message.includes("Email")) {
            emailError = true;
          } else if (error.responseJSON.message.includes("Contact")) {
            contactError = true;
          } 
          showError()
        },
      });
    }
  });
});
corporateList.show();

// Delete Corporate Button Click
del.on("click", function (event) {
  event.preventDefault();
  let url = $(this).attr("href");
  $.ajax({
    url: url,
    type: "DELETE",
    success(data) {
      card.hide();
      info.append(
        jQuery(document.createElement("h1")).text(
          "Corporate Deleted Succesfully."
        )
      );
      del.hide();
      edit.hide();
      back.hide();
      info.append(`<a href="/corporates" class='nav'>Back</a>`);
    },
  });
});

var container = $(".container-edit");
var container_info = $(".container-info");
var container_update = $(".container-update");
container_update.hide();

// Edit Corporate Button Click
edit.on("click", function (event) {
  event.preventDefault();
  del.hide();
  edit.hide();
  let co_email = $(this).attr("name");

  $(container).append(
    `<form>
    <h1>Edit Corporate Information</h1>
    <p>Please Fill all the Information to Edit Corporate Data.</p>
    <hr>
    <div>
      <h2>Corporate Domain: ${co_email}</h2>
    <div>
    <label for="name" >Corporate Name
      <input type="text" id="name" placeholder="Enter Name" pattern="^[a-zA-Z ']{2,50}$" required>
      <span id="name-error" hidden>Please Enter Valid Name</apan>
    </label>
    </div>
    <div>
    <label for="contact">Corporate Contact_No
      <input type="text" id="contact"  placeholder="Enter Contact" pattern="^\(?([0-9]{3})\)?[- ]+?([0-9]{3})[- ]+?([0-9]{4})$" required>
      <span id="contact-error" hidden>Please Enter Valid Contact</span>
    </label>
    </div>
    <div>
    <label for="address">Corporate Address
      <input type="text" id="address" placeholder="Enter Address" pattern="^[a-zA-Z ']{2,50}$" required>
      <span id="address-error" hidden>Please Enter Valid Address</span>
    </label>
    </div>
    <input type="submit" value="Submit" class="submit-edit"  />
  </form>`
  );

  var submit_edit = $(".submit-edit");
  let edit_url = $(this).attr("href");

  submit_edit.on("click", function (event) {
    
    var corporate_name = $("#name").val();
    var corporate_contact = $("#contact").val();
    var corporate_address = $("#address").val();

    const validate = corporateEmptyValidation();

    var data = {
      name: corporate_name,
      contactNo: corporate_contact,
      address: corporate_address,
    };

    if (validate) {
      event.preventDefault();
      $.ajax({
        url: edit_url,
        type: "PUT",
        data: data,
        success(data) {
          window.location.reload();
        },
      });
    }
  });
});

// Validation for Input Field
function corporateEmptyValidation() {
  event.preventDefault();
  let error = 0;
  if (!$("#name").val()) {
    $("#name-error").show();
    error += 1;
  } else {
    $("#name-error").hide();
  }
  if (!$("#contact").val() || !($("#contact").val().match(/^\(?([0-9]{3})\)?[- ]+?([0-9]{3})[- ]+?([0-9]{4})$/))) {
    $("#contact-error").show();
    error += 1;
  } else {
    $("#contact-error").hide();
  }
  if (!$("#address").val()) {
    $("#address-error").show();
    error += 1;
  } else {
    $("#address-error").hide();
  }
 
  contactError = false;
  emailError = false;
  if (error === 0) {
    return true;
  } else {
    return false;
  }
}

// Error Checking
function showError(){
  if (contactError) {
      $("#contact-error").show();
    } else {
      $("#contact-error").hide();
    }
}
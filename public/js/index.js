var list = $(".link").val();
var del = $('#delete');
var card = $('.single-card');
var info = $('#title-info');
var edit = $('#edit');
var back = $('#previous');
card.show();
del.show();
edit.show();
back.show();

del.on('click', function (event) {
  event.preventDefault();
  let url = $(this).attr('href');
  $.ajax({
    url: url,
    type: "DELETE",
    success(data){
      card.hide();
      info.append(jQuery(document.createElement("h1")).text("Corporate Deleted Succesfully."))
      del.hide();
      edit.hide();
      back.hide();
      info.append(`<a href="/corporate" class='nav'>Back</a>`)
    }
  });
});

var container = $('.container-edit')
var container_info = $('.container-info')
var container_update = $('.container-update')
container_update.hide()

edit.on('click', function(event){
  event.preventDefault();
  del.hide();
  $(container).append(
    `<form>
    <h1>Edit Corporate Information</h1>
    <p>Please Fill all the Information to Edit Corporate Data.</p>
    <hr>
    <label for="name" >Corporate Name
      <input type="text" id="name" placeholder="Enter Name">
    </label>
    <label for="email">Corporate Email
      <input type="text" id="email"  placeholder="Enter Email">
    </label>
    <label for="contact">Corporate Contact_No
      <input type="text" id="contact"  placeholder="Enter Contact">
    </label>
    <label for="address">Corporate Address
      <input type="text" id="address" placeholder="Enter Address">
    </label>
    <input type="submit" value="Submit" class="submit-edit"  />
  </form>`
  )
  var submit_edit = $('.submit-edit')
  let edit_url = $(this).attr('href');
    
    submit_edit.on('click', function(event){
    
      let corporate_name = $('#name').val();
      var corporate_email = $('#email').val();
      var corporate_contact = $('#contact').val();
      var corporate_address = $('#address').val();
      let data = {
        name: corporate_name,
        emailDomain: corporate_email,
        contactNo: corporate_contact,
        address: corporate_address
      }
    event.preventDefault();
    $.ajax({
      url: edit_url,
      type: "PUT",
      data: data,
      success(data){
        window.location.reload()
      }
    })
  })
})





$(document).ready(function () {
  console.log($);
});

const link =  $('#id')

$('a').click(function(){
  $.ajax({
  type: "GET",
  url: "mysimplepage.php",
  async: true,
  data: { logDownload: true, file: $(this).attr("name") }
  });
  return false;
  });
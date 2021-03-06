window.onload = function () {
  showRanks();
};
function addNewRank() {
    document.getElementById('new-rank').style.display = 'none';
    document.getElementById('show-form').style.display = 'block';
    document.getElementById('show-rank').style.display = 'block';
  
    var getRank = $('#get-ranks');
    getRank.hide();
  
    var submitRank = $('#rank-form');
    submitRank.submit(function (event) {
      event.preventDefault();
      let data = {};

      data = {
        name: document.getElementById('name').value,
        level: document.getElementById('level').value,
      };
      
      $.ajax({
        url: '/rank',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        success(data) {
          console.log(data);
          $('#rank-form')[0].reset();
          alert('Successfully added');
        },
        error() {
          alert('Error occured while adding rank');
        },
      });
    });
}

function showRanks() {
    document.getElementById('show-rank').style.display = 'none';
    document.getElementById('show-form').style.display = 'none';
    document.getElementById('new-rank').style.display = 'block';
    document.getElementById('modal').style.display = 'none';
    var getRank = $('#get-ranks');
    var rankList = $('#rank-list');
    rankList.empty();

    $.ajax(`/rank/all`, {
        dataType: 'json',
        success: function (data, status, xhr) {
        if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
            $(rankList).append(
                `<div class="row">
                <div class="rank-button" id=${data[i]._id}>
                    <div class="row" >
                    <div class="col-25">${data[i].name}</div>
                    <div class="col-25">${data[i].level}</div>
                    </div>
                </div>
                </div>`,
            );
            }
            rankList.show();
        }
        $(getRank).show();
        },
        error: function (jqXhr, textStatus, errorMessage) {
        // error callback
        console.log(errorMessage);
        },
    });
}
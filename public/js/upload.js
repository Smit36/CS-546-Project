const $employeeUploadForm = $("#employee-upload-form");
const $employeeUploadInput = $("#employee-upload-input");
const $employeeUploadError = $("#employee-upload-error");

const getCorporateId = $("#corporate-id").html().trim();

function setError(error) {
  if (!error) $employeeUploadError.hide().empty();
  else $employeeUploadError.html(error).show();
}

function handleUploadSubmit(e) {
  e.preventDefault();

  setError();

  const inputFile = $employeeUploadInput.prop("files")[0];
  if (!inputFile || inputFile.type !== 'text/csv') {
    setError('Please select a .csv file.');
  } else {
    Papa.parse(inputFile, {
      header: true,
      delimiter: ',',
      skipEmptyLines: 'greedy',
      columns: ["name", "email", "password", "contact", "designation", "rank"],
      error(error) {
        setError(error);
      },
      complete({ data }) {
        const errors = [];
        const employeeDataList = data.map((employeeData, i) => {
          const errorHead = `Row ${i + 1}: `;
          const { name, email, password, contact, designation, rank } =
            employeeData;
  
          if (!name) {
            errors.push(errorHead + "Name should not be empty.");
          }
  
          if (!email) {
            errors.push(errorHead + "email should not be empty.");
          } else if (
            !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)
          ) {
            errors.push(errorHead + "Invalid email format.");
          }
  
          if (!password) {
            errors.push(errorHead + "Password should not be empty.");
          }
  
          if (!contact) {
            errors.push(errorHead + "Contact should not be empty.");
          } else if (
            !/^\(?([0-9]{3})\)?[- ]+?([0-9]{3})[- ]+?([0-9]{4})$/.test(contact)
          ) {
            errors.push(errorHead + "Invalid contact format.");
          }
  
          if (!designation) {
            errors.push(errorHead + "Designation should not be empty.");
          }
  
          if (!rank) {
            errors.push(errorHead + "Rank level should not be empty.");
          } else if (!/^[0-9]+$/.test(rank)) {
            errors.push(errorHead + "Rank level should be a number.");
          }
  
          return employeeData;
        });

        if (data.length === 0) {
          setError('The file is empty.');
        } else if (errors.length > 0) {
          setError(errors.join("<br>"));
        } else {
          $.ajax({
            url: "/user/bulk-upload",
            method: "POST",
            data: JSON.stringify(employeeDataList),
            contentType: "application/json; charset=utf-8",
            success(_) {
              window.location.replace("/user");
            },
            error({ responseJSON }, __, error) {
              const { message = '' } = responseJSON;
              setError(`${error}` + (!!message ? `: ${message}`: ''));
            },
          });
        }
      },
    });
  }
}

$employeeUploadForm.submit(handleUploadSubmit);

const scripturl = "https://script.google.com/macros/s/AKfycbwoOKwTlrnQVxRdplScqo6qt4kx4HUG8SF3sqLF0BvMfE23lzaFCoMezFYg0G0xnyXX/exec";

$(document).ready(function() {
  $.LoadingOverlay("show");
  $('.form-control').on('input', onWeightChange);

  $('#searchdate,#deliveryround,#productreceivedday').datepicker({
    format: 'dd/mm/yyyy',
    language: 'th',
  }).on('changeDate', function(e) {
    let yearBE = e.date.getFullYear() + 543;
    this.value = this.value.replace(/\d{4}$/, yearBE);
  }).on('hide', function(e) {
    let yearBE = e.date.getFullYear() + 543;
    this.value = this.value.replace(/\d{4}$/, yearBE);
  });

  let originalData = [];
  let iddata = [];

  $.getJSON(scripturl, function(data) {
    originalData = data.data3;
    iddata = data.data4;
    populateTable(data.data3, 10);
    setupAutocomplete(data.data4);
    $.LoadingOverlay("hide");
  });

  $('#close').on('click', function() {
    $("#myModal").modal('hide');
  });
  $('#save').on('click', function() {
    submit()
  });

  $('#search').on('click', function() {
    search(originalData)
  });
  $('#clear').on('click', function() {
    clearSearch(originalData)
  });

  $('#printpdf').click(function() {
    printModalContent();
  });

  $('#myModal').on('shown.bs.modal', function(e) {
    showLatestID(iddata);
  });

})//นอก ready

function showLatestID(data) {
  let lastRow = data[data.length - 1];
  let latestID = lastRow[1];
  $("#pass2").val(latestID);
}



function printModalContent() {
  $("#myModal").modal('hide');
  let tel = $('#tel').val();
  let name = $('#username').val();
  let memberID = $('#pass1').val();
  let weight1 = $('#weight1').val();
  let weight2 = $('#weight2').val();
  let weight3 = $('#weight3').val();
  let weight4 = $('#weight4').val();
  let weight5 = $('#weight5').val();
  let weight6 = $('#weight6').val();
  let weight7 = $('#weight7').val();
  let weight8 = $('#weight8').val();
  let allweight = $('#allweight').val();
  let totalHKD = $('#TotalHKD').val();
  let moneyallweight = $('#moneyallweight').val();
  let branch = $('input[name="radio"]:checked').val();
  let parcelnumber = $('#parcelNo').val();
  let deliveryround = $('#deliveryround').val();
  let dateRecord = $('#hiddenDateRecord').val();
  let money = $('input[name="radio2"]:checked').val();
  let note = $('#note').val();
  printPage(tel, memberID, branch, parcelnumber, dateRecord, deliveryround, name, weight1, weight2, weight3, weight4, weight5, weight6, weight7, weight8, allweight, moneyallweight, totalHKD, money, note)
}

function setupAutocomplete(data) {
  $("#tel, #searchtelephone").autocomplete({
    source: function(request, response) {
      let term = request.term;
      let filteredNumbers = data.slice(1).filter(function(item) {
        return item[0].toString().startsWith(term);
      });
      response($.map(filteredNumbers, function(item) {
        return { label: item[0].toString(), value: item[0].toString(), data: item };
      }));
    },
    minLength: 1,
    select: function(event, ui) {
      let selectedData = ui.item.data;
      $(this).val(selectedData[0]);

      if ($(this).attr('id') === 'tel') {
        $("#pass1").val(selectedData[1]);
        $("#username").val(selectedData[2]);
      }

      event.preventDefault();
    }
  });
}

function search(originalData) {
  populateTable(originalData);

  let searchTelephoneValue = $('#searchtelephone').val().trim();
  let searchDateValue = $('#searchdate').val();
  let searchParcelNumberValue = $('#searchparcelnumber').val().trim();
  let dateParts = searchDateValue.split("/");
  let monthsTh = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  searchDateValue = `${dateParts[0]} ${monthsTh[parseInt(dateParts[1])]} ${dateParts[2]}`;

  $('#table-body tr').each(function() {
    let rowTelephone = $(this).find('td').eq(1).text().trim();
    let rowDate = $(this).find('td:nth-child(21)').text().trim();
    let rowParcelNumber = $(this).find('td').eq(4).text().trim();

    if (searchParcelNumberValue) {
      if (rowParcelNumber.toLowerCase() === searchParcelNumberValue.toLowerCase()) {
        $(this).show();
      } else {
        $(this).hide();
      }
    } else {
      if (rowTelephone.includes(searchTelephoneValue) && rowDate.includes(searchDateValue)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    }
  });
}


function clearSearch(originalData) {
  $('#searchtelephone').val('');
  $('#searchdate').val('');
  $('#searchparcelnumber').val('');
  populateTable(originalData, 10);
}

function populateTable(data, limit) {
  const headers = data[0];
  const tableBody = document.getElementById('table-body');
  let filteredData = data.slice(1).reverse();

  if (limit) {
    filteredData = filteredData.slice(0, limit);
  }

  const rows = filteredData.map(row => {
    const uid = row[headers.indexOf("UID")]
    const moneystatus = row[headers.indexOf("PaymentStatus")] || ""
    const deliveryStatus = row[headers.indexOf("DeliveryStatus")] || ""
    const dateReceived = row[headers.indexOf("DateReceived")] || ""
    const dateRecord = row[headers.indexOf("DateRecord")] || ""
    const tel = row[headers.indexOf("Telephone")] || ""
    const totalCost = row[headers.indexOf("TotalCost")] || ""
    const Notes = row[headers.indexOf("note")] || ""
    const Note2 = row[headers.indexOf("BkkRemark")] || ""
    const Cash = row[headers.indexOf("Cash")] || ""
    const Transfer = row[headers.indexOf("Transfer")] || ""
    preloadQRImage(tel);
    const deliveryDateValue = row[headers.indexOf("DeliveryDate")]
    const displayValue = (typeof deliveryDateValue === "undefined" || String(deliveryDateValue) === "NaN" || String(deliveryDateValue) === "NaN undefined NaN") ? "" : deliveryDateValue;

    return `
            <tr data-uid="${uid}">
                <td>${row[headers.indexOf("Item")] || ""}</td>
                <td>${row[headers.indexOf("Telephone")] || ""}</td>
                <td>${row[headers.indexOf("ID")] || ""}</td>
                <td>${row[headers.indexOf("Name")] || ""}</td>
                <td>${row[headers.indexOf("ParcelNo")] || ""}</td>
                <td>${row[headers.indexOf("ParcelType")] || ""}</td>
                <td>${row[headers.indexOf(28)] || ""}</td>
                <td>${row[headers.indexOf(30)] || ""}</td>
                <td>${row[headers.indexOf(32)] || ""}</td>
                <td>${row[headers.indexOf(35)] || ""}</td>
                <td>${row[headers.indexOf(38)] || ""}</td>
                <td>${row[headers.indexOf(40)] || ""}</td>
                <td>${row[headers.indexOf(45)] || ""}</td>
                <td>${row[headers.indexOf(60)] || ""}</td>
                <td>${row[headers.indexOf("TotalWeight")] || ""}</td>
                <td>${row[headers.indexOf("ExpanseType")] || ""}</td>
                <td>${row[headers.indexOf("CostExpense")] || ""}</td>
                <td>${row[headers.indexOf("CostWeight")] || ""}</td>
                <td>${row[headers.indexOf("TotalCost")] || ""}</td>
                <td>${row[headers.indexOf("Branch")] || ""}</td>
                <td>${displayValue}</td>

                <td><button onclick="handleButtonClick('print','${uid}', '${moneystatus}', '${deliveryStatus}', '${dateReceived}', '${dateRecord}','${totalCost}','${Notes}','${Note2}','${Cash}','${Transfer}')" type="button" class="btn btn-warning">พิมพ์</button></td>
            <td><button onclick="handleButtonClick('edit', '${uid}', '${moneystatus}', '${deliveryStatus}', '${dateReceived}', '${dateRecord}','${totalCost}','${Notes}','${Note2}','${Cash}','${Transfer}')" type="button" class="btn btn-info">แก้ไข</button></td>
            <td><button onclick="handleButtonClick('delete','${uid}')" type="button" class="btn btn-danger">ลบ</button></td>
            </tr>
        `

  }).join('')

  tableBody.innerHTML = rows
}

function resetModalFields() {
  $('.modal-body input[type="text"], .modal-body input[type="password"], .modal-body input[type="email"]').val('');
  $('.modal-body select').prop('selectedIndex', 0);
  $('.modal-body input[type="checkbox"], .modal-body input[type="radio"]').prop('checked', false);
}

function handleButtonClick(action, uid, moneystatus, DeliveryStatus, DateReceived, dateRecord, totalCost, Note, Note2, cash, transfer) {
  const $row = $(`tr[data-uid="${uid}"]`)
  const cells = $row.children()
  switch (action) {
    case 'addnew':
      resetModalFields()
      $("#myModal").modal('show')
      break
    case 'print':

      let tel = cells.eq(1).text()
      let memberID = cells.eq(0).text()
      let branch = cells.eq(19).text()
      let parcelnumber = cells.eq(4).text()
      let deliverydate = cells.eq(20).text()
      let name = cells.eq(3).text()
      let weight1 = cells.eq(6).text()
      let weight2 = cells.eq(7).text()
      let weight3 = cells.eq(8).text()
      let weight4 = cells.eq(9).text()
      let weight5 = cells.eq(10).text()
      let weight6 = cells.eq(11).text()
      let weight7 = cells.eq(12).text()
      let weight8 = cells.eq(13).text()
      let weightall = cells.eq(14).text()
      let expenses = cells.eq(16).text()
      printPage(tel, memberID, branch, parcelnumber, dateRecord, deliverydate, name, weight1, weight2, weight3, weight4, weight5, weight6, weight7, weight8, weightall, expenses, totalCost, moneystatus, Note)
      break
    case 'edit':
      $('#uiddata').val(uid)
      $('#tel').val(cells.eq(1).text())
      $('#username').val(cells.eq(3).text())
      $('#pass1').val(cells.eq(2).text())
      $('#weight1').val(cells.eq(6).text())
      $('#weight2').val(cells.eq(7).text())
      $('#weight3').val(cells.eq(8).text())
      $('#weight4').val(cells.eq(9).text())
      $('#weight5').val(cells.eq(10).text())
      $('#weight6').val(cells.eq(11).text())
      $('#weight7').val(cells.eq(12).text())
      $('#weight8').val(cells.eq(13).text())
      $('#moneyallweight').val(cells.eq(18).text())
      $('#expenses').val(cells.eq(16).text())
      $('#parcelNo').val(cells.eq(4).text())
      $('#parcelType').val(cells.eq(5).text())
      $('#note').val(Note)
      $('#note2').val(Note2)
      $('#Cash').val(cash)
      $('#Transfer').val(transfer)

      const formattedDate2 = formatDateFromISO(DateReceived);
      const originalDate = cells.eq(20).text();
      const formattedDate = formatDate(originalDate);
      const result = calculateTotal()
      const result2 = sumWeights()
      const result3 = calculateTotalWithExpenses();
      setDeliveryStatusSelect(DeliveryStatus);
      const valuesFromDatabase = cells.eq(15).text()
      setCheckboxBasedOnValue(valuesFromDatabase)
      const radioValue = cells.eq(19).text().trim();
      setSelectedRadio(radioValue);
      setPaymentStatusRadio(moneystatus)
      $('#hiddenDateRecord').val(dateRecord);
      $('#productreceivedday').val(formattedDate2)
      $('#deliveryround').val(formattedDate)
      $('#TotalHKD').val(result3)
      $('#allweight').val(result2)
      $('#moneyallweight').val(result)
      $("#myModal").modal('show')
      break
    case 'delete':
      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการลบข้อมูลนี้หรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          deleterow(uid);
        }
      });
      break

  }
}

function setDeliveryStatusSelect(deliveryStatus) {
  const selectElement = document.getElementById('deliveryStatusSelect');
  const options = selectElement.options;

  for (let i = 0; i < options.length; i++) {
    if (options[i].value === deliveryStatus) {
      selectElement.selectedIndex = i;
      break;
    }
  }
}

function formatDateFromISO(inputStr) {
  const date = new Date(inputStr);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

function formatDate(inputStr) {
  return inputStr.replace(/(\d{2})\s*(ต\.ค\.|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|พ\.ย\.|ธ\.ค\.|พ\.ค\.)\s*(\d{4})/, function(_, day, month, year) {
    let monthNumber;
    switch (month) {
      case "ม.ค.": monthNumber = "01"; break;
      case "ก.พ.": monthNumber = "02"; break;
      case "มี.ค.": monthNumber = "03"; break;
      case "เม.ย.": monthNumber = "04"; break;
      case "พ.ค.": monthNumber = "05"; break;
      case "มิ.ย.": monthNumber = "06"; break;
      case "ก.ค.": monthNumber = "07"; break;
      case "ส.ค.": monthNumber = "08"; break;
      case "ก.ย.": monthNumber = "09"; break;
      case "ต.ค.": monthNumber = "10"; break;
      case "พ.ย.": monthNumber = "11"; break;
      case "ธ.ค.": monthNumber = "12"; break;
    }
    return `${day}/${monthNumber}/${year}`;
  });
}

function setSelectedRadio(value) {
  const radios = document.querySelectorAll('input[name="radio"]');

  radios.forEach(radio => {
    if (radio.value === value) {
      radio.checked = true;
    }
  })
}

function setPaymentStatusRadio(paymentStatus) {
  const radios = document.querySelectorAll('input[name="radio2"]');

  radios.forEach(radio => {
    if (radio.value === paymentStatus) {
      radio.checked = true;
    }
  })
}

function setCheckboxBasedOnValue(values) {
  $('.list-group-item-check').each(function() {
    const checkboxId = $(this).attr('id')
    const labelText = $(`label[for=${checkboxId}]`).text().trim()

    if (values.includes(labelText)) {
      $(this).prop('checked', true)
    } else {
      $(this).prop('checked', false)
    }
  })
}

function calculateTotalWithExpenses() {
  const rawExpensesValue = Number($('#expenses').val()) || 0;
  const expensesValue = rawExpensesValue / 4;
  const totalWeights = Number(calculateTotal());

  return expensesValue + totalWeights;
}

function sumWeights() {
  const weightIds = ["weight1", "weight2", "weight3", "weight4", "weight5", "weight6", "weight7", "weight8"]

  let total = 0

  for (let i = 0; i < weightIds.length; i++) {
    let inputValue = parseFloat($("#" + weightIds[i]).val())
    if (!isNaN(inputValue)) {
      total += inputValue
    }
  }

  return total.toFixed(1)
}

function calculateTotal() {
  let total = 0

  const weights = {
    weight1: 28,
    weight2: 35,
    weight3: 30,
    weight4: 38,
    weight5: 45,
    weight6: 32,
    weight7: 60,
    weight8: 40
  }

  for (const weightKey in weights) {
    let inputValue = $(`#${weightKey}`).val()

    if (inputValue.trim() === "" || isNaN(inputValue)) {
      continue
    }

    inputValue = parseFloat(inputValue)

    total += weights[weightKey] * inputValue
  }

  return total.toFixed(1)
}

function onWeightChange() {
  const totalWeight = sumWeights();
  const calculatedTotal = calculateTotal();
  const result3 = calculateTotalWithExpenses();

  $('#TotalHKD').val(result3)
  $('#allweight').val(totalWeight)
  $('#moneyallweight').val(calculatedTotal)
}

function gatherDataFromModal() {
  const parcelNumber = $('#parcelNumber').val();
  const recordDate = $('#recordDate').val();
  return {
    parcelNumber,
    recordDate,
  };
}

function preloadQRImage(tel) {
  let img = new Image();
  img.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${tel}`;
}

function printPage(tel, memberID, branch, parcelnumber, dateRecord, deliverydate, name, weight1, weight2, weight3, weight4, weight5, weight6, weight7, weight8, weightall, expenses, result31, moneystatus, note) {
  const htmlToPrint = `
 <div class="container-fluid">
    <div class="row">
      <div class="col-sm-8 textbig borderframe">
        <h1>XTL</h1>
      </div>
      <div class="col-sm-4">
        <div class="row h-100">
          <div class="col-12 py-2 borderframe">
            <h1 style="font-size: 4rem;">${branch}</h1>
          </div>
          <div class="col-12 py-2 borderframe">
            <h1 style="font-size: 4rem;">${memberID}</h1>
          </div>
        </div>
      </div>

      <div class="col-4 borderframe">
        <h3>เลขพัสดุ</h3>
      </div>
      <div class="col-4 borderframe">
        <h3>วันที่บันทึก</h3>
      </div>
      <div class="col-4 borderframe">
        <h3>รอบส่ง</h3>
      </div>
      <div class="col-4 borderframe">
        <h3>${parcelnumber}</h3>
      </div>
      <div class="col-4 borderframe">
        <h3>${dateRecord}</h3>
      </div>
      <div class="col-4 borderframe">
        <h3>${deliverydate}</h3>
      </div>

      <div class="col-sm-7 borderframe">
        <div class="row h-100 w-100">
          <div class="col-4 py-2 borderframe">
            <h4>ชื่อ</h4>
          </div>
          <div class="col-8 py-2 borderframe">
            <h2>${name}</h2>
          </div>
          <div class="col-4 py-2 borderframe">
            <h4>เบอร์โทร</h4>
          </div>
          <div class="col-8 py-2 borderframe">
            <h2>${tel}</h2>
          </div>
        </div>
      </div>
      <div class="col-sm-5 borderframe">
        <img src="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${tel}">
      </div>

      <div class="col-2 borderframe">เรท(HKD/Kg)</div>
      <div class="col-1 borderframe">28 HK</div>
      <div class="col-1 borderframe">30 HK</div>
      <div class="col-1 borderframe">32 HK</div>
      <div class="col-1 borderframe">35 HK</div>
      <div class="col-1 borderframe">38 HK</div>
      <div class="col-1 borderframe">40 HK</div>
      <div class="col-1 borderframe">45 HK</div>
      <div class="col-1 borderframe">60 HK</div>
      <div class="col-2 borderframe">Total (Kg)</div>

      <div class="col-2 borderframe">น้ำหนัก (Kg)</div>
      <div class="col-1 borderframe">${weight1}</div>
      <div class="col-1 borderframe">${weight2}</div>
      <div class="col-1 borderframe">${weight3}</div>
      <div class="col-1 borderframe">${weight4}</div>
      <div class="col-1 borderframe">${weight5}</div>
      <div class="col-1 borderframe">${weight6}</div>
      <div class="col-1 borderframe">${weight7}</div>
      <div class="col-1 borderframe">${weight8}</div>
      <div class="col-2 borderframe">${weightall} Kg</div>

      <div class="col-2 borderframe">ค่าใช้จ่ายอื่นๆ</div>
      <div class="col-5 borderframe">${expenses}</div>
      <div class="col-3 borderframe">ค่าใช้จ่ายอื่นๆ HKD</div>
      <div class="col-2 borderframe">${result31}</div>

      <div class="col-2 borderframe">หมายเหตุ</div>
      <div class="col-10 borderframe">${note}</div>

      <div class="col-12 textbig borderframe">
        <h2>${moneystatus}</h2>
      </div>

      <div class="col-sm-5 textbig1 borderframe">
        <h1>XTL</h1>
      </div>
      <div class="col-sm-7 borderframe">
        <div class="row h-100 w-100">
          <div class="col-4 py-2 borderframe">
            <h3 style="font-size: 3rem;">Total</h3>
          </div>
          <div class="col-8 py-2 borderframe">
            <h1 style="font-size: 4rem;">${branch}</h1>
          </div>
          <div class="col-4 py-2 borderframe">
            <h3 style="font-size: 2rem;">${weightall} Kg</h3>
          </div>
          <div class="col-8 py-2 borderframe">
            <h1 style="font-size: 4rem;">${memberID}</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
  `

  printHTMLContent(htmlToPrint)
  $("#tester").show()
}

function printHTMLContent(htmlContent) {
  let newWindow = window.open('', '_blank');

  newWindow.document.write('<!DOCTYPE html>');
  newWindow.document.write('<html lang="en">');
  newWindow.document.write('<head>');
  newWindow.document.write('<meta charset="UTF-8">');
  newWindow.document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  newWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet"integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">');
  newWindow.document.write('<link href="style.css" rel="stylesheet" type="text/css" />');
  newWindow.document.write('</head>');
  newWindow.document.write('<body>');
  newWindow.document.write(htmlContent);
  newWindow.document.write('<script>');
  newWindow.document.write('window.onload = function() { window.print(); };');
  newWindow.document.write('window.onafterprint = function() { window.close(); };');
  newWindow.document.write('</script>');
  newWindow.document.write('</body>');
  newWindow.document.write('</html>');
  newWindow.document.close();
}

function submit() {
  $.LoadingOverlay('show')
  let selectedValues = [];
  $("input[name='checkbox']:checked").each(function() {
    let labelText = $("label[for='" + $(this).attr("id") + "']").text();
    selectedValues.push(labelText);
  });
  let cleanedValues = selectedValues.map(value => value.trim());
  let branch = $('input[name="radio"]:checked').val();
  let money = $('input[name="radio2"]:checked').val();
  let datasave = {
    opt: 'datainfo',
    datacheck: $("#uiddata").val(),
    data0: $("#tel").val(),
    data1: $("#username").val(),
    data2: $("#pass1").val(),
    data3: $("#parcelNo").val(),
    data4: $("#parcelType").val(),
    data5: $("#weight1").val(),
    data6: $("#weight2").val(),
    data7: $("#weight3").val(),
    data8: $("#weight4").val(),
    data9: $("#weight5").val(),
    data10: $("#weight6").val(),
    data11: $("#weight7").val(),
    data12: $("#weight8").val(),
    data13: $("#allweight").val(),
    data14: $("#moneyallweight").val(),
    data15: cleanedValues.join(","),
    data16: $("#expenses").val(),
    data17: $("#TotalHKD").val(),
    data18: branch,
    data19: $("#deliveryround").val(),
    data20: $("#note").val(),
    data21: money,
    data22: $("#Cash").val(),
    data23: $("#Transfer").val(),
    data24: $("#note2").val(),
    data25: $("#deliveryStatusSelect").val(),
    data26: $("#productreceivedday").val()
  }



  $.ajax({
    method: "POST",
    url: scripturl,
    data: datasave,
    dataType: 'json',
    success: function(res) {
      $.LoadingOverlay('hide')
      if (res.status == 'success') {
        return Swal.fire({
          icon: 'success',
          title: 'บันทึกข้อมูลเรียบร้อย',
          allowOutsideClick: false,
          confirmButtonText: 'ตกลง',
        })
        //   .then(() => {
        //   location.reload()
        // })
      }
    },
    error: function(err) {
      console.log(err)
      $.LoadingOverlay('hide')
      return Swal.fire({
        icon: 'error',
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        allowOutsideClick: false,
        confirmButtonText: 'ตกลง',
      })
    }
  })
}

function deleterow(uid) {
  $.LoadingOverlay('show')
  let deleteinfo = {
    opt: 'deleterow',
    infodel: uid
  }

  $.ajax({
    method: "POST",
    url: scripturl,
    data: deleteinfo,
    dataType: 'json',
    success: function(res) {
      $.LoadingOverlay('hide')
      if (res.status == 'success') {
        return Swal.fire({
          icon: 'success',
          title: 'ลบข้อมูลเรียบร้อย',
          allowOutsideClick: false,
          confirmButtonText: 'ตกลง',
        }).then(() => {
          location.reload()
        })
      }
    },
    error: function(err) {
      console.log(err)
      $.LoadingOverlay('hide')
      return Swal.fire({
        icon: 'error',
        title: 'ลบข้อมูลไม่สำเร็จ',
        allowOutsideClick: false,
        confirmButtonText: 'ตกลง',
      })
    }
  })
}


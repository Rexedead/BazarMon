'use strict'
let wlData = [];
let table = document.getElementById("poptbody");

chrome.storage.local.get(['wlData'], function (data) {
  if (data.wlData == null) {
    console.log("You have no list of games")
    document.getElementsByTagName('body')[0].innerHTML = "For monitoring, first, add games in the options";
    document.getElementsByTagName('html')[0].style.width = "150px";
    document.getElementsByTagName('html')[0].style.height = "30px";
  } else {
    // console.log(data.wlData);
    wlData = JSON.parse(data.wlData);
    if (wlData.length == 0) {
      document.getElementsByTagName('body')[0].innerHTML = "For monitoring, first, add games in the options";
      document.getElementsByTagName('html')[0].style.width = "150px";
      document.getElementsByTagName('html')[0].style.height = "30px";
    } else {
      display(wlData);
    }
  }
});

function display(tData) {
  tData.forEach(element => {
    let row = table.insertRow(0);

    let cellTitle = row.insertCell(0);
    let cellPriceNow = row.insertCell(1);
    let cellPriceMin = row.insertCell(2);
    let cellMinDate = row.insertCell(3);
    let cellAlert = row.insertCell(4);

    // cellPriceNow.setAttribute("sorttable_customkey","01.00")
    // cellPriceMin.setAttribute("sorttable_customkey",parseInt(element.GameData.MinFixedPrice))

    cellTitle.outerHTML = "<th><a href=" + element.GameData.Link + " target='_blank'>" + element.GameData.Title + "</a></th>";
    cellPriceNow.innerHTML = element.GameData.CurrentPrice;
    cellPriceMin.innerHTML = element.GameData.MinFixedPrice;
    cellMinDate.innerHTML = element.GameData.MinFixedPriceDate + " " + "<sup>" + element.GameData.MinFixedPriceTime + "</sup>";
    cellAlert.innerHTML = element.GameData.MinPriceUserAlert;
    if (parseFloat(element.GameData.CurrentPrice) <= parseFloat(element.GameData.MinPriceUserAlert)) {
      row.className = "is-selected"
    }
  });
  new Tablesort(document.getElementById('popTable'));
};

String.prototype.trunc = String.prototype.trunc ||
  function (n) {
    return (this.length > n) ? this.substr(0, n - 1) + '&hellip;' : this;
  };
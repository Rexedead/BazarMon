'use strict'
//+ manually on page

const ROOT = 'https://bazar.lowcygier.pl/offer/game/';
const wlPage = 'https://bazar.lowcygier.pl/?options=&options%5B%5D=onlyWishlist&type=&platform=&payment=&game_type=&game_genre=&title=&game_id=&sort=-created_at&per-page=100'
let inputDiv = document.getElementById('input-segments')
let url;
let wlData; //[array]
let lastid;
// Saves users prefrences
function storeOption(optionName, optionValue) {
  let data = {};
  data[optionName] = optionValue;
  chrome.storage.local.set(data);
};

//GET DATA FROM CHROME
chrome.storage.local.get(['wlData'], function (data) {
  if (data.wlData == null) {
    console.log("You have no list of games")
  } else {
    // console.log(data.wlData);
    var restoreArr = JSON.parse(data.wlData);
    wlData = restoreArr;
    for (let index = 0; index < restoreArr.length; index++) {
      createInputBlock()
      modifyDOM(wlData[index].GameID, wlData[index].GameData.MinPriceUserAlert, wlData[index].GameData.Title, wlData[index].GameData.CurrentPrice, wlData[index].GameData.Link)
      listenerForInput()
    }
  }
});

chrome.storage.local.get(['autoBumpOption'], function (data) {
  document.getElementById('autoBump').checked = data.autoBumpOption;
});


//LISTENERS
document.getElementById("addInput").onclick = function () {
  var lastID = document.getElementsByClassName("divGameIdInput");
  //(lastID[lastID.length - 1].value != "")
  if ((lastID.length == 0) || (lastID[0].value != "")) {
    createInputBlock();
  }
};

document.getElementById("save").onclick = function () {
  console.log('save');
};

document.getElementById("setAlert").onclick = function () {
  var alSelector = document.querySelectorAll(".divAlertInput");
  var alValue = document.getElementById("alertValueOption").value;

  alSelector.forEach(el => {
    if (alValue != "")
      el.value = alValue;
  });

  wlData.forEach(el => {
    el.GameData.MinPriceUserAlert = alValue;
  });
  storeOption('wlData', JSON.stringify(wlData));
};

document.getElementById("clear").onclick = function () {
  console.log('remove all');
  wlData = new Array();
  storeOption('wlData', JSON.stringify(wlData));
  location.reload();
};

document.getElementById('autoBump').onclick = function () {
  var autoBumpCheckbox = document.getElementById('autoBump').checked;
  storeOption('autoBumpOption', autoBumpCheckbox);
};

document.getElementById("getMyWList").onclick = function () {

  fetch(wlPage, {
      credentials: 'include'
    })
    .then((response) => {
      if (response.ok) {
        return response.text()
      }
      throw response
    })
    .then(text => {
      getMyWListParse(text)
    })
    .catch(function (error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
    });

};

//HTML FUNCTIONS
function createInputBlock() {
  var divInputSegment = document.createElement("div");
  divInputSegment.className = 'input-segment-item columns is-centered';

  var divInputID = document.createElement("input");
  var divInputAlert = document.createElement("input");
  var dl = document.getElementsByClassName('divGameIdInput')
  divInputID.id = "divGameIdInput" + dl.length;
  divInputID.className = "divGameIdInput input is-small";
  divInputID.placeholder = "Game ID";
  divInputID.type = "number";

  divInputAlert.className = "divAlertInput input is-small";
  divInputAlert.id = "divAlertInput" + dl.length;
  divInputAlert.placeholder = "Alert";
  divInputAlert.type = "number";
  divInputAlert.value = "0.50";

  var delButton = document.createElement("button");
  delButton.className = 'closeButton button is-small is-danger is-outlined';
  delButton.innerHTML = 'Remove';

  var divInputColumn = document.createElement("div");
  divInputColumn.className = "column has-text-left";
  var divTitleColumn = document.createElement("div");
  divTitleColumn.className = "column has-text-left game-title-column";
  divTitleColumn.id = "game-title-column" + dl.length;
  var divPriceColumn = document.createElement("div");
  divPriceColumn.className = "column has-text-left game-price-column";
  divPriceColumn.id = "game-price-column" + dl.length;

  divInputSegment.appendChild(divInputColumn);
  divInputColumn.appendChild(divInputID);
  divInputColumn.appendChild(divInputAlert);
  divInputColumn.appendChild(delButton);

  divInputSegment.appendChild(divTitleColumn);
  divInputSegment.appendChild(divPriceColumn);

  document.getElementById("input-segments").insertBefore(divInputSegment,
    document.querySelector("#input-segments > div:nth-child(1)"));

  delButton.onclick = function () {
    var dl = document.getElementsByClassName('divGameIdInput')
    for (let index = 0; index < dl.length; index++) {
      try {
        if (divInputSegment.childNodes[0].firstChild.value == wlData[index].GameID) {
          wlData.splice(index, 1);
          divInputSegment.remove();
        } else if (divInputSegment.childNodes[0].firstChild.value == "") {
          divInputSegment.remove();
        }
      } catch (error) {
        console.log(error);

      }

    }


    storeOption('wlData', JSON.stringify(wlData));

  };
  listenerForInput()

};

function listenerForInput() {
  var dg = document.getElementsByClassName('divGameIdInput')
  var da = document.getElementsByClassName('divAlertInput')
  var endId = dg.length - 1;
  var gid = document.getElementById('divGameIdInput' + endId)
  var aid = document.getElementById('divAlertInput' + endId)

  gid.onchange = function () {
    ProcessUrls(gid.value, aid.value);
  }
  aid.onchange = function () {
    wlData.forEach(element => {
      if (element.GameID == gid.value) {
        element.GameData.MinPriceUserAlert = aid.value;
      }
    });
    storeOption('wlData', JSON.stringify(wlData));
  }
};

//HTTP REQUEST
function ProcessUrls(game_id, game_id_alert) {
  url = ROOT + game_id;
  console.log(url);
  fetch(url, {
      credentials: 'include'
    })
    .then((response) => {
      if (response.ok) {
        return response.text()
      }
      throw response
    })
    .then(text => {
      manuallyInputParse(text, game_id, game_id_alert)
    })
    .catch(function (error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
    });
};

function manuallyInputParse(text, game_id, game_id_alert) {
  var tempArrayForStore = [];
  var res = document.createElement("div");
  res.innerHTML = text;
  var cbTitle = res.querySelector("h2.test").innerHTML.trim();
  var cbCurrentPrice = res.querySelector(".price").innerHTML.replace(/\,/g, '.').replace(/[^\d+\.\d.]/g, '');
  var bazarResponse = {
    GameID: game_id,
    GameData: {
      Title: cbTitle,
      CurrentPrice: cbCurrentPrice,
      MinFixedPrice: null,
      MinFixedPriceDate: null,
      MinFixedPriceTime: null,
      MinPriceUserAlert: game_id_alert,
      Link: url
    }
  };
  if ((bazarResponse.GameData.CurrentPrice < bazarResponse.GameData.MinFixedPrice) || bazarResponse.GameData.MinFixedPrice == null) {
    bazarResponse.GameData.MinFixedPrice = bazarResponse.GameData.CurrentPrice;
    bazarResponse.GameData.MinFixedPriceDate = currentDate();
    bazarResponse.GameData.MinFixedPriceTime = currentTime();
  }
  if (wlData != null) {
    tempArrayForStore = wlData;
  }
  tempArrayForStore.push(bazarResponse);
  console.log(bazarResponse);
  tempArrayForStore = multiDimensionalUnique(tempArrayForStore, 'GameID')
  storeOption('wlData', JSON.stringify(tempArrayForStore));
  modifyDOM(game_id, game_id_alert, cbTitle, cbCurrentPrice, url)
};

function getMyWListParse(text) {
  var tempArrayForStore = [];
  var res = document.createElement("div");
  res.innerHTML = text;
  var cbTitleSelector = res.querySelectorAll("h4.media-heading>a");
  var cbPriceSelector = res.querySelectorAll(".mobile>p.prc");
  for (let index = 0; index < cbTitleSelector.length; index++) {
    var bazarResponse = {
      GameID: cbTitleSelector[index].href.substr(cbTitleSelector[index].href.lastIndexOf('/') + 1),
      GameData: {
        Title: cbTitleSelector[index].text,
        CurrentPrice: cbPriceSelector[index].innerHTML.replace(/\,/g, '.').replace(/[^\d+\.\d.]/g, ''),
        MinFixedPrice: null,
        MinFixedPriceDate: null,
        MinFixedPriceTime: null,
        MinPriceUserAlert: "0.50",
        Link: "https://bazar.lowcygier.pl" + cbTitleSelector[index].pathname
      }
    }
    if ((bazarResponse.GameData.CurrentPrice < bazarResponse.GameData.MinFixedPrice) || bazarResponse.GameData.MinFixedPrice == null) {
      bazarResponse.GameData.MinFixedPrice = bazarResponse.GameData.CurrentPrice;
      bazarResponse.GameData.MinFixedPriceDate = currentDate();
      bazarResponse.GameData.MinFixedPriceTime = currentTime();
    }
    if (wlData != null) {
      tempArrayForStore = wlData;
    }
    tempArrayForStore.push(bazarResponse);
    createInputBlock();
    modifyDOM(bazarResponse.GameID, bazarResponse.GameData.MinPriceUserAlert, bazarResponse.GameData.Title, bazarResponse.GameData.CurrentPrice, bazarResponse.GameData.Link)
  }
  tempArrayForStore = multiDimensionalUnique(tempArrayForStore, 'GameID')
  storeOption('wlData', JSON.stringify(tempArrayForStore));
};


function modifyDOM(id, alert, title, price, url) {
  //please help me to fix this shit and pull to github

  lastid = document.querySelectorAll(".input-segment-item").length - 1;

  let parsedGameIdDiv = document.querySelector("#divGameIdInput" + lastid)
  let parsedGameAlertDiv = document.querySelector("#divAlertInput" + lastid)
  let parsedGameTitleDiv = document.querySelector("#game-title-column" + lastid)
  let parsedGamePriceDiv = document.querySelector("#game-price-column" + lastid)

  let prevParsedGameIdDiv = document.querySelector("#divGameIdInput" + (lastid - 1))
  let prevParsedGameTitleDiv = document.querySelector("#game-title-column" + (lastid - 1))
  let prevParsedGameAlertDiv = document.querySelector("#divAlertInput" + (lastid - 1))
  let prevParsedGamePriceDiv = document.querySelector("#game-price-column" + (lastid - 1))

  if (prevParsedGameTitleDiv != null && prevParsedGameTitleDiv.innerText.length == 0) {
    prevParsedGameTitleDiv.innerHTML = "<a href='" + url + "'>" + title + "</a>";
    prevParsedGamePriceDiv.innerHTML = price;
    prevParsedGameAlertDiv.innerHTML = alert;
    prevParsedGameIdDiv.disabled = true;
  } else {
    parsedGameIdDiv.value = id;
    parsedGameAlertDiv.value = alert;
    parsedGameTitleDiv.innerHTML = "<a href='" + url + "'>" + title + "</a>";
    parsedGamePriceDiv.innerHTML = price;
    parsedGameIdDiv.disabled = true;
  }
};



// function modifyDOM(id, alert, title, price, url) {
//   var parsedGameIdDiv = document.querySelector("#input-segments > div:first-child > div.column> input.divGameIdInput")
//   var parsedGameAlertDiv = document.querySelector("#input-segments > div:first-child > div.column> input.divAlertInput")
//   var parsedGameTitleDiv = document.querySelector("#input-segments > div:first-child > div.game-title-column")
//   var parsedGamePriceDiv = document.querySelector("#input-segments > div:first-child > div.game-price-column")
//   parsedGameIdDiv.value = id;
//   parsedGameAlertDiv.value = alert;
//   parsedGameTitleDiv.innerHTML = "<a href='" + url + "'>" + title + "</a>";
//   parsedGamePriceDiv.innerHTML = price;
//   parsedGameIdDiv.disabled = true;
// };


// function modifyDOMmanually(id, alert, title, price, url) {
// var activeTitleDiv = document.activeElement.parentNode.parentNode.getElementsByClassName("game-title-column");
// var activePriceDiv = document.activeElement.parentNode.parentNode.getElementsByClassName("game-price-column");
// var activeInputIdDiv = document.activeElement.parentNode.getElementsByClassName("divGameIdInput");
// var activeInputAlertDiv = document.activeElement.parentNode.getElementsByClassName("divAlertInput");
// activeInputIdDiv[0].disabled = true;
// };


function multiDimensionalUnique(arr, prop) {
  var newArray = [];
  var lookupObject = {};

  for (var i in arr) {
    lookupObject[arr[i][prop]] = arr[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
  // console.log("uniqueArray is: " + JSON.stringify(newArray));
  // wlData = newArray;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

function currentDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + '.' + mm + '.' + yyyy;
  return today;
};

function currentTime() {
  var time = new Date();
  var curTime = time.getHours() + ":" + String(time.getMinutes()).padStart(2, "0"); + ":" + time.getSeconds()
  return curTime;
};
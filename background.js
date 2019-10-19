'use strict'

var wlData = [];

function storeOption(optionName, optionValue) {
    let data = {};
    data[optionName] = optionValue;
    chrome.storage.local.set(data);
};

function getStorage(callback) {
    chrome.storage.local.get(['wlData'], function (data) {
        if (data.wlData == null) {
            console.log("You have no list of games")
        } else {
            wlData = JSON.parse(data.wlData);
            callback(wlData);
        }
    })
};

chrome.alarms.create({
    periodInMinutes: 13
});

chrome.alarms.onAlarm.addListener(function () {
    getStorage(executeBg)
});

function executeBg(wlData) {
    priceAlert(wlData)
    updateWishlistData(wlData)
}


function priceAlert(wlData) {
    //Reset style
    chrome.browserAction.setBadgeText({
        text: ''
    });
    chrome.browserAction.setBadgeBackgroundColor({
        color: [0, 0, 0, 0]
    })
    var counter = 0;
    if (wlData == null || wlData.length == 0) {
        console.log("You have no list of games")
    } else {

        wlData.forEach(el => {
            if (parseFloat(el.GameData.CurrentPrice) <= parseFloat(el.GameData.MinPriceUserAlert)) {
                chrome.browserAction.setBadgeText({
                    text: (counter = counter + 1).toString()
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [46, 125, 50, 255]
                })
            }
        })
    }
};


function updateWishlistData(wlData) {
    var interval = 5 * 1000; // 10 seconds;
    if (wlData == null || wlData.length == 0) {
        console.log("You have no list of games")
    } else {
        for (var i = 0; i <= wlData.length - 1; i++) {
            setTimeout(function (i) {
                fetch(wlData[i]["GameData"]["Link"], {
                        credentials: 'omit',
                    })
                    .then(res => res.text())
                    .then(text => {
                        updatePrice(text, wlData[i]);
                    })
                    .catch(err => console.log(err))

            }, interval * i, i);
        }
    }
};



function updatePrice(text, wlElement) {
    var res = document.createElement("div");
    res.innerHTML = text;
    var cbCurrentPrice = res.querySelector(".price").innerHTML.replace(/\,/g, '.').replace(/[^\d+\.\d.]/g, '');
    wlElement["GameData"]["CurrentPrice"] = cbCurrentPrice;
    if ((parseFloat(cbCurrentPrice) <= parseFloat(wlElement["GameData"]["MinFixedPrice"])) || wlElement["GameData"]["MinFixedPrice"] == null) {
        wlElement["GameData"]["MinFixedPrice"] = cbCurrentPrice;
        wlElement["GameData"]["MinFixedPriceDate"] = currentDate();
        wlElement["GameData"]["MinFixedPriceTime"] = currentTime();
    }
    storeOption('wlData', JSON.stringify(wlData));
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
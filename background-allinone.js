'use strict'
//todo listener for options
var wlData = [];
const myOffersPages = "https://bazar.lowcygier.pl/offer/my?status=active-offer&per-page=50&page="

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
    periodInMinutes: 5
});

chrome.alarms.onAlarm.addListener(function () {
    getStorage(priceAlert)
    pageCounter() //counter -> loadMyOffers-> bump
});



function priceAlert(wlData) {
    //Reset style
    chrome.browserAction.setBadgeText({
        text: ''
    });
    chrome.browserAction.setBadgeBackgroundColor({
        color: [0, 0, 0, 0]
    })
    var counter = 0;
    if (wlData == null|| wlData.length==0) {
        console.log("You have no list of games")
    } else {
        
        wlData.forEach(el => {
                if (el.GameData.CurrentPrice <= el.GameData.MinPriceUserAlert) {
                    chrome.browserAction.setBadgeText({
                        text: (counter=counter+1).toString()
                    });
                    chrome.browserAction.setBadgeBackgroundColor({
                        color: [102, 187, 106, 230]
                    })
                }
            })
        }
};


function updateWishlistData() {
    var interval = 10 * 1000; // 10 seconds;
    for (var i = 0; i <= wlData.length - 1; i++) {
        setTimeout(function (i) {

            fetch(wlData[i]["GameData"]["Link"], {
                    credentials: 'omit',
                })
                .then(res => res.text())
                .then(bd => {
                    console.log(bd);
                })
                .catch(err => console.log(err))

        }, interval * i, i);
    }
};

function pageCounter() {
    fetch(myOffersPages + 1, {
            credentials: "include",
        }).then(res => res.text())
        .then(text => {
            loadMyOffers(parseCountLinks(text))
        })
        .catch(err => console.log(err))

};

function loadMyOffers(count) {
    var bumpSetOffers = new Set();
    var interval = 2000;

    for (var i = 1; i <= count; i++) {
        setTimeout(function (i) {
            fetch(myOffersPages + [i], {
                    credentials: "include", // include, *same-origin, omit
                })
                .then(res => res.text())
                .then(bd => {
                    var bumpArr = parseBumpLinks(bd);
                    for (let index = 0; index < bumpArr.length; index++) {
                        bumpSetOffers.add("https://bazar.lowcygier.pl" + bumpArr[index].pathname)
                    }
                    if (i == count) bump(bumpSetOffers)
                })
                .catch(err => console.log(err))

        }, interval * i, i);
    }

};

function bump(offers) {
    var interval = 10 * 1000;
    let arrayOfLinks = Array.from(offers);
    for (var i = 0; i <= arrayOfLinks.length - 1; i++) {
        setTimeout(function (i) {
            fetch(arrayOfLinks[i], {
                    credentials: "include",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                        "accept-language": "en,ru;q=0.9,ru-RU;q=0.8,la;q=0.7",
                        "cache-control": "max-age=0",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1"
                    },
                    referrer: "https://bazar.lowcygier.pl/offer/my?status=active-offer&per-page=50&page=1",
                    referrerPolicy: "no-referrer-when-downgrade",
                    body: "_csrf=YnB4TWFBeDITEz4CJBBVURAFFAsVCgkCBTsrIDV2LgZTIjsbFAMNeA%3D%3D&returnUrl=https%3A%2F%2Fbazar.lowcygier.pl%2Foffer%2Fmy%3Fstatus%3Dactive-offer%26per-page%3D50%26page%3D1",
                    method: "POST",
                    mode: "cors"
                })
                .catch(err => console.log(err))
        }, interval * i, i);
    }
};


function parseBumpLinks(bd) {
    var res = document.createElement("div");
    res.innerHTML = bd;
    var bumpSelector = res.querySelectorAll('a.btn.editBtn.btn-success');
    return bumpSelector;
};

function parseCountLinks(bd) {
    var res = document.createElement("div");
    res.innerHTML = bd;
    var container = res.querySelector('ul.pager-wrapper');
    return container.childElementCount - 2;
};
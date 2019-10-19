'use strict'
//todo listener for options
const myOffersPages = "https://bazar.lowcygier.pl/offer/my?status=active-offer&per-page=50&page="
let csrfKey;

chrome.alarms.onAlarm.addListener(function () {
    chrome.storage.local.get(['autoBumpOption'], function (data) {
        if (data.autoBumpOption) {
            pageCounter(); //counter -> loadMyOffers-> bump
        }
    });

});


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
    let bumpSetOffers = new Set();
    let interval = 2000;

    for (var i = 1; i <= count; i++) {
        setTimeout(function (i) {
            fetch(myOffersPages + [i], {
                    credentials: "include",
                })
                .then(res => res.text())
                .then(bd => {
                    var bumpArr = parseBumpLinks(bd);
                    var endId = bumpArr[0].pathname.substr(bumpArr[0].pathname.lastIndexOf('/') + 1);
                    for (let index = 0; index < bumpArr.length; index++) {
                        if (index == 0) getcsfr("https://bazar.lowcygier.pl/offer/update/" + endId)
                        bumpSetOffers.add("https://bazar.lowcygier.pl" + bumpArr[index].pathname)
                    }

                    if (i == count) bump(bumpSetOffers)
                })
                .catch(err => console.log(err))

        }, interval * i, i);
    }
};

function getcsfr(url) {
    fetch(url, {
            credentials: "include",
            method: "GET",
        })
        .then(res => res.text())
        .then(key => {
            parseKey(key)
        })
        .catch(err => console.log(err));

}


function bump(offers) {
    let interval = 10 * 1000;
    let arrayOfLinks = Array.from(offers);
    for (let i = 0; i <= arrayOfLinks.length - 1; i++) {
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
                    body: "_csrf=" + csrfKey,
                    method: "POST",
                    mode: "cors"
                })
                .catch(err => console.log(err))
        }, interval * i, i);
    }
};


function parseBumpLinks(bd) {
    let res = document.createElement("div");
    res.innerHTML = bd;
    let bumpSelector = res.querySelectorAll('a.btn.editBtn.btn-success');
    return bumpSelector;
};

function parseKey(bd) {
    let res = document.createElement("div");
    res.innerHTML = bd;
    csrfKey = res.querySelector("#w0 > input[type=hidden]").value
    return csrfKey;
};

function parseCountLinks(bd) {
    let res = document.createElement("div");
    res.innerHTML = bd;
    let container = res.querySelector('ul.pager-wrapper');
    return container.childElementCount - 2;
};
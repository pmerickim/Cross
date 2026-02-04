//jQuery ready block initializes compare object with current ASIN id of product
//Manifest v3

// masterDesiredCurrency nessesary so that every function can access this global variable. 
// This is nessesary the instantization of settings varible. Specifically for var desiredCurrency.
var masterDesiredCurrency;
chrome.storage.local.get('desiredCurrency', function(result) {
masterDesiredCurrency = result.desiredCurrency;
                        
});
var counter = 0;
$(function () {
    var asin = $('#ASIN').val();
    if (asin == undefined)
        return;
    compare.initialize(asin);

    // $("#variation_style_name .a-button-text, .swatchSelect .a-button-text").on("click", function(e) {
    //     console.log("clicked style button");    
    //     setTimeout(function(e) {
    //         location.reload();    
    //     }, 2000);
        
    // });
});

setInterval(function() {
    if(Array.from(document.querySelectorAll(".entry.compare-price")).every(function(item) {
        return (item.classList.contains("compare-warning"));
    })) {
        var scan = document.querySelector(".completed-price-scan");
        if(scan !== null && scan !== undefined) {
            scan.innerText = "Unavailable";
        }
    }
}, 1000);

function replaceUrlParam(url, paramName, paramValue)
{
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b('+paramName+'=).*?(&|#|$)');
    if (url.search(pattern)>=0) {
        return url.replace(pattern,'$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/,'');
    return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
}

function checkLocationChange() {
    var currentPage = location.href;
    setInterval(function() {
        if (currentPage != location.href) {
            //page changed, reload
            console.log('location changed, reload!');
            var loc = replaceUrlParam(window.location.href, 'tag', settings.currentShop.rawTag);
            loc = replaceUrlParam(loc, 'linkCode', 'ogi');
            window.location = loc;
            // location.reload();
            currentPage = location.href;
        }
    }, 50);
}

$("#variation_size_name button.a-button-text").on("click",function() {
        console.log('option size');
        checkLocationChange();
});

$("#variation_style_name button.a-button-text").on("click",function() {
        console.log('option style');
        checkLocationChange();
});

$("#variation_color_name img").on("click",function() {
        console.log('option color');
        checkLocationChange();
});

$("#native_dropdown_selected_size_name, #dropdown_selected_size_name").on("change",function() {
    console.log('size change');
    checkLocationChange();
})

//Parse query strings from the url and return a list with RegEx
var queryString = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
};

//Set the locaStorage value of the desired currency setting on the background script page
//this is necessary because if the user were to open a new tab, content script localSettings would be overwritten
async function setDesiredCurrency(currency) {
    //sendMessage to background script
   
        await chrome.storage.local.set({'desiredCurrency': currency}, function(){
         
        })
        masterDesiredCurrency = currency;


    
}

//Pull the currently set currency from the background page 
//this operation is done during initialization
async function pullDesiredCurrency() {
    

    //Promise nessesary so value can be aquired before moving on to the next lines of code
    var currency = new Promise(function(resolve, reject){
        chrome.storage.local.get("desiredCurrency", function(options){
            resolve(options.desiredCurrency);
        })
    });

    var desiredCurrency = await currency;
    
    

    chrome.storage.local.set({'desiredCurrency': desiredCurrency}, function() {
       
});
    
        Settings.desiredCurrency = desiredCurrency;
        Settings.desiredCulture = currencyCultureMap[desiredCurrency];
   
        //When the page is loaded and ready
        $(document).ready(() => {
            //Event listener to handle which used option is selected
            //fallback for timed out message response
            setTimeout(() => {

  
                //construct select dropdown for currency options
                Object.keys(currencies).forEach((item) => {
                    //set the currently desired currency as the default
                    if(currencies[item] === desiredCurrency) {
                        // console.log(currencies[item]);
                        $('#currency-select').prepend(`<li class="amz-option" value="${currencies[item]}"><span class="flag-icon flag-icon-${currencies[item].toLowerCase().slice(0, -1)}"></span> ${item}</li>`)
                    } else {

                        //all other currencies
                        $('#currency-select').append(`<li class="amz-option" value="${currencies[item]}"><span class="flag-icon flag-icon-${currencies[item].toLowerCase().slice(0, -1)}"></span> ${item}</li>`)
                    }
                });
                //if the desired currency changes, set that value in localStorage
                $('ul#currency-select').click(function() {
                    if($(this).hasClass("expanded")) {
                        $(this).removeClass("expanded").addClass("collapsed");
                        $(this).css({"background-image":"url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');"});
                    } else {
                        $(this).removeClass("collapsed").addClass("expanded");
                        $(this).css({"background-image":"none"});
                    }
                });

                $('.amz-select ul li.amz-option').click(function() {
                    //if index is zero this is an opening action 
                        var idx = $("li.amz-option").index(this);
                        if(idx === 0) {
                            return;
                        }
                        $(this).parent().css({"background-image":"url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');"});
                        let currency = $(this).attr("value");
                        $(this).parent().prepend(this);
                        setDesiredCurrency(currency);
                        desiredCurrency = currency;
                        this.desiredCurrency = currency;
                        this.desiredCulture = currencyCultureMap[currency];
                        location.reload();      
                });


            }, 200);

        });

   
}

//Various currencies' rates to EUR
window.Rates = {
    timestamp: new Date(),
    'EUR': 1,
    'AED': 0,
    'USD': 0,
    'JPY': 0,
    'BGN': 0,
    'CZK': 0,
    'DKK': 0,
    'GBP': 0,
    'HUF': 0,
    'LTL': 0,
    'LVL': 0,
    'PLN': 0,
    'RON': 0,
    'SEK': 0,
    'CHF': 0,
    'NOK': 0,
    'HRK': 0,
    'RUB': 0,
    'TRY': 0,
    'AUD': 0,
    'BRL': 0,
    'CAD': 0,
    'CNY': 0,
    'HKD': 0,
    'IDR': 0,
    'ILS': 0,
    'INR': 0,
    'KRW': 0,
    'MXN': 0,
    'MYR': 0,
    'NZD': 0,
    'PHP': 0,
    'SGD': 0,
    'THB': 0,
    'ZAR': 0
};
//all currency options
let currencies = {
    'U.S. Dollar': 'USD',
    'Euro': 'EUR',
    'Canadian Dollar': 'CAD',
    'Mexican Peso': 'MXN',
    'British Pound': 'GBP',
    'Australian Dollar': 'AUD',
    'Indian Rupee': 'INR',
    'South Korean Won': 'KRW',
    'Brazilian Real': 'BRL',
    'Japanese Yen': 'JPY',
    'Turkish Lira': 'TRY',
    'Chinese Yuan': 'CNY',
    'Singapore Dollar':'SGD',
    'UAE Dirham':'AED'
};
//map to connect currency to cultures
let currencyCultureMap = {
    'USD': 'en-US',
    'EUR': 'it',
    'CAD': 'en-CA',
    'MXN': 'es-MX',
    'GBP': 'en-GB',
    'AUD': 'en-AU',
    'INR': 'hi-IN',
    'KRW': 'ko-KR',
    'BRL': 'pt-BR',
    'JPY': 'ja-JP',
    'TRY': 'tr-TR',
    'CNY': 'ii-CN',
    'SGD': 'en-SG',
    'AED': 'ar-AE'
}
async function getCachedRates(){
chrome.runtime.sendMessage({ query: "loadCurrencies" }, function (response) {
        console.log('response.content: ', response.content);
        var ratesAPI = JSON.parse(response.content)["rates"];
        console.log('ratesAPI: ', ratesAPI);
        //add rates to global currency object
        for (var rate in Rates) {
            if (typeof rate !== 'string' || rate === 'EUR')
                continue;
            Rates[rate] = ratesAPI[rate];

        }
        console.log('Rates ', Rates);
        //set current date for timeout calculation
        Rates.timestamp = new Date();
        
        chrome.storage.local.set({'conversionRates': JSON.stringify(Rates)}, function() {
});
        return Rates;
});
}
//get currency conversion rates from API in background script
async function refreshRates() {
    //Promise nessesary so value can be aquired before moving on to the next lines of code
    //get the cached rates from localStorage if not longer than 7 hours
    var cachedRates = new Promise(function(resolve, reject){
        chrome.storage.local.get("conversionRates", function(result){
            resolve(result.conversionRates);
        })
    });

    cachedRates = await cachedRates;
    
    
    if (cachedRates == undefined || cachedRates == null){
        cachedRates = getCachedRates()
    }
    if (typeof(cachedRates) === "string"){
        cachedRates = JSON.parse(cachedRates);
    }
    
    //console.log("catchedRates: ", cachedRates, "catchedRates.timestamp: ", cachedRates.timestamp);
    
    if (cachedRates != undefined && cachedRates.timestamp != undefined) {
        cachedRates.timestamp = new Date(cachedRates.timestamp);
        Rates = cachedRates;
        var ageInHours = (new Date() - cachedRates.timestamp) / 1000 / 60 / 60;
        if (ageInHours < 7){
        console.log("Rates are less than 7 hours old, they are ", ageInHours, " hours old.");
        return;

    }console.log("Rates are less than 7 hours old, they are ", ageInHours, " hours old.");
        
    }
    
    //load currencies from API via background script
    console.log("Currency values outdated. Refreshing currencies");
    chrome.runtime.sendMessage({ query: "loadCurrencies" }, function (response) {
        var ratesAPI = JSON.parse(response.content)["rates"];
        //add rates to global currency object
        for (var rate in Rates) {
            if (typeof rate !== 'string' || rate === 'EUR')
                continue;
            Rates[rate] = ratesAPI[rate];

        }

        //set current date for timeout calculation
        Rates.timestamp = new Date();
        //commit to local storage
        chrome.storage.local.set({'conversionRates': JSON.stringify(Rates)}, function() {
});
        return refreshRates();
        
    });
}
//Money object to store locale settings
var Money = function (amount, currency, culture, extraAmount) {
    this.amount = amount;
    this.extraAmount = extraAmount;
    this.currency = currency;
    this.culture = culture;
};
//Override for function to allow currency conversion between cultures
Money.prototype["for"] = async function (currency, culture) {
    //calculate rate
    //Promise nessesary so value can be aquired before moving on to the next lines of code
    var currency = new Promise(function(resolve, reject){
        chrome.storage.local.get("desiredCurrency", function(options){
            resolve(options.desiredCurrency);
        })
    });

    currency = await currency;
    
    
    var rate = Rates[currency] / Rates[this.currency];
    //console.log("Currency: ", currency,", Rates[Currency]: ", Rates[currency], ", this.currency ", this.currency, ", Rates[this.Currency]: ", Rates[this.currency]);
    var convertedAmount = this.amount * rate;
    //console.log("ConvertedAmount: ", convertedAmount);
    //extraAmount not used
    var convertedExtraAmount = this.extraAmount !== undefined ? this.extraAmount * rate : undefined;
    return new Money(convertedAmount, currency, culture, convertedExtraAmount);
};
//toString override to format currency as text
Money.prototype.toString =  function () {
    if (this.extraAmount === undefined)
        return Globalize.format(this.amount, "c", this.culture);
    else
        return Globalize.format(this.amount, "c", this.culture) + ' - ' + Globalize.format(this.extraAmount, "c", this.culture);
};
//Global object to identify amazon page settings and info
var Shop = function (id, title, domain, base_url, currency, culture, rawTag, detailsTag, cartTag) {
    this.id = id;
    this.title = title;
    this.domain = domain;
    this.base_url = base_url;
    this.url = this.base_url;
    this.currency = currency;
    this.culture = culture;
    this.rawTag = rawTag;
    this.detailsTag = detailsTag;
    this.cartTag = cartTag;
    this.allOffersTag = detailsTag;
    this.setAsin = function (asin) {
        this.url = this.urlFor(asin);
        this.asin = asin;
    };
    this.urlFor = function (asin) {
        return this.base_url.replace('{asin}', asin);
    };
    this.moneyFrom = function (amount) {
        var culture = this.culture;
        /* 
        //don't allow price ranges
        if (amount.indexOf('-') == -1) {
            var sanitizedAmount = Globalize.parseFloat(amount.replace(/[^\d^,^.]/g, ''), culture);
            return new Money(sanitizedAmount, this.currency, culture);
        }
        //remove special decimal and money characters from number values
        
           
        var sanitizedAmounts = amount.split('-').map(function (a) {
            return Globalize.parseFloat(a.replace(/[^\d^,^.]/g, ''), culture);
        });
        */
    
        return new Money(amount, this.currency, culture);
    };
};
//helper function to cast money to number object
function dollarToNumber(dollarAmt) {
    return Number(dollarAmt.slice(1,dollarAmt.length));
}

function getBestPriceLink(bestPrice) {
    var priceList = document.querySelectorAll(".compare-price");
    for (let i = 0; i < priceList.length; i++) {
      if(priceList[i].textContent === bestPrice) {
          var bestLink = $(priceList[i]).siblings('a.compare-link').attr('href');
          //console.log(bestLink);
          return bestLink;
      }
    }
}

//global Settings object with culture map connecting store urls to locales
var Settings = function (asin) {
    this.asin = asin;
    //all shops to scrape from
    this.shops = [
        new Shop(1, 'amazon.com', 'www.amazon.com', 'https://www.amazon.com/dp/{asin}', 'USD', 'en-US','trycross-20', 'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=en_US','AssociateTag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(2, 'amazon.ca', 'www.amazon.ca', 'https://www.amazon.ca/dp/{asin}', 'CAD', 'en-CA','trycross-20', 'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=en_CA','AssociateTag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(3, 'amazon.com.mx', 'www.amazon.com.mx', 'https://www.amazon.com.mx/dp/{asin}', 'MXN', 'es-MX','mavfr7e9p-20', 'tag=mavfr7e9p-20&linkCode=ogi&th=1&psc=1&language=es_MX','AssociateTag=mavfr7e9p-20&tag=mavfr7e9p-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(4, 'amazon.co.uk', 'www.amazon.co.uk', 'https://www.amazon.co.uk/dp/{asin}', 'GBP', 'en-GB', 'trycross-20' ,'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=en_UK', 'AssociateTag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(5, 'amazon.com.au', 'www.amazon.com.au', 'https://www.amazon.com.au/dp/{asin}', 'AUD', 'en-AU', 'a8xc4tjqc-22', 'tag=a8xc4tjqc-22&linkCode=ogi&th=1&psc=1&language=en_AU', 'AssociateTag=a8xc4tjqc-22&tag=a8xc4tjqc-22&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(6, 'amazon.in', 'www.amazon.in', 'https://www.amazon.in/dp/{asin}', 'INR', 'hi-IN', 'igx1s5bq4-21', 'tag=igx1s5bq4-21&linkCode=ogi&th=1&psc=1&language=en_IN', 'AssociateTag=igx1s5bq4-21&tag=igx1s5bq4-21&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(7, 'amazon.de', 'www.amazon.de', 'https://www.amazon.de/dp/{asin}', 'EUR', 'de', 'trycross-20', 'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=de_DE', 'AssociateTag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(8, 'amazon.fr', 'www.amazon.fr', 'https://www.amazon.fr/dp/{asin}', 'EUR', 'fr', 'trycross-20', 'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=fr_FR', 'AssociateTag=tag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(9, 'amazon.es', 'www.amazon.es', 'https://www.amazon.es/dp/{asin}', 'EUR', 'es', 'trycross-20', 'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=es_ES', 'AssociateTag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(10, 'amazon.it', 'www.amazon.it', 'https://www.amazon.it/dp/{asin}', 'EUR', 'it', 'trycross-20' ,'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=it_IT', 'AssociateTag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(11, 'amazon.com.br', 'www.amazon.com.br', 'https://www.amazon.com.br/dp/{asin}', 'BRL', 'pt-BR', 'bq9i2tnxo-20', 'tag=bq9i2tnxo-20&linkCode=ogi&th=1&psc=1&language=pt_BR', 'AssociateTag=bq9i2tnxo-20&tag=bq9i2tnxo-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(12, 'amazon.co.jp', 'www.amazon.co.jp', 'https://www.amazon.co.jp/dp/{asin}', 'JPY', 'ja-JP', 'j8undpho1-22', 'tag=j8undpho1-22&linkCode=ogi&th=1&psc=1&language=jp_JP', 'AssociateTag=j8undpho1-22&tag=j8undpho1-22&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(13, 'amazon.com.tr', 'www.amazon.com.tr', 'https://www.amazon.com.tr/dp/{asin}?', 'TRY', 'tr-TR'),
        new Shop(14, 'amazon.cn', 'www.amazon.cn', 'https://www.amazon.cn/dp/{asin}', 'CNY', 'ii-CN', 'ckqa353hz0a-23', 'tag=ckqa353hz0a-23&linkCode=ogi&th=1&psc=1&language=zh_CN', 'AssociateTag=ckqa353hz0a-23&tag=ckqa353hz0a-23&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(15, 'amazon.sg', 'www.amazon.sg', 'https://www.amazon.sg/dp/{asin}', 'SGD', 'en-SG', 's5k340hg4-22', 'tag=s5k340hg4-22&linkCode=ogi&th=1&psc=1&language=en_SG', 'AssociateTag=s5k340hg4-22&tag=s5k340hg4-22&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(16, 'amazon.ae', 'www.amazon.ae', 'https://www.amazon.ae/dp/{asin}', 'AED', 'en-AE', 'a5zegen1n-21', 'tag=a5zegen1n-21&linkCode=ogi&th=1&psc=1&language=en_AE', 'AssociateTag=a5zegen1n-21&tag=a5zegen1n-21&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
        new Shop(17, 'amazon.nl', 'www.amazon.nl', 'https://www.amazon.nl/dp/{asin}', 'EUR', 'en-NL', 'trycross-20', 'tag=trycross-20&linkCode=ogi&th=1&psc=1&language=nl_NL', 'AssociateTag=trycross-20&tag=trycross-20&AWSAccessKeyId=AKIAI2TWEDSMJWGPXOQQ'),
    ];
    //set ASIN for each shop
    this.shops.forEach( function (shop) { shop.setAsin(asin); });
    //retrieve desired currency from content script
    
   var desiredCurrency =  masterDesiredCurrency;
    //default desired currency to USD if not previously set
    if(desiredCurrency == undefined) {
        //set desired currency to current locale if window.location.host is recognized
        this.shops.forEach( function (shop) {
           if(window.location.host === "www."+shop.title) {
            this.desiredCurrency = shop.currency;
            this.desiredCulture = shop.culture;
            // setTimeout(() => {
            //     document.getElementById('currency-select').value=shop.currency;
            // }, 1000);
            setDesiredCurrency(shop.currency);
            chrome.storage.local.set({'desiredCurrency': shop.currency}, function() {

});
            //location.reload();
           } 
        });
    } else {
        this.desiredCurrency = desiredCurrency;
        this.desiredCulture = currencyCultureMap[desiredCurrency];
    }
    //filter 
    this.currentShop = this.shops.filter(function (shop) { return shop.domain == document.domain; })[0];
    if (this.currentShop.currency != this.desiredCurrency) {
        this.filteredShops = this.shops;
    } else {
        this.filteredShops = this.shops.filter(function (shop) {
            return shop.domain != document.domain;
        });
    }
    //current locale shop info
    this.shop = function (id) {
        var shopById = this.shops.filter(function (shop) { return shop.id == id; });
        if (shopById.length == 1)
            return shopById[0];
        return null;
    };
    this.image = function (file) {
        return chrome.runtime.getURL('/images/' + file);
    };
    //get best price for current region
    this.calculateBestPrice = async function() {
        var priceArray = [];
        var len = this.shops.length;
        //current page region
        var host = window.location.host.replace("www.","");
        //slight delay to allow page elements to load
        setTimeout(() => {
            //iterate over each locate and compare prices
            $.each(this.shops, async function (index, shop) {
                var $shopInfo = $('#compare-shop-' + shop.id);
                //get price info from background script
                
                pageScraper.getPriceOn(shop, async function (price) { 
                    //display price in tooltip
                    page.displayPrice($shopInfo, shop.moneyFrom(price)); 
                    //price parsing for ranges, only compare lowest price
                    if(price.includes(' - ')) {
                        price = price.slice(0, price.indexOf(' - '));    
                    }
                    //two values to compare, minPrice is price on page, convertedPrice is price from foreach loop
                    var convertedPrice = await page.returnPrice($shopInfo, shop.moneyFrom(price));
                    var minPrice = $('#temp-compare')[0].innerText;
                    //if no minPrice, set absurdly high so that convertedPrice will be selected in the compare
                    if(minPrice === NaN || minPrice === "Calculating...") {
                        minPrice = "999999999999";
                    }
                    //parse into Number format for comparision
                    var compareCurrentPrice = Number(convertedPrice.slice(1,convertedPrice.length).replace(",","").replace("$","").replace(".","").replace("TL","").replace("ED","").replace("₩","").replace("¥",""));
                    var compareMinPrice = Number(minPrice.slice(1,minPrice.length).replace(",","").replace("$","").replace(".","").replace("TL","").replace("ED","").replace("₩","").replace("¥",""));
                    //get desired locale to format appropriate monetary sign
                    var desiredCurrency;
                    chrome.storage.local.get('desiredCurrency', function(result) {
                        desiredCurrency = result.desiredCurrency;
});

                    if(compareCurrentPrice < compareMinPrice) {
                        //display value in compare box as iterated over
                        $('#temp-compare')[0].innerText = convertedPrice;
                        //show best region if comparing current site
                        if(host === shop.title && compareCurrentPrice < compareMinPrice) {
                            $('#compare-region button')[0].innerText = "Best Region";
                            var quantity = $("#quantity")[0];
                            if(quantity === undefined) {
                                quantity = "&Quantity.1=1&"
                            } else {
                                quantity = "&Quantity.1="+quantity.value+"&";
                            }
                            console.log(quantity);
                            var link = "https://"+settings.currentShop.domain+"/gp/aws/cart/add.html?ASIN.1="+compare.asin+quantity+settings.currentShop.cartTag;
                            console.log(link);
                            $('#compare-region button')[0].dataset.pricelink = link;
                            // ?tag=trycross-20&linkCode=ogi&th=1&psc=1&language=en_US
                            var baseURL = settings.currentShop.base_url;
                            var tagIdx = baseURL.indexOf("?tag=");
                            // console.log(baseURL);
                            // console.log(tagIdx);
                            // console.log(baseURL.slice(tagIdx));
                        } else {
                            // getBestPriceLink(convertedPrice)
                            //format with dollar sign for these locals
                            if(desiredCurrency === 'USD' || 
                               desiredCurrency === 'CAD' || 
                               desiredCurrency === 'AUS' || 
                               desiredCurrency === 'MXD' || 
                               desiredCurrency === 'SGD'
                              ) {
                                //Clarify currency with region
                                $('#compare-region button')[0].innerHTML = convertedPrice+'<span class="smallCurrency">('+desiredCurrency+')</span>';
                                //put link in region button later, set data attribute now
                                $('#compare-region button')[0].dataset.pricelink = getBestPriceLink(convertedPrice);
                            } else {
                                //Show regular price
                                $('#compare-region button')[0].innerHTML = convertedPrice;
                                //put link in region button later, set data attribute now
                                $('#compare-region button')[0].dataset.pricelink = getBestPriceLink(convertedPrice);
                            }
                        }
                    }
                }, function (warning, addNotFoundClass) { 
                    page.displayWarning($shopInfo, warning, addNotFoundClass); 
                });
            });
            //interval to determine when all locales are loaded by checking for img element in tooltip
            var timerID = setInterval(() => {
                var finished = [...document.querySelectorAll(".compare-price")]
                if(finished.every((elem) => {
                    return $(elem).find("img").length == 0;
                })) {
                    clearInterval(timerID);
                    //add class to make button background green on completed crawl
                    $('#compare-region button').removeClass("pending-price-scan");
                    $('#compare-region button').addClass("completed-price-scan");
                    setTimeout(() => {
                        var bestPrice = $('#compare-region button').innerText;
                        // bestPrice = bestPrice.substring(0, bestPrice.indexOf('<span'));
                        // console.log(bestPrice);
                        $('.completed-price-scan').on('click',(e) => {
                            //best-region button will open the best region page in a new tab if available
                            // $(".best_save_link")
                            if($(e.target).data('pricelink') === undefined) {
                                e.target.parentNode.style['pointer-events'] = "auto";
                                console.log($(e.target).parent().data('pricelink'));
                                window.location.href = $(e.target).parent().data('pricelink');
                            } else {
                                e.target.style['pointer-events'] = "auto";
                                console.log($(e.target).data('pricelink'));
                                window.location.href = $(e.target).data('pricelink');
                            }
                        });
                        $("#compare-icon").on("click",function(e) {
                            e.preventDefault();
                            var quantity = $("#quantity")[0];
                            if(quantity === undefined) {
                                quantity = "&Quantity.1=1&"
                            } else {
                                quantity = "&Quantity.1="+quantity.value+"&";
                            }
                            console.log(quantity);

                            var link = "https://"+settings.currentShop.domain+"/gp/aws/cart/add.html?ASIN.1="+compare.asin+quantity+settings.currentShop.cartTag;
                            console.log(link);
                            window.location.href = link;
                            // console.log("https://"+settings.currentShop.domain+"/gp/aws/cart/add.html?ASIN.1="+compare.asin+"&Quantity.1="+(quantity === undefined) ? "1" : quantity.value +"&"+settings.currentShop.cartTag);
                        });
                        
                    }, 500);
                } 
            },0);
        }, 500);
    }
};

var pageScraper = {
    //object for scraping other pages
    warning: {
        networkError: 'Network error',
        unavailable: 'Unavailable',
        notFound: 'Not found',
        multipleOptions: 'Multiple options'
    },

    getPriceOn: async function (shop, displayPrice, displayWarning) {
        //strip &ref from URLs
        shop.url = shop.url.replace("&psc=1","");
        //pass metadata and reconstruct the url in background.js, as per Google's recommendation
        chrome.runtime.sendMessage({ query: "checkPrice", url: shop.url }, 
        
        function (response) {
            
            if (response.success) {
                //document.write(" ",response.success, ": ");
                //<span class="a-offscreen">$27.99</span>
                //var regex = /<span\sclass="a-offscreen">\$([0-9]+\.[0-9][0-9])<\/span/g;
                var regex = /"priceAmount":([0-9]+\.[0-9][0-9])/g;
                // var regex = /[nb]\s*?id="priceblock_[\w]*?price".*?>(.*?)</img;
                var cursorPrice = regex.exec(response.body);

                
                //document.write(" ",cursorPrice, ". ");
                //document.write("$",cursorPrice, ". ");
                var price = null;
                while (cursorPrice != null) {
                    price = cursorPrice;
                    cursorPrice = null;
                    
                }
                if (price != null) {
                    //document.write("$",price, ". ");
                    
                    
                    displayPrice(price[1]);
                    
                    var parser = new DOMParser();
                    var htmlDoc = parser.parseFromString(response.body, 'text/html');
                    var deliveryErr = htmlDoc.querySelectorAll('#dynamicDeliveryMessage .a-color-error');
                    
                    if(deliveryErr.length === 0) {
                        var $shopInfo = $('#compare-shop-' + shop.id);
                        
                        var compareContainer = $shopInfo.parent().find('.compare-link');
                        //add airplane icon iff no shipping errors
                        if(compareContainer.find('span').length === 0)
                             compareContainer.append("<span title=\"Ships to your location\" class=\"airIcon\"> ✈️ </span>");
                    }
                    return;
                }
                displayWarning(pageScraper.warning.unavailable, false);
               
            }
            else {
                //document.write(" ",response.success, ": ");
                
                if (response.status == 404)
                    displayWarning(pageScraper.warning.notFound, true);
                else
                    displayWarning(pageScraper.warning.networkError, false);
            }
        });
    }
};

var tooltip = {
    _mouseIsOnIcon: false,
    _mouseIsOnTooltip: false,
    registerShowHideHandlers: function () {
        this._genericRegisterShowHideHandlers($('.compare-tooltip'), function (on) { tooltip._mouseIsOnTooltip = on; });
        this._genericRegisterShowHideHandlers($('#compare-region'), function (on) { tooltip._mouseIsOnIcon = on; });
        this._genericRegisterShowHideHandlersPrice($('.price-tooltip'), function (on) { tooltip._mouseIsOnTooltip = on; });
        this._genericRegisterShowHideHandlersPrice($('#compare-icon'), function (on) { tooltip._mouseIsOnIcon = on; });
    },
    _genericRegisterShowHideHandlers: function ($selector, isOn) {
        $selector
        .mouseenter(function () {
            $('.compare-tooltip').show();
            $('.price-tooltip').hide();
            isOn(true);
        })
        .mouseleave(function () {
            isOn(false);
            setTimeout(function () {
                if (!tooltip._mouseIsOnIcon && !tooltip._mouseIsOnTooltip)
                    $('.compare-tooltip').hide();
                    $('.amz-select ul#currency-select').removeClass("expanded").addClass("collapsed");
            }, 100);
        });
    },
    _genericRegisterShowHideHandlersPrice: function ($selector, isOn) {
        $selector
            .mouseenter(function () {
            $('.price-tooltip').show();
            $('.compare-tooltip').hide();
            isOn(true);
        })
        .mouseleave(function () {
            isOn(false);
            setTimeout(function () {
                if (!tooltip._mouseIsOnIcon && !tooltip._mouseIsOnTooltip)
                    $('.price-tooltip').hide();
            }, 100);
        });
    },    
    findNewUsedPrice: function () {
        var $tries = [
            $('#olp-upd-new-used .a-color-price'),
            $('#olp-upd-new .a-color-price'),
            $('#olp-upd-used .a-color-price'),
            $('#olp-upd-new-freeshipping .a-color-price'),
            $('#olp-upd-new-used-freeshipping .a-color-price'),
            $('#olp-upd-new-used-freeshipping-threshold .a-color-price'),
            $('#olp-new .a-color-price')
        ];
        for (var i = 0; i < $tries.length; i++) {
            
            if ($tries[i].length > 0)
               
                return $tries[i];
        }
        return null;
        throw new Error('Unable to find the new used price section.');
    },
    findListedPrice: function () {
        var $tries = [
            $('span#priceblock_saleprice.a-color-price'),
            $('span#priceblock_ourprice.a-color-price'),
            $("#olp-upd-new-used-freeshipping span.a-color-price")
        ];
        for (var i = 0; i < $tries.length; i++) {
            
            if ($tries[i].length > 0)
                return $tries[i];
        }
        return null;
        throw new Error('Unable to find the listed price section.');
    }
};

function formatPriceToNumber(priceString) {
    if(priceString.includes("FREE")) {
        return false;
    }
    priceString = priceString.replace(",","").replace("&nbsp;"," ").replace("+","").replace("R$","").replace("S$","").replace("$","").replace("￥","").replace("£","").replace("TL","").replace('AED',"")
                             .replace("ED","").replace("CDN","").replace("EUR","").replace("€","")
                             .replace("&nbsp;"," ").replace('USD',"").replace('JPY',"").replace("₺","TRY")
                             .replace('GBP',"").replace('BGN',"").replace('CZK',"").replace('DKK',"")
                             // .replace('HUF',"").replace('LTL',"").replace('LVL',"").replace('PLN',"").replace('THB',"").replace('ZAR',"")
                             // .replace('RON',"").replace('SEK',"").replace('CHF',"").replace('NOK',"").replace('PHP',"")
                             .replace('HRK',"").replace('RUB',"").replace('TRY',"").replace('AUD',"")
                             .replace('BRL',"").replace('CAD',"").replace('CNY',"").replace('HKD',"")
                             .replace('IDR',"").replace('ILS',"").replace('INR',"").replace('KRW',"")
                             .replace('MXN',"").replace('MYR',"").replace('NZD',"")
                             .replace('SGD',"").trim()
    var ret = Number(priceString.slice(0,priceString.length));
    return (Math.round(ret * 100) / 100);
}

function formatPriceToNumberEuro(priceString) {
    if(isFree(priceString)) {
        return false;
    }
    priceString = priceString.replace(".","").replace(",",".").replace("&nbsp;"," ").replace("$","").replace("￥","").replace("£","").replace("TL","").replace('AED',"")
                             .replace("ED","").replace("CDN","").replace("EUR","").replace("€","")
                             .replace("&nbsp;"," ").replace('USD',"").replace('JPY',"").replace("₺","TRY")
                             .replace('GBP',"").replace('BGN',"").replace('CZK',"").replace('DKK',"")
                             // .replace('HUF',"").replace('LTL',"").replace('LVL',"").replace('PLN',"").replace('THB',"").replace('ZAR',"")
                             // .replace('RON',"").replace('SEK',"").replace('CHF',"").replace('NOK',"").replace('PHP',"")
                             .replace('HRK',"").replace('RUB',"").replace('TRY',"").replace('AUD',"")
                             .replace('BRL',"").replace('CAD',"").replace('CNY',"").replace('HKD',"")
                             .replace('IDR',"").replace('ILS',"").replace('INR',"").replace('KRW',"")
                             .replace('MXN',"").replace('MYR',"").replace('NZD',"")
                             .replace('SGD',"").trim();
    var ret = Number(priceString.slice(0,priceString.length));
    return (Math.round(ret * 100) / 100);
}

const decodeHtmlCharCodes = str => 
  str.replace(/(&#(\d+);)/g, (match, capture, charCode) => 
    String.fromCharCode(charCode));

function convertCurrency(x) {
    var culture = settings.currentShop.culture;
    var currency = settings.currentShop.currency;
    x = (Math.round(x * 100) / 100).toFixed(2);
    var formatter = new Intl.NumberFormat(culture, {
      style: 'currency',
      currency: currency,
    });

    return formatter.format(x); /* $2,500.00 */
    // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isFree(string) {
    string = string.toLowerCase();
    return (string.includes("gratuite") || //it
            string.includes("bedava") || //try
            string.includes("無料") || //jpy
            string.includes("gratis") || //es
            string.includes("kostenfreie") || //de
            string.includes("自由") || //cn simple
            string.includes("自由") || //cn trad.
            string.includes("livre") || //br
            string.includes("मुक्त") || //hi
            string.includes("مجانًا")) //ar
}

var page = {
    addTooltipToPage: function (tooltipMarkup) {
        var $placeholderMarkup = $('<img id="compare-placeholder" src="' + settings.image('placeholder.png') + '" alt="Placeholder" />');
        //document.write("Made it to function");
        var usedPrice = tooltip.findNewUsedPrice();


        var listPrice = tooltip.findListedPrice();
        //document.write(listPrice, " ", usedPrice);
        var label = "";

        if(usedPrice !== null && listPrice !== null) {
            //document.write("Prices not null");
            usedPrice = usedPrice.html();
            listPrice = listPrice.html();
            label = usedPrice;

            var link = tooltip.findNewUsedPrice()[0].previousElementSibling;
            if(link !== null) {
                link = link.href;
            } else {
                link = tooltip.findNewUsedPrice()[0].parentNode.href;
            }
            if(listPrice !== null) {
                tmpListPrice = formatPriceToNumber(listPrice);
                var cmpUsedPrice = formatPriceToNumber(usedPrice);
                if(tmpListPrice <= cmpUsedPrice) {
                    label = "Best Price";
                }  else {
                    // label = "New Only";
                }
            } else {
                label = "Best Price";
            }
        } else {
            //document.write("Prices null");
            label = "Best Price";
        }
        
        var signedin = document.querySelector("#nav-item-signout");
        if(signedin !== null) {
            // console.log('signed in');
            $(".price-tooltip .cmp_body").addClass("signedin");
            $(".tax_row").show();
        } else {
            // console.log('not signed in');
        }

        
        


        //compare best used price with current page's price
        var $imageMarkup = $('<div id="compare-container"> <div id="compare-icon"><button>'+label+'</button></div><div id="compare-region"><div id="temp-compare" class="hidden">Calculating...</div><button class="pending-price-scan">Calculating...</button></div></div></a>');
        var $container = this.findAppropriateTooltipContainer();
        $container.append($imageMarkup);
        $container.append(tooltipMarkup);
        tooltip.registerShowHideHandlers();

        //only support new items
        if(label === "Best Price") {
            $('#compare-icon').off("mouseenter");
        } else {
            chrome.runtime.sendMessage({ query: "checkUsedPrice", url: link+"&f_new=true" },
            function (response) {
               var currency = settings.currentShop.currency.replace("CAD","CDN$").replace("JPY","￥").replace("USD","$").replace("EUR","€").replace("TRY","₺").replace("GBP","£").replace("SGD","S$").replace("BRL","R$");
               
                var signedin = document.querySelector("#nav-item-signout");
                if(signedin !== null) {
                    console.log('signed in');
                    $(".price-tooltip .cmp_body").addClass("signedin");
                    $(".tax_row").show();
                } else {
                    console.log('not signed in');
                }

                if(listPrice.includes("€") || listPrice.includes("₺")) {
                    listPrice = formatPriceToNumberEuro(decodeHtmlCharCodes(listPrice));
                } else {
                    listPrice = formatPriceToNumber(decodeHtmlCharCodes(listPrice));
                }
                console.log(listPrice);
                //find matching entry index in other page
                var resIdx;    
                $(response.body).find(".olpOfferPrice").each(function(index, value) {
                    if(value.innerHTML.includes("EUR")) {
                        var cmpEU = formatPriceToNumberEuro(value.innerHTML);
                        if(cmpEU==listPrice) {
                           resIdx = index;
                        }
                    } else {
                        var cmp = formatPriceToNumber(value.innerHTML);
                        if(cmp==listPrice) {
                            resIdx = index;
                        }
                    }   
                });
                if(resIdx == undefined) {
                    resIdx = 0;
                }
                // console.log(resIdx);
                //condition of matching item
                var matchCondition = $(response.body).find(".olpCondition")[resIdx].innerText.trim();
                // console.log(matchCondition);
                //price of matching item
                var matchPrice = $(response.body).find(".olpOfferPrice")[resIdx].innerText.trim();
                if(matchPrice.includes("EUR")) {
                    matchPrice = formatPriceToNumberEuro(decodeHtmlCharCodes(matchPrice));
                } else {
                    matchPrice = formatPriceToNumber(decodeHtmlCharCodes(matchPrice));
                }
                //listPrice === matchPrice
                // console.log(matchPrice);
                
                //tax of matching item
                // setTimeout(() => {
                    var matchTax = $(response.body).find(".olpOffer");
                    matchTax = $(matchTax[resIdx]).find(".olpEstimatedTaxText");
                    if(matchTax.length > 0) {
                        // console.log(matchTax);
                        var matchTax = matchTax[0].innerText.trim().replace("+ ","").replace("estimated tax","").trim();
                        $(".amz_tax").html(matchTax);
                    } else {
                        var matchTax = "0";
                        $(".tax_row").hide();
                        $(".price-tooltip .cmp_body").removeClass("signedin");
                    }
                // }, 2100);
            
                //shipping of matched item
                var matchShippingCmp;
                var matchShipping = $(response.body).find(".olpOffer");
                if(matchShipping.length > 0) {                
                    matchShippingPrice = $(matchShipping[resIdx]).find(".olpShippingInfo .a-color-secondary"); // .olpShippingPrice");
                    //check for free here then look for price as number
                    // console.log(matchShippingPrice[0]);
                    if(isFree(matchShippingPrice[0].innerText)) {
                        matchShippingCmp = 0;
                    } else {
                        matchShippingPrice = $(matchShipping[resIdx]).find(".olpShippingInfo .a-color-secondary .olpShippingPrice");
                        if(matchShippingPrice.length > 0) {
                            matchShipping = matchShippingPrice[0].innerText;
                            if(matchShipping.includes("EUR")) {
                                matchShippingCmp = formatPriceToNumberEuro(matchShipping);
                            } else {
                                matchShippingCmp = formatPriceToNumber(matchShipping);
                            }
                        }
                        if(typeof matchShipping !== 'string') {
                            matchShippingInfo = $(matchShipping[resIdx]).find(".olpShippingInfo .a-color-secondary b");
                            if(matchShippingInfo.length > 0) {
                                //free shipping
                                matchShipping = matchShippingInfo[0].innerHTML;
                                matchShippingCmp = 0;
                            } else {
                                var matchPrime = $(matchShipping[resIdx]).find(".a-icon-prime");
                                if(matchPrime.length > 0) {
                                    matchShippingCmp = 0;
                                }    
                            }
                        }
                    }
                }
                
                if(matchShippingCmp != undefined) {
                    $(".amz_shipping").html(convertCurrency(matchShippingCmp));
                } else {
                    // $(".amz_shipping").html((Math.round(matchShipping * 100) / 100).toFixed(2));
                    $(".amz_shipping").html(convertCurrency(matchShipping));
                }
                
                $(response.body).find(".olpCondition").each(function(index, value) {
                    // console.log(value.innerHTML);
                    // if(formatPriceToNumberEuro(value.innerHTML)==listPrice) {
                    //    resIdx = index;
                    // }

                });

                //parse all used prices and first cheapest new price
                var bestShippingCmp;
                var bestShipping = $(response.body).find(".olpOffer");
                // var bestShipping = bestShipping[0].innerText.trim();
                if(bestShipping.length > 0) {                
                    bestShippingPrice = $(bestShipping[0]).find(".olpShippingInfo .a-color-secondary");// .olpShippingPrice");
                    // console.log(bestShippingPrice);
                    if(isFree(bestShippingPrice[0].innerText)) {
                        bestShippingCmp = 0;
                    } else {
                        bestShippingPrice = $(bestShipping[0]).find(".olpShippingInfo .a-color-secondary .olpShippingPrice");
                        if(bestShippingPrice.length > 0) {
                            bestShipping = bestShippingPrice[0].innerText;
                            if(bestShipping.includes("EUR")) {
                                bestShippingCmp = formatPriceToNumberEuro(bestShipping);
                            } else {
                                bestShippingCmp = formatPriceToNumber(bestShipping);
                            }
                        }
                        if(typeof bestShipping !== 'string' && bestShippingCmp === undefined) {
                            bestShippingInfo = $(bestShipping[0]).find(".olpShippingInfo .a-color-secondary b");
                            if(bestShippingInfo.length > 0) {
                                //free shipping
                                bestShipping = bestShippingInfo[0].innerHTML;
                                bestShippingCmp = 0;
                            } else {
                                var bestPrime = $(matchShipping[0]).find(".a-icon-prime");
                                if(bestPrime.length > 0) {
                                    bestShippingCmp = 0;
                                }
                            }
                        }
                    }
                }
                //  && bestShippingCmp !== 0 //to show free shipping in original language
                if(bestShippingCmp != undefined) {
                    $(".best_shipping").html(convertCurrency(bestShippingCmp));
                } else {
                    // $(".best_shipping").html((Math.round(bestShipping * 100) / 100).toFixed(2));
                    $(".best_shipping").html(convertCurrency(bestShipping));
                }



                // var bestTax = $(response.body).find(".olpOffer");
                // bestTax = $(bestTax[0]).find(".olpEstimatedTaxText");

                // if(bestTax.length > 0) {
                //     var bestTax = bestTax.innerText.trim();
                //     $(".best_tax").html(bestTax.replace("+ ","").replace("estimated tax",""));
                // } else {
                //     var bestTax = "";
                // }
                // setTimeout(() => {
                    var bestTax = $(response.body).find(".olpOffer");
                    bestTax = $(bestTax[0]).find(".olpEstimatedTaxText");
                    if(bestTax.length > 0) {
                        var bestTax = bestTax[0].innerText.trim().replace("+ ","").replace("estimated tax","").trim();
                        $(".best_tax").html(bestTax);
                    } else {
                        var bestTax = "0";
                        $(".tax_row").hide();
                        $(".price-tooltip .cmp_body").removeClass("signedin");
                    }
                // }, 2100);

                // var amzShipping = $("#price-shipping-message");
                // if(amzShipping.length > 0) {
                //     console.log(amzShipping[0].innerText.replace("& ","").replace("Details","").replace(".","").trim());
                //     // $(".amz_shipping").html(amzShipping[0].innerText.replace("& ","").replace("Details","").replace(".","").trim());
                // } else {
                //     console.log(amzShipping);
                // }


                var prime = $("#priceBadging_feature_div i").clone();
                // console.log(prime);
                if(prime.length > 0) {
                    $(".amz_shipping").html(prime[0]);
                }

                //set condition in tooltip
                var bestNewPrice = $(response.body).find(".olpOfferPrice")[0];
                bestNewPrice = bestNewPrice.innerText.trim();
                // console.log(bestNewPrice);
                
                // var isPrime = $(bestNewPrice).find(".a-icon-prime").length > 0;
                // if(isPrime) {
                //     $(".best_arrive").html("Includes PRIME Shipping");
                // }

                if(currency === "€" || currency === "₺") {
                    // listPrice = formatPriceToNumberEuro(decodeHtmlCharCodes(listPrice));
                    var bestNewPriceFormatted = formatPriceToNumberEuro(bestNewPrice);
                    bestNewPrice = bestNewPriceFormatted;
                    bestNewPriceFormatted = bestNewPriceFormatted+bestShippingCmp;
                    bestTaxCmp = formatPriceToNumberEuro(bestTax);
                    matchTaxCmp = formatPriceToNumberEuro(matchTax);
                } else {
                    var bestNewPriceFormatted = formatPriceToNumber(bestNewPrice);
                    bestNewPrice = bestNewPriceFormatted;
                    bestNewPriceFormatted = bestNewPriceFormatted+bestShippingCmp;
                    bestTaxCmp = formatPriceToNumber(bestTax);
                    matchTaxCmp = formatPriceToNumber(matchTax);
                }
                
                // console.log(settings.currentShop.currency);
                
                var amzTotal = listPrice+matchShippingCmp+matchTaxCmp;
                var bestTotal = (bestNewPriceFormatted+bestShippingCmp+bestTaxCmp);

                if (bestTotal >= amzTotal) {
                    $("#compare-icon button").html("Best Price");
                    $(".best_save").html("money");
                    $('#compare-icon').off("mouseenter");
                } else {
                    var difference = (amzTotal - bestTotal);
                    $(".best_save").html(convertCurrency(difference));
                    $("#compare-icon button").html(convertCurrency(bestNewPriceFormatted));
                }

                $(".amz_price").html(convertCurrency(listPrice));
                $(".amz_total").html(convertCurrency(amzTotal));
                $(".best_price").html(convertCurrency(bestNewPrice));
                $(".best_total").html(convertCurrency(bestTotal));
                
                $(".best_save_link").attr("href","https://"+settings.currentShop.domain+"/gp/offer-listing/"+compare.asin+"/ref=olp_f_new?f_new=true&"+settings.currentShop.allOffersTag);
            });
        }
    },
    findAppropriateTooltipContainer: function () {
        var $tries = [
            $('#price').parent(),
            $('table.product .priceLarge:first',
            $('#priceBlock')),
            $('#priceblock_dealprice'),
            $('#priceblock_saleprice'),
            $('#priceblock_pospromoprice'),
            $('#priceblock_ourprice'),
            $('#availability_feature_div > #availability > .a-color-price'),
            $('div.buying span.availGreen', $('#handleBuy')),
            $('div.buying span.availRed:nth-child(2)', $('#handleBuy')),
            $('#availability_feature_div')
        ];
        for (var i = 0; i < $tries.length; i++) {
            if ($tries[i].length > 0)
                return $tries[i];
        }

        throw new Error('Unable to find the price section.');
    },
    displayPrice: async function ($shopInfo, price) {
        //console.log("Price Object before conversion: ", price);
        var convertedPrice = await price["for"](settings.desiredCurrency, settings.desiredCulture);
        //console.log("Price Object after conversion: ", convertedPrice);
        //$shopInfo.text(price.amount.toString());
        $shopInfo.text(convertedPrice.toString());
        //console.log("convertedPrice.toString(): "+ convertedPrice.toString());
        return convertedPrice.toString();
       
    },
    returnPrice: async function ($shopInfo, price) {
        var convertedPrice = await price["for"](settings.desiredCurrency, settings.desiredCulture);
        //console.log("returnPrice : ",convertedPrice.toString());
        return convertedPrice.toString();
    },
    displayWarning: async function ($shopInfo, warning, addNotFoundClass) {
        $shopInfo
            .text(warning)
            .addClass('compare-warning');
        if (addNotFoundClass)
            $shopInfo.parent().addClass('compare-not-found');
    },
    addOptionalBackLink: function () {
        var from = queryString('compare-from');
        var asin = queryString('compare-from-asin');
        if (from == '' || asin == '')
            return;
        var shop = settings.shop(from);
        if (shop == null)
            return;
        $('form#handleBuy').prepend('<span class="back-link"> <img src="' + settings.image('return.png') + '" /> <a href="' + shop.urlFor(asin) + '"  >return to ' + shop.title + '</a> </span>');
    },
    registerInitializationHandler: function (shops) {
        $('#compare-region').mouseover(function () {
            if (window.compare_tooltipInitialized != undefined && window.compare_tooltipInitialized != false)
                //document.write("fail");
                return;
            //document.write("pass");
            window.compare_tooltipInitialized = true;
            $.each(shops, function (index, shop) {
                var $shopInfo = $('#compare-shop-' + shop.id);
                pageScraper.getPriceOn(shop, function (price) { 
                    page.displayPrice($shopInfo, shop.moneyFrom(price)); 
                }, function (warning, addNotFoundClass) { 
                    page.displayWarning($shopInfo, warning, addNotFoundClass); 
                });
            });
        });
    }
};

var settings;
var compare = {
    tooltip: null,
    asin: null,
    _startMonitoringAsin: function () {
        var observer = new MutationObserver(function (mutations) {
            var asinHasProbablyChanged = mutations.some(function (mutation) {
                return mutation.addedNodes.length > 0;
            });
            if (!asinHasProbablyChanged)
                return;
            var newAsin = $('#ASIN').val();
            if (compare.asin == newAsin)
                return;
            compare.run(newAsin);
        });
        //observe the parent of some content that will change whenever a twister option is changed, and that itself will remain unchanged (otherwise we lose the link)
        //and we don't want it to change too often, so the right add-to-basket column it is
        observer.observe($('#rightCol')[0], { attributes: true, subtree: true, childList: true, characterData: true });
    },
    initialize: async function (asin) {
        //console.log("Step 1");
        await pullDesiredCurrency();
        //console.log("Step 2");
        this.asin = asin;
        this._startMonitoringAsin();
        //console.log("Step 3");
        refreshRates();
        //console.log("Step 4");
        settings = new Settings(asin);
        //console.log("Step 5");
        settings.calculateBestPrice();
        //console.log("Step 6");
        page.addOptionalBackLink();
        //console.log("Step 7");
        $.get(chrome.runtime.getURL("tooltip.html"), function (tooltipTemplate) {
            compare.tooltip = Mustache.to_html(tooltipTemplate, {
                shops: settings.filteredShops,
                from_shop: settings.currentShop.id,
                from_asin: settings.asin,
                loader_url: chrome.runtime.getURL('/images/loader.gif')
            });
            //console.log("Step 8");
            compare.run(asin);

        }, 'html');
        
    },
    destroy: function() {
        $("#compare-container").remove();
        $(".compare-tooltip").remove();
    },
    run: function (asin) {
        this.asin = asin;
        console.log("Step 8");
        settings = new Settings(asin);
        console.log("Step 9");
        window.compare_tooltipInitialized = false;
        console.log("Step 10");
        var ensureTooltipHasBeenLoaded = function () {
            if (compare.tooltip == null) {
                //document.write("Not loaded");
                setTimeout(ensureTooltipHasBeenLoaded, 50);

            }
            else {
                 //document.write("loaded");
                var tooltipMarkup = compare.tooltip.replace(/{asin}/gm, settings.asin);
                page.addTooltipToPage(tooltipMarkup);
                page.registerInitializationHandler(settings.filteredShops);
            }
        };
        //console.log("Step 11");
        ensureTooltipHasBeenLoaded();

    
    }
};
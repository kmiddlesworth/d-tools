// turn off all console.log messages by uncommenting the next line
// console.log = function() {}

function sheetServe(keyStr) {

    var self = this;
    self.meta = {},
    self.sheets = {},
    self.meta.jsonQuery = '?alt=json&callback=?',
    self.meta.loaded = false,
    self.meta.sheetUrl = 'https://spreadsheets.google.com/feeds/worksheets/' + keyStr + '/public/basic' + self.meta.jsonQuery,
    self.meta.googlePrefix = 'gsx$',
    self.meta.googleCellKey = '$t',
    self.meta.key = keyStr,
    self.meta.addPatrials = false,
    self.meta.partialsStr = '-partial';

    //if (localStorage.getItem(self.key) === null) localStorage.setItem(self.key, 'blahblah');

}

// called in index, passing in url parameter 'gkey'
sheetServe.prototype.onload = function(callback) {

    function upOneLevel(climber) {
        console.log(climber);
    }

    var self = this;
    self.meta.config = self.sheets.config
    console.log(self);
    console.log(self.meta);
    console.log(self.sheets);

    console.log(document.getElementById("wrapper"));

    // reset the event handler on window, and call the callback in index
    $(window).off('sheetsLoaded.' + self.key).on('sheetsLoaded.' + self.key, function(e) {

        callback();

    });

    // check to see if connected to internet
    // if (!navigator.onLine) {
    // force no internet use
    if (true) {
        // if not, then use the data stored locally
        $.extend(self, JSON.parse(localStorage.getItem(self.key)));

        $(window).trigger('sheetsLoaded.' + self.key);
        return;
    }

    ajaxGetter(self.meta.sheetUrl, function(data) {
        self.meta.title = data.feed.title.$t;
        self.meta.timestamp = data.feed.updated.$t;

        //            if (localStorage.getItem(self.key + '-timestamp') === null) localStorage.setItem(self.key + '-timestamp', self.timestamp);
        //            else if (localStorage.getItem(self.key + '-timestamp') == self.timestamp) {
        //
        //                $.extend(self, JSON.parse(localStorage.getItem(self.key)));
        //
        //                $(window).trigger('sheetsLoaded.' + self.key);
        //
        //                return false;
        //
        //            }

        var tempArr = [];
        console.log(data.feed.entry.length);
        // iterate throught each google spreadsheet
        for (var x = 0; x < data.feed.entry.length; x++) {
            // add id, $t, json, and callback string to url
            // push each one into an empty array and replace worksheets with list and remove public/basic
            tempArr.push(data.feed.entry[x].id.$t.replace('/worksheets/', '/list/').replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery)
        }
        // call the function ajaxGetter and
        // pass in the array of arguments made just before
        console.log(tempArr);
        ajaxGetter(tempArr, function(d) {
                //self.sheets[d.feed.title.$t] = d.feed.entry;
                self.sheets[d.feed.title.$t] = self.cleanRowData(d.feed.entry, d.feed.title.$t);
            },
            function() {
                // now that all the data has been built,
                // integrate partials data into the main data
                if (self.addPartials) self = self.addPartials();

                //localStorage.setItem(self.key, JSON.stringify(self));
                //localStorage.setItem(self.key + '-timestamp', self.timestamp);
                $(window).trigger('sheetsLoaded.' + self.key);

            });
        console.log(tempArr);
    });

    function ajaxGetter(url, eachCallback, finalCallback) {

        var isArray = $.isArray(url);

        if (!isArray) url = [url];

        var totalCount = url.length,
            currentCount = 0;

        var ajaxArr = $.map(url, function(item, i) {

            var nonce = (url[i].indexOf('?') == -1) ? '?nonce=' : '&nonce=';

            return $.getJSON(url[i] + nonce + Date.now(), function(d) {

                eachCallback(d);

            });
        });

        $.when.apply(this, ajaxArr).then(function() {

            if (finalCallback) finalCallback();

        }).fail(function() {

            console.log('Unable to access Google Spreadsheet data - sheet: ' + i + '. Loading from local storage if available.');

            //                    if (localStorage.getItem(self.key) !== null) {
            //                        self = JSON.parse(localStorage.getItem(self.key));
            //                    }
        });
    }
    return;
}

sheetServe.prototype.addPartials = function(key, d) {
    // store this as self and make the array used
    // for storing names of the partial arrays
    var self = this,
        partialDeleteArr = [];

    function injectPartials(sheetKey) {
        // pass in tab name
        // loop through each tab
        for (var i = 0; i < self.sheets[sheetKey].length; i++) {
            // loop through each tab's col name
            for (var colName in self.sheets[sheetKey][i]) {
                // check if each object contains the predefined partial string
                if (colName.indexOf(self.meta.partialsStr) != -1) {
                    self.meta.addPatrials = true;
                    // if it does, grab the partialid value (aka the first col's cells) from the partial sheet,
                    var partialIdKey = self.sheets[sheetKey][i][colName];
                    // iterate through each row in the partial,
                    // until the name of the row matches the name of the partial id that was called
                    self.sheets[sheetKey][i][colName] = self.sheets[colName].filter(function(item, i) {
                        // item = column in the sheet
                        return partialIdKey == item.partialid;
                    });
                    if ($.inArray(colName, partialDeleteArr) == -1) partialDeleteArr.push(colName);
                }
            }
        }
    }
    // loop through each sheet tab
    for (var sheetKey in self.sheets) {
        // then pass the sheet name to the non partials injection method
        injectPartials(sheetKey);
    }

    // now that the partials have been place into their respective datasets, delete them from directly inside sheets
    for (var i = 0, total = partialDeleteArr.length; i < total; i++) {
        // remove the -partial tabs from the full sheeet
        delete self.sheets[partialDeleteArr[i]];
    }
    console.log(self);
    return self;
}

sheetServe.prototype.cleanRowData = function(d, sheetKey) {
    // d = google spreadsheet row

    var self = this,
        newArr = [],
        partialsArr = [];

    for (var i = 0, count = d.length; i < count; i++) {

        var newObj = {},
            arrConverts = {};


        // if "-partial" is in the sheet title skip it. partial data will be added by means of "addPartials" method below
        // if ()

        for (var key in d[i]) {

            var objKey = key.replace(this.meta.googlePrefix, ''),
                objValue = d[i][key][this.meta.googleCellKey];

            if (d[i].hasOwnProperty(key) && key.indexOf(this.meta.googlePrefix) != -1) {
                // check if this column is not part of an array
                if (objKey.indexOf('--') == -1) {
                    // if it is not, then
                    if (objValue != '') newObj[objKey] = objValue;
                } else {
                    // if it is...
                    console.log(objKey.indexOf('--'));
                    // grab the name of the array from the column name
                    var keyArr = objKey.split('--');
                    // grab the position of the value in the array
                    var keyArrPop = keyArr.pop();
                    // turn remaining array into a string and set to newKeyStr
                    var newKeyStr = keyArr.join();

                    // TODO : add console error if last value is not a number
                    // if (keyArrPop is an int) {
                    // 	console.log("please check your")
                    // };

                    if (objValue != '') {
                        if (arrConverts[newKeyStr]) arrConverts[newKeyStr].push(objValue);
                        else arrConverts[newKeyStr] = [objValue];
                    }
                }
                //console.log(objKey + " -> " + objValue);
            }
        }

        $.extend(newObj, arrConverts);

        newArr.push(newObj);

    }
    return newArr;
}


function getUrlParams() {

    var paramStr = window.location.search,
        // create final object
        keyValueObj = {};

    if (paramStr) {

        // remove initial "?" if present
        if (paramStr.substr(0, 1) == '?') paramStr = paramStr.substr(1);


        // convert to array by "&"
        var tempArr = paramStr.split('&'),
            tempArrLength = tempArr.length;
        for (var i = 0; i < tempArrLength; i++) {

            // convert url string to object key value pair
            var tempKeyValArr = tempArr[i].split('='),
                tempKey = tempKeyValArr[0],
                tempValue = (tempKeyValArr[1]) ? tempKeyValArr[1] : '';

            keyValueObj[tempKey] = tempValue;
        }
        return keyValueObj;
    }
}

function toFileWriter(obj, fileName, callback) {
    $.ajax({
        url: 'buildjson.php',
        type: 'post',
        data: {
            input: JSON.stringify(obj),
            key: obj.key
        },
        success: function(data) {
            obj.meta.loaded = true;
            if (callback) callback(data);
        },
        error: function(jqXHR, textStatus, error) {
            console.log(error);
        }
    });
}
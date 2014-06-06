
   function sheetServe(keyStr){

        var self                    = this;
        self.meta                   = {};
        self.sheets                 = {};
        self.meta.jsonQuery         = '?alt=json&callback=?';
        self.meta.loaded            = false;
        self.meta.sheetUrl          = 'https://spreadsheets.google.com/feeds/worksheets/' + keyStr + '/public/basic' + self.meta.jsonQuery;
        self.meta.googlePrefix      = 'gsx$';
        self.meta.googleCellKey     = '$t';
        self.key                    = keyStr;

        //if (localStorage.getItem(self.key) === null) localStorage.setItem(self.key, 'blahblah');

    }

    sheetServe.prototype.onload = function(callback){

        var self = this;

        $(window).off('sheetsLoaded.' + self.key).on('sheetsLoaded.' + self.key, function(e){
            callback();
        });


        if (!navigator.onLine) {

            $.extend(self, JSON.parse(localStorage.getItem(self.key)));

            $(window).trigger('sheetsLoaded.' + self.key);

            return; 

        }


        ajaxGetter(self.meta.sheetUrl, function(data){

            self.title = data.feed.title.$t;
            self.timestamp = data.feed.updated.$t;

            if (localStorage.getItem(self.key + '-timestamp') === null) localStorage.setItem(self.key + '-timestamp', self.timestamp);
            else if (localStorage.getItem(self.key + '-timestamp') == self.timestamp) {

                $.extend(self, JSON.parse(localStorage.getItem(self.key)));

                $(window).trigger('sheetsLoaded.' + self.key);

                return false;

            }

            var tempArr = [];

            for (var x = 0; x < data.feed.entry.length; x++) {

                tempArr.push(data.feed.entry[x].id.$t.replace('/worksheets/', '/list/').replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery)

            }

            ajaxGetter(tempArr, function(d){

                    //self.sheets[d.feed.title.$t] = d.feed.entry;

                    self.sheets[d.feed.title.$t] = self.cleanRowData(d.feed.entry);

                },
                function(){

                    localStorage.setItem(self.key, JSON.stringify(self));
                    localStorage.setItem(self.key + '-timestamp', self.timestamp)
                    $(window).trigger('sheetsLoaded.' + self.key);

            });

        });



        function ajaxGetter(url, eachCallback, finalCallback){

            var isArray = $.isArray(url);

            if (!isArray) url = [url];

            var urlCount = url.length;

            //console.log(urlCount);
            for (var i = 0; i < urlCount; i++) {

                runAjax(url[i], i);

            }

            function runAjax(str, count){
                $.getJSON(str, function(d) {

                    eachCallback(d);
                    if (finalCallback && count == (urlCount -1)) finalCallback(d);

                })
                .fail(function() {

                    console.log('Unable to access Google Spreadsheet data - sheet: ' + i + '. Loading from local storage if available.');

                    if (localStorage.getItem(self.key) !== null) { 
                        self = JSON.parse(localStorage.getItem(self.key));
                    }
                }); 
            }
        }
    } 

    sheetServe.prototype.cleanRowData = function(d){

        var newArr = [];

        for (var i = 0, count = d.length; i < count; i++) {

            var newObj = {},
                arrConverts = {};

            for (var key in d[i]) {    

                var objKey = key.replace(this.meta.googlePrefix, ''),
                    objValue = d[i][key][this.meta.googleCellKey];

                if (d[i].hasOwnProperty(key) && key.indexOf(this.meta.googlePrefix) != -1) {


                    if (objKey.indexOf('--') == -1) {

                        if (objValue != '') newObj[objKey] = objValue;

                    } else {

                        var keyArr = objKey.split('--'),
                            keyArrPop = keyArr.pop(),
                            newKeyStr = keyArr.join();

                        // TODO : add console error if last value is not a number

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

function getUrlParams(){

    var paramStr        = window.location.search,
        keyValueObj     = {};

    console.log(window.location.search);

    if (paramStr) {

        // remove initial "?" if present 
        if (paramStr.substr(0, 1) == '?') paramStr = paramStr.substr(1);

        // convert to array by "&"
        var tempArr = paramStr.split('&'),
            tempArrLength = tempArr.length,
            i;

        for (i = 0; i < tempArrLength; i++) {

            // convert to key value pairs
            var tempKeyValArr   = tempArr[i].split('='),
                tempKey         = tempKeyValArr[0],
                tempValue       = (tempKeyValArr[1]) ? tempKeyValArr[1] : '';

            keyValueObj[tempKey] = tempValue;

        }

        console.log(keyValueObj);
        
    }
}
    

    
            
        
        

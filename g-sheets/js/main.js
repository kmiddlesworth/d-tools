
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
        self.addPatrials            = true;
        self.partialsStr            = '-partial';

        //if (localStorage.getItem(self.key) === null) localStorage.setItem(self.key, 'blahblah');

    }

    sheetServe.prototype.onload = function(callback){
        
        var tabCounter = 1;
        
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

            for (var x = 0; x < data.feed.entry.length; x++) {

                tempArr.push(data.feed.entry[x].id.$t.replace('/worksheets/', '/list/').replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery)                
                
            }

            ajaxGetter(tempArr, function(d){

                    //self.sheets[d.feed.title.$t] = d.feed.entry;

                    self.sheets[d.feed.title.$t] = self.cleanRowData(d.feed.entry, d.feed.title.$t);
                    
                    
                },
                function(){
                    
                    // now that all the data has been built, partials data is integrated into the main data
                    if (self.addPartials) self = self.addPartials();
                    
                    //localStorage.setItem(self.key, JSON.stringify(self));
                    //localStorage.setItem(self.key + '-timestamp', self.timestamp)
                    $(window).trigger('sheetsLoaded.' + self.key);

            });

        });

        function ajaxGetter(url, eachCallback, finalCallback){

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
    
    sheetServe.prototype.addPartials = function(key, d){
        
        var self = this;
        
        var partialDeleteArr = [];
        
        // loop through all sheet tabs 
        for (var sheet in self.sheets) { 
            
            // look for any sheet tabs that have "-partial" in the name
            if (sheet.indexOf(self.partialsStr) == -1) {

                // pass the sheet name to the partials injection method
                injectPartials(sheet);
            }
        }
        
        // now that the partials have been place into their respective datasets, delete them from directly inside sheets
        for (var i = 0, total = partialDeleteArr.length; i < total; i++) {
        
            delete self.sheets[partialDeleteArr[i]];
            
        }        
        
        return self;
        
        function injectPartials(sheet){
            
            for (var i = 0, arrCt = self.sheets[sheet].length; i < arrCt; i++) {
                
                for (var objItem in self.sheets[sheet][i]) {
                    
                    if (objItem.indexOf(self.partialsStr) != -1) { 
                        
                        var partialIdKey = self.sheets[sheet][i][objItem];
                        
                        self.sheets[sheet][i][objItem] = self.sheets[objItem].filter(function(item, i){
                        
                            return partialIdKey == item.partialid;
                        
                        });
                        
                        if ($.inArray(objItem, partialDeleteArr) == -1) partialDeleteArr.push(objItem);
                    }
                }
            }
        }
    }

    sheetServe.prototype.cleanRowData = function(d, sheetName){
        
        var self = this,
            newArr = [],
            partialsArr = [];
          
        for (var i = 0, count = d.length; i < count; i++) {

            var newObj = {},
                arrConverts = {};
            
            
            // if "-partial" is in the sheet title skip it. partial data will be added by means of "addPartials" method below
            //if ()
            
            //console.log(d[i]);
            
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

        return keyValueObj;
        
    }
}

function toFileWriter(obj, fileName, callback){
        
    $.ajax({
        url : 'buildjson.php',
        type: 'post',
        data : {input: JSON.stringify(obj), key: obj.key},
        success: function(data) {            
            if (callback) callback(data);
        },
        error: function (jqXHR, textStatus, error) {
            console.log(error);
        }
    });
}
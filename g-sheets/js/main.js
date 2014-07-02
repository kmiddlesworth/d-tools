function getUrlParams() {
	var paramStr = window.location.search,
		keyValueObj = {};
	if (paramStr) {
		if (paramStr.substr(0, 1) == '?') paramStr = paramStr.substr(1);
		var tempArr = paramStr.split('&'),
			tempArrLength = tempArr.length;
		for (var i = 0; i < tempArrLength; i++) {
			var tempKeyValArr = tempArr[i].split('='),
				tempKey = tempKeyValArr[0],
				tempValue = (tempKeyValArr[1]) ? tempKeyValArr[1] : '';
			keyValueObj[tempKey] = tempValue;
		}
		return keyValueObj;
	}
}

function sheetServe(keyStr) {
	var self = this;
	self.meta = new Object(),
	self.sheets = new Object(),
	self.meta.jsonQuery = '?alt=json&callback=?',
	self.meta.loaded = false,
	self.meta.sheetUrl = 'https://spreadsheets.google.com/feeds/worksheets/' + keyStr + '/public/basic' + self.meta.jsonQuery,
	self.meta.googlePrefix = 'gsx$',
	self.meta.googleCellKey = '$t',
	self.meta.key = keyStr,
	self.meta.addPatrials = false,
	self.meta.partialsStr = '-partial',
	self.meta.config = new Object();
}

sheetServe.prototype.addPartials = function(key, d) {
	var self = this,
		partialDeleteArr = [];

	function injectPartials(sheetKey) {
		// for each tab...
		for (var i = 0; i < self.sheets[sheetKey].length; i++) {
			// in each tab's row...
			for (var colName in self.sheets[sheetKey][i]) {
				// if the group name was called by a cell
				if (colName.indexOf(self.meta.partialsStr) != -1) {
					// 1) leave trace that partials are being added in the meta object
					self.meta.addPartials = true;
					// 2) set the column name to a variable
					var partialIdKey = self.sheets[sheetKey][i][colName];
					// 3) set the partial row to a variable to be manipulated
					var newAttr = self.sheets[colName].filter(function(item, i) {
						return partialIdKey == item.partialid;
					});
					console.log(newAttr[0]);
					var newAttrName = newAttr[0].partialid;
					console.log(newAttrName);
					delete newAttr[0].partialid;
					console.log(newAttr[0]);
					self.sheets[sheetKey][i][newAttrName] = newAttr[0];
					delete self.sheets[sheetKey][i][colName];
					if ($.inArray(colName, partialDeleteArr) == -1) {
						partialDeleteArr.push(colName);
					}
				}
			}
		}
	}
	for (var sheetKey in self.sheets) {
		injectPartials(sheetKey);
	}
	for (var i = 0, total = partialDeleteArr.length; i < total; i++) {
		delete self.sheets[partialDeleteArr[i]];
	}
	return self;
}

sheetServe.prototype.cleanRowData = function(d, sheetKey) {
	var self = this,
		newArr = [],
		partialsArr = [];
	// for each row...
	for (var i = 0, count = d.length; i < count; i++) {
		// create a new object and array
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
					if (objValue != '') {
						if (arrConverts[newKeyStr]) arrConverts[newKeyStr].push(objValue);
						else arrConverts[newKeyStr] = [objValue];
					}
				}
			}
		}
		$.extend(newObj, arrConverts);
		newArr.push(newObj);
	}
	return newArr;
}

sheetServe.prototype.onload = function(finished) {
	var self = this;

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
			console.log("failed");
		});
	}

	$(window).off('sheetsLoaded.' + self.key).on('sheetsLoaded.' + self.key, function(e) {
		finished();
	});
	// if connected to internet
	if (!navigator.onLine) {
		$.extend(self, JSON.parse(localStorage.getItem(self.key)));
		$(window).trigger('sheetsLoaded.' + self.key);
		return;
	} else {
		ajaxGetter(self.meta.sheetUrl, function(data) {
			self.meta.title = data.feed.title.$t;
			self.meta.timestamp = data.feed.updated.$t;
			var tempArr = [];
			for (var x = 0; x < data.feed.entry.length; x++) {
				tempArr.push(data.feed.entry[x].id.$t.replace('/worksheets/', '/list/').replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery);
			}
			ajaxGetter(tempArr, function(d) {
					self.sheets[d.feed.title.$t] = self.cleanRowData(d.feed.entry, d.feed.title.$t);
				},
				function() {
					// injects partials into respective places
					self = self.addPartials();
					$(window).trigger('sheetsLoaded.' + self.key);
				});
		});
	}
	return;
}

function preprocessor(rawObj) {
	rawObj.meta.config = rawObj.sheets.config[0];
	delete rawObj.sheets.config;
}

function toFileWriter(obj, fileName, callback) {
	$.ajax({
		url: 'buildjson.php',
		type: 'post',
		data: {
			input: JSON.stringify(obj),
			key: obj.meta.key
		},
		success: function(data) {
			obj.meta.loaded = true;
			preprocessor(obj);
			if (callback) callback(data);
		},
		error: function(jqXHR, textStatus, error) {}
	});
}
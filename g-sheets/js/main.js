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
	self.meta.config = new Object(),
	self.meta.key = keyStr,
	self.meta.jsonQuery = '?alt=json&callback=?',
	self.meta.loaded = false,
	self.meta.addPartials = false,
	self.meta.sheetUrl = 'https://spreadsheets.google.com/feeds/worksheets/' + self.meta.key + '/public/basic' + self.meta.jsonQuery,
	self.meta.googlePrefix = 'gsx$',
	self.meta.googleCellKey = '$t',
	self.meta.partialsStr = '-partial';
}
sheetServe.prototype.grabPartials = function () {
	this.sheets.partials = {};
	for (sheet in this.sheets) {
		if (sheet.indexOf(this.meta.partialsStr) > -1) {
			this.sheets.partials[sheet] = this.sheets[sheet];
		}
	}
}
sheetServe.prototype.injectPartials = function (key, d) {
	// grab all of the partial tabs and put them into a variable
	allPartialsArr = this.sheets.partials;
	console.log(this);
	console.log(allPartialsArr);

	function injectPartial(thisTab, thisRow) {
		var tempArr = allPartialsArr,
			correctObj = {};
		for (var i = tempArr[thisTab].length - 1; i >= 0; i--) {
			if (thisRow == tempArr[thisTab][i]["partialid"]) {
				tempArr[thisTab][i]["partialid"] = undefined;
				return tempArr[thisTab][i];
			}
		}
	}
	console.log(self.sheets);
	for (sheetName in self.sheets) {
		var tab = self.sheets[sheetName];
		for (var row = tab.length - 1, thisRow; row >= 0; row--) {
			thisRow = tab[row];
			for (column in thisRow) {
				if (column.indexOf(self.meta.partialsStr) > -1) {
					var cell = thisRow[column];
					if (Array.isArray(cell)) {
						for (var i = cell.length - 1; i >= 0; i--) {
							self.sheets[sheetName][row][column][i] = injectPartial(column, cell);
						}
					} else {
						self.sheets[sheetName][row][cell] = injectPartial(column, cell);
						console.log(self.sheets[sheetName][row][column]);
					}
				}
			}
		}
	}
	return self;
}
sheetServe.prototype.cleanRowData = function (d, sheetKey) {
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
sheetServe.prototype.onload = function (finished) {
	var self = this;

	function ajaxGetter(url, eachCallback, finalCallback) {
		var isArray = $.isArray(url);
		if (!isArray) url = [url];
		var totalCount = url.length,
			currentCount = 0;
		var ajaxArr = $.map(url, function (item, i) {
			var nonce = (url[i].indexOf('?') == -1) ? '?nonce=' : '&nonce=';
			return $.getJSON(url[i] + nonce + Date.now(), function (d) {
				eachCallback(d);
			});
		});
		$.when.apply(this, ajaxArr).then(function () {
			if (finalCallback) finalCallback();
		}).fail(function () {
			console.log("failed");
		});
	}
	$(window).off('sheetsLoaded.' + self.key).on('sheetsLoaded.' + self.key, function (e) {
		finished();
	});
	// if not connected to internet
	if (!navigator.onLine) {
		$.extend(self, JSON.parse(localStorage.getItem(self.key)));
		$(window).trigger('sheetsLoaded.' + self.key);
		return;
	} else {
		ajaxGetter(self.meta.sheetUrl, function (data) {
			self.meta.title = data.feed.title.$t;
			self.meta.timestamp = data.feed.updated.$t;
			var tempArr = [];
			for (var x = 0; x < data.feed.entry.length; x++) {
				tempArr.push(data.feed.entry[x].id.$t.replace('/worksheets/', '/list/').replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery);
			}
			ajaxGetter(tempArr, function (d) {
					self.sheets[d.feed.title.$t] = self.cleanRowData(d.feed.entry, d.feed.title.$t);
				},
				function () {
					// injects partials into respective places
					self.grabPartials();
					self = self.injectPartials();
					$(window).trigger('sheetsLoaded.' + self.key);
				});
		});
		console.log()
	}
	return;
}
console.log(sheetServe);

function preprocessor(rawObj) {
	rawObj.meta.config = rawObj.sheets.config[0];
	delete rawObj.sheets.config;
}

function toFileWriter(obj, fileName, callback) {
	$.ajax({
		url: 'buildjson.php',
		type: 'post',
		data: {
			// convert object into string for php
			data: JSON.stringify(obj),
			// send the key along side it
			key: obj.meta.key
		},
		success: function (data) {
			obj.meta.loaded = true;
			preprocessor(obj);
			if (callback) callback(data);
		},
		error: function (jqXHR, textStatus, error) {}
	});
}
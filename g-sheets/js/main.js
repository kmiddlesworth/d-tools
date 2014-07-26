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

function burrow(start, attrs) {
	// burrow down through object
	console.log(start);
	console.log(attrs);
	var nextLevel = start,
		attrLen = attrs.length - 1;
	for (var i = 0; i < attrLen; i++) {
		if (nextLevel[attrs[i]] === undefined) {
			nextLevel[attrs[i]] = {};
		} else {
			nextLevel = start[attrs[i]];
		}
	}
	return nextLevel;
}
var SheetServe = function sheetServe(keyStr) {
	this["meta"] = {};
	this["sheets"] = {};
	this["meta"]["key"] = keyStr;
	this["meta"]["jsonQuery"] = '?alt=json&callback=?';
	this["meta"]["loaded"] = false;
	this["meta"]["addPartials"] = false;
	this["meta"]["sheetUrl"] = 'https://spreadsheets.google.com/feeds/worksheets/' + this["meta"]["key"] + '/public/basic' + this["meta"]["jsonQuery"];
	this["meta"]["googlePrefix"] = 'gsx$';
	this["meta"]["googleCellKey"] = '$t';
	this["meta"]["partialStr"] = '-partial';
	this["meta"]["partialsGrouped"] = false;
	return this;
};
SheetServe.prototype.toFileWriter = function toFileWriter(obj, fileName, callback) {
	var selfie = this;
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
			if (callback) callback(data);
		},
		error: function (jqXHR, textStatus, error) {}
	});
};
SheetServe.prototype.copyObjects = function copyObjects(locations, theseAttrs) {
	var moveThis = burrow(this[locations.from], theseAttrs),
		toHere = burrow(this[locations.to], theseAttrs);
	console.log(toHere);
	console.log(moveThis);
	console.log(locations);
	if (moveThis.length == 1) {
		this[locations.to][theseAttrs] = moveThis[0];
	} else {
		this[locations.to][theseAttrs] = moveThis;
	}
	return this.meta[theseAttrs];
};
SheetServe.prototype.deletePartials = function () {
	var allPs = [];
	for (var pName in this.sheets) {
		if (pName.indexOf(this.meta.partialStr) > -1) {
			allPs[pName] = this.sheets[pName];
		}
	}
	return allPs;
};
SheetServe.prototype.groupPartials = function groupPartials() {
	var allPartials = {};
	for (var sheet in this.sheets) {
		if (sheet.indexOf(this.meta.partialStr) > -1) {
			allPartials[sheet] = this.sheets[sheet];
		}
	}
	// this.sheets.partials = allPartials;
	this["meta"]["partialsGrouped"] = true;
	return allPartials;
};
SheetServe.prototype.newSheet = function newSheet(id, pObj) {
	this.sheets[id] = pObj;
	return this.sheets[id];
};
SheetServe.prototype.getPartialTabNames = function getPartialTabNames() {
	var pNames = [];
	if (this["meta"]["partialsGrouped"]) {
		console.log('this["meta"]["partialsGrouped"] == true');
		for (var pName1 in this.sheets.partials) {
			pNames.push(pName1);
		}
	} else {
		var allPartials = this.groupPartials();
		for (var pName2 in allPartials) {
			pNames.push(pName2);
		}
	}
	return pNames;
};
SheetServe.prototype.injectPartial = function injectPartial(sheetName, thisTab, thisRow) {
	var tempArr = this.getPartialTabNames(),
		foundIt = false;
	for (var tabNum = 0;
		(tabNum < tempArr.length && !foundIt); tabNum++) {
		if (tempArr[tabNum] == thisTab) {
			for (var i = 0;
				(i < this.sheets.partials[thisTab]["length"] && !foundIt); i++) {
				if (this.sheets.partials[thisTab][i]["partialid"] == thisRow) {
					foundIt = this.sheets.partials[thisTab][i];
				}
			}
		}
	}
	return foundIt;
};
SheetServe.prototype.cleanPartialIds = function (pIdArr) {
	for (var i = pIdArr.length - 1; i >= 0; i--) {
		var arrOfObjNames = this.sheets.partials[pIdArr[i]];
		for (var tabName in this.sheets) {
			if (tabName !== "partials") {
				for (var j = this["sheets"][tabName].length - 1; j >= 0; j--) {}
			}
		}
	}
};
SheetServe.prototype.injectPartials = function (key, d) {
	// grab all of the partial tabs and put them into a variable
	this.getPartialTabNames();
	for (var sheetName in this.sheets) {
		// iterates through each tab, storing it in a variable
		var tab = this.sheets[sheetName];
		for (var row = tab.length - 1, thisRow; row >= 0; row--) {
			// iterates through each row, storing it in a variable
			thisRow = tab[row];
			// find all of the columns, and see if any match the partialStr attribute
			for (var column in thisRow) {
				// if they do, then
				if (column.indexOf(this.meta.partialStr) > -1) {
					// figure out if the cell in that row and in that column is an array or a string
					var cell = thisRow[column];
					if (Array.isArray(cell)) {
						for (var m = cell.length - 1; m >= 0; m--) {
							this.sheets[sheetName][row][column][m] = this.injectPartial(sheetName, column, cell);
						}
					} else {
						this.sheets[sheetName][row][cell] = this.injectPartial(sheetName, column, cell);
					}
				}
			}
		}
	}
	this.meta.addPartials = true;
	return this;
};
SheetServe.prototype.makeArraysAndObjects = function makeArraysAndObjects(d, sheetKey) {
	var newArr = [],
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
				var splitKeyArr = objKey.split('--');
				if (splitKeyArr.length === 1) {
					if (objValue !== '') newObj[objKey] = objValue;
				} else {
					var keyArr = objKey.split('--');
					for (var n = keyArr.length - 1; n > 0; n--) {
						if (!isNaN(keyArr[n] / 1)) {
							var keyArrPop = keyArr.pop(),
								newKeyStr = keyArr.join();
							if (objValue !== '') {
								if (arrConverts[newKeyStr]) arrConverts[newKeyStr].push(objValue);
								else arrConverts[newKeyStr] = [objValue];
							}
						} else {
							// make object here
						}
					}
				}
			}
		}
		$.extend(newObj, arrConverts);
		newArr.push(newObj);
	}
	return newArr;
};
SheetServe.prototype.removeAttrs = function removeAttrs(location, theseVals) {
	var hereNow = burrow(this, location);
	for (var i = theseVals.length - 1; i >= 0; i--) {
		delete hereNow[theseVals[i]];
	}
	console.log(this);
};
SheetServe.prototype.ajaxGetter = function ajaxGetter(url, eachCallback, finalCallback) {
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
		console.log('failed');
	});
};
SheetServe.prototype.onload = function onload(finished) {
	$(window).off('sheetsLoaded.' + this.key).on('sheetsLoaded.' + this.key, function (e) {
		finished();
	});
	// if not connected to internet
	if (!navigator.onLine) {
		$.extend(this, JSON.parse(localStorage.getItem(this.key)));
		$(window).trigger('sheetsLoaded.' + this.key);
		return;
	} else {
		var self = this;
		this.ajaxGetter(self.meta.sheetUrl, function (data) {
			self.meta.title = data.feed.title.$t;
			self.meta.timestamp = data.feed.updated.$t;
			var tempArr = [];
			for (var x = 0; x < data.feed.entry.length; x++) {
				tempArr.push(data.feed.entry[x].id.$t
					.replace('/worksheets/', '/list/')
					.replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery);
			}
			self.ajaxGetter(tempArr, function (d) {
				self.sheets[d.feed.title.$t] = self.makeArraysAndObjects(d.feed.entry, d.feed.title.$t);
			}, function () {
				// injects partials into respective places
				// copy the config object into the meta object
				self.copyObjects({
					from: ["sheets"],
					to: ["meta"]
				}, ["config"]);
				// remove config from sheets
				self.removeAttrs(["sheets"], ["config"]);
				var allPartialNames = self.getPartialTabNames();
				self.copyObjects({
					from: ["sheets"],
					to: ["sheets", "partials"]
				}, allPartialNames);
				// var groupedPartials = self.groupPartials();
				// self.newSheet("partials", groupedPartials);
				var arrayOfPartialNames = self.getPartialTabNames();
				self.removeAttrs(["sheets"], arrayOfPartialNames);
				console.log(arrayOfPartialNames);
				self.injectPartials();
				self.cleanPartialIds(arrayOfPartialNames);
				$(window).trigger('sheetsLoaded.' + self.key);
			});
		});
	}
	console.log(this);
	return;
};
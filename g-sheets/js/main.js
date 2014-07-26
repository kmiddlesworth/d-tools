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

function grabThingAtAttr(start, path) {
	var nextLevel = start;
	for (var i = 0, pathLen = path.length; i < pathLen; i++) {
		nextLevel = nextLevel[path[i]];
	}
	if (nextLevel) {
		return nextLevel;
	} else {
		nextLevel = "nothing exists here";
		return nextLevel;
	}
}

function flipArrToObj(attr, flipThis) {
	// gather attributes (1st col)
	var allAttrs = [],
		newTab = [];
	for (var i = flipThis.length - 1; i >= 0; i--) {
		allAttrs.push(flipThis[i][attr]);
	}
	// set colnames as emtpy objects (top row)
	var newObj = {};
	for (var j = flipThis.length - 1; j >= 0; j--) {
		for (var attrName in flipThis[j]) {
			if (attrName != attr) {
				newObj[attrName] = {};
			}
		}
	}
	// flip everything
	for (var colName in newObj) {
		for (var k = allAttrs.length - 1; k >= 0; k--) {
			newObj[colName][flipThis[k][attr]] = flipThis[k][colName];
		}
	}
	// make pages nameless
	counter = 0;
	for (var objNames in newObj) {
		newTab[counter] = newObj[objNames];
		counter++;
	}
	console.log(newTab);
	return newTab;
}

function getObjsTwoLayersDown(start) {
	var newObj = {};
	for (var tabName in start) {
		for (var rows in start[tabName]) {
			newObj[rows] = start[tabName][rows];
		}
	}
	console.log(newObj);
	return newObj;
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
SheetServe.prototype.toFileWriter = function(obj, fileName, callback) {
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
		success: function(data) {
			obj.meta.loaded = true;
			if (callback) callback(data);
		},
		error: function(jqXHR, textStatus, error) {}
	});
};
SheetServe.prototype.deletePartials = function() {
	var allPs = [];
	for (var pName in this.sheets) {
		if (pName.indexOf(this.meta.partialStr) > -1) {
			allPs[pName] = this.sheets[pName];
		}
	}
	return allPs;
};
SheetServe.prototype.groupPartials = function() {
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
SheetServe.prototype.getPartialTabNames = function(path) {
	var pNames = [];
	var checkThisObj = path;
	for (var sheetName in checkThisObj) {
		if (sheetName.indexOf(this.meta.partialStr) > -1) {
			pNames.push(sheetName);
		}
	}
	return pNames;
};
SheetServe.prototype.injectPartial = function(sheetName, thisTab, thisRow) {
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
SheetServe.prototype.cleanPartialIds = function(pIdArr) {
	for (var i = pIdArr.length - 1; i >= 0; i--) {
		var arrOfObjNames = this.sheets.partials[pIdArr[i]];
		for (var tabName in this.sheets) {
			if (tabName !== "partials") {
				for (var j = this["sheets"][tabName].length - 1; j >= 0; j--) {}
			}
		}
	}
};
SheetServe.prototype.injectPartials = function(key, d) {
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
SheetServe.prototype.makeArraysAndObjects = function(d, sheetKey) {
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
SheetServe.prototype.compilePartials = function(location) {
	var scrape = location;
	for (var tabName in location) {
		for (var rows in location[tabName]) {
			console.log(location[tabName][rows]);
			finished = true;
		}
	}
};
SheetServe.prototype.copyObjects = function(location, theseAttrs) {
	var allThings = location,
		attrsLen = theseAttrs.length,
		returnedObj = {};
	if (attrsLen > 0) {
		for (var i = attrsLen - 1; i >= 0; i--) {
			if (allThings[theseAttrs[i]]) {
				returnedObj[theseAttrs[i]] = allThings[theseAttrs[i]];
			} else {
				console.log(allThings[theseAttrs[i]]);
			}
		}
	} else {
		returnedObj = allThings;
	}
	return returnedObj;
};
SheetServe.prototype.ajaxGetter = function(url, eachCallback, finalCallback) {
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
		console.log('failed');
	});
};
SheetServe.prototype.removeAttrs = function(location, theseVals) {
	var hereNow = location;
	if (Array.isArray(theseVals)) {
		for (var i = theseVals.length - 1; i >= 0; i--) {
			delete hereNow[theseVals[i]];
		}
	} else {
		console.log("please pass in an array to the removeAttrs function");
	}
	return hereNow;
};
SheetServe.prototype.convertArrToObj = function(location, newAttr) {
	var oldArr = location,
		newObj = {};
	for (var i = oldArr.length - 1; i >= 0; i--) {
		newObj[oldArr[i][newAttr]] = oldArr[i];
	}
	return newObj;
};
SheetServe.prototype.rowColFlipper = function(sheetLevel) {
	var flipArr = this.meta.config.tabstoflip.split(" ");
	for (var sheetName in sheetLevel) {
		tempTab = sheetLevel[sheetName];
		for (var i = flipArr.length - 1; i >= 0; i--) {
			if (sheetName == flipArr[i]) {
				tempTab = flipArrToObj(this.meta.config.flipattr, tempTab);
			}
		}
		sheetLevel[sheetName] = tempTab;
	}
	return sheetLevel;
};
SheetServe.prototype.onload = function(finished) {
	$(window).off('sheetsLoaded.' + this.key).on('sheetsLoaded.' + this.key, function(e) {
		finished();
	});
	// if not connected to internet
	if (!navigator.onLine) {
		$.extend(this, JSON.parse(localStorage.getItem(this.key)));
		$(window).trigger('sheetsLoaded.' + this.key);
		return;
	} else {
		var self = this;
		this.ajaxGetter(self.meta.sheetUrl, function(data) {
			self.meta.title = data.feed.title.$t;
			self.meta.timestamp = data.feed.updated.$t;
			var tempArr = [];
			for (var x = 0; x < data.feed.entry.length; x++) {
				tempArr.push(data.feed.entry[x].id.$t
					.replace('/worksheets/', '/list/')
					.replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery);
			}
			self.ajaxGetter(tempArr, function(d) {
				self.sheets[d.feed.title.$t] = self.makeArraysAndObjects(d.feed.entry, d.feed.title.$t);
			}, function() {
				// move the config object to the meta object
				self.meta.config = self.copyObjects(self.sheets.config[0], []);
				// flipping any sheets that need to be flipped
				self.sheets = self.rowColFlipper(self.sheets);
				// get partial names,
				var partialsToDelete = self.getPartialTabNames(self.sheets);
				// copy the partials into a special sheet
				self.sheets.partials = self.copyObjects(self.sheets, partialsToDelete);
				// add config object to delete with partialsToDelete
				partialsToDelete.push("config");
				// remove everything that has been copied so that you do not
				self.sheets = self.removeAttrs(self.sheets, partialsToDelete);
				// convert the partials from their rows to objects themselves
				for (var sheetName in self.sheets.partials) {
					self.sheets.partials[sheetName] = self.convertArrToObj(self.sheets.partials[sheetName], "partialid");
				}
				// get rid of the partialid attribute used to create the partials
				for (sheetName in self.sheets.partials) {
					for (var innerSheetName in self.sheets.partials[sheetName]) {
						self.sheets.partials[sheetName][innerSheetName] = self.removeAttrs(self.sheets.partials[sheetName][innerSheetName], ["partialid"]);
					}
				}
				// compile partials and return the new object
				self.sheets.partials = self.compilePartials(self.sheets.partials);
				$(window).trigger('sheetsLoaded.' + self.key);
			});
		});
	}
	console.log(this);
	return;
};
var globalVar;
document.body.onload = (function () {
	"use strict";
	if (!Array.prototype.filter) {
		Array.prototype.filter = function (fun /*, thisArg */ ) {
			if (this === void 0 || this === null) throw new TypeError();
			var t = Object(this),
				len = t.length >>> 0;
			if (typeof fun !== "function") throw new TypeError();
			var res = [],
				thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			for (var i = 0; i < len; i++) {
				if (i in t) {
					var val = t[i];
					// pulled from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
					// NOTE: Technically this should Object.defineProperty at
					//       the next index, as push can be affected by
					//       properties on Object.prototype and Array.prototype.
					//       But that method's new, and collisions should be
					//       rare, so use the more-compatible alternative.
					if (fun.call('<span style="line-height: normal;">thisArg</span><span style="line-height: normal;">, val, i, t))</span>')) {
						res.push(val);
					}
				}
				return res;
			}
		};
	}

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

	function grabThingAtPath(start, path) {
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

	function findRanges(myArray, range) {
		var min,
			max,
			newArray = [];
		// set and max vals
		if (range.max === undefined) max = myArray.length;
		else max = range.max;
		if (range.min === undefined) min = 0;
		else min = range.min;
		if (range.max) {
			for (var i = max; i >= min; i--) {
				newArray(myArray[i]);
			}
		}
		return newArray;
	}

	function nuA(num) {
		var variable = new Array(num);
		return variable;
	}

	function flipMatrix(axis, flipThis) {
		var newTab = flipThis,
			colCount = 0,
			continueFlip = false;
		// anticipate goodie bags needed
		for (var attrs in flipThis[0]) {
			// and make sure there is at least one super special goodie
			if (attrs === axis) continueFlip = true;
			else colCount++;
		}
		if (continueFlip) {
			// gather bowls for sorting candy
			var flipLen = flipThis.length,
				allAttrs = nuA(flipLen),
				newAttrs = nuA(1),
				allData = nuA(colCount);
			newTab = nuA(colCount);
			// divide and organize the candy
			var outerCounter = colCount;
			for (var columns in flipThis[0]) {
				var tempArr = nuA(flipLen),
					iterator = flipLen;
				while (iterator--) {
					// organize candy by attribute
					tempArr[iterator] = flipThis[iterator][columns];
				}
				// line up candies in row
				tempArr.push(columns);
				// line up rows of candy with one another
				if (columns === axis) newAttrs[0] = tempArr;
				else allData[outerCounter] = tempArr;
				outerCounter--;
			}
			allData.reverse();
			newAttrs.reverse();
			var i = allData.length;
			while (i--) {
				// create new goodieBag
				var bag = {},
					dataLen = allData[i].length;
				// fill goodieBag with goodies
				var access = dataLen;
				while (access--) {
					// if special goodie, treat it right
					// else throw it all in
					if (access === dataLen) bag[axis] = allData[i][access];
					else bag[newAttrs[0][access]] = allData[i][access];
				}
				// give new goodiebag a home
				newTab[i] = bag;
			}
		}
		// finish giving out goodie bags
		return newTab;
	}
	// inverts columns and rows for any given location
	// axis should be the upper left corner of the tab
	function rowColFlipper(axis) {
		return function (flipThese, location) {
			var flipArr = flipThese.split(" ");
			for (var sheetName in location) {
				var tempTab = location[sheetName];
				for (var i = flipArr.length - 1; i >= 0; i--) {
					if (sheetName == flipArr[i]) {
						tempTab = flipMatrix(axis, tempTab);
					}
				}
				location[sheetName] = tempTab;
			}
		};
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
		this["meta"]["configStr"] = "config";
		return this;
	};
	SheetServe.prototype.toFileWriter = function (obj, fileName, callback) {
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
	SheetServe.prototype.getPartialTabNames = function (path) {
		var pNames = [],
			checkThisObj = path;
		for (var sheetName in checkThisObj) {
			if (sheetName.indexOf(this.meta.partialStr) > -1) {
				pNames.push(sheetName);
			}
		}
		return pNames;
	};
	SheetServe.prototype.injectPartial = function (sheetName, thisTab, thisRow) {
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
	SheetServe.prototype.makeArraysAndObjects = function (d, sheetKey) {
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
	SheetServe.prototype.compilePartials = function (location) {
		var finished;
		for (var tabName in location) {
			for (var rows in location[tabName]) {
				// console.log(tabName + ", " + rows);
				finished = true;
			}
		}
		return location;
	};
	SheetServe.prototype.ajaxGetter = function (url, eachCallback, finalCallback) {
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
	SheetServe.prototype.removeAttrs = function (location, theseVals) {
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
	SheetServe.prototype.convertArrToObj = function (location, newAttr) {
		var newObj = {};
		for (var i = location.length - 1; i >= 0; i--) {
			newObj[location[i][newAttr]] = location[i];
		}
		return newObj;
	};
	// creates the most basic form of sheets from the original google data
	SheetServe.prototype.makeBasicSheets = function (d, sheetKey) {
		var newArr = [],
			partialsArr = [];
		// iterate through tabs
		for (var i = 0, count = d.length; i < count; i++) {
			var newObj = {};
			// iterate through generated and user properties
			for (var key in d[i]) {
				var arrConverts = {};
				var objKey = key.replace(this.meta.googlePrefix, ''),
					objValue = d[i][key][this.meta.googleCellKey];
				// if sheet attribute was made by user, put it into user sheets
				if (key.indexOf(this.meta.googlePrefix) > -1) {
					arrConverts[objKey] = objValue;
				}
				$.extend(newObj, arrConverts);
			}
			newArr.push(newObj);
		}
		return newArr;
	};
	/*
	function partialSniffer (thisObj, stringList) {
		var path = [];
		function findMatchingPartial(cellStr, colStr){
			for (var i = thisObj.length - 1; i >= 0; i--) {
				if (thisObj.meta[partialid] === cellStr && colStr === thisObj.meta[parentStr]) {};
			}
		}
		function returnStrObj (thisString, cellString, colString) {
			if (thisString === cellString){
				return findMatchingPartial(cellString, colString);
			} else {
				return thisString;
			}
		}
		for(var col in thisRow){
		}
		function typeCheck (unkType, path) {
			if (Array.isArray(unkType)) {
				arrayBurrow (unkType, allPartials);
			} else if ((typeof unkType === 'string' && party.string) ||
				!isNaN(unkType) ||
				(typeof === 'boolean' && party.string)) {
					check if string matches a partial
					injectPartialQuery(unkType);

					i = stringList.length
			} else if (party.object) {
				objectBurrow (unkType, party.object);
			}
		}
		function arrayBurrow (myArray) {
			var plLen = myArray.length;
			while (plLen--) {
				typeCheck(myArray[plLen]);
			}
		}
		function objectBurrow (myObj) {
			for (var attr in myObj) {
				typeCheck(myObj[attr]);
			}
		}
		function objArrEqualizer (location, layers) {
			var allPartials = [];
			for (var partialName in location) {
				typeCheck(location[partialList], allPartials);
			}
			return allPartials;
		}
		for (var i = stringList.length - 1; i >= 0; i--) {
			for in loop iterating over columns {
				if a match to a partial is found
					if value is a string
						replace it with an object
					else if value is not a string
						recursively call this function, passing in the object to check for more partials
						typeCheck(thisObj, stringList)
						i = stringList.length
				if match to a partial is not found, continue
			}
		}
		return thisObj
	}
	*/
	// accepts (as filters) a filter or a range
	// with a filter, you can selectively find indexes of arrays as well object attributes
	// with a range, you can find any range of numbers
	// in an array's index and send in multiple ranges
	// filter will return an object, while a range will always return an array
	SheetServe.prototype.gimmeThese = function (location, filter) {
		var allThings = location,
			returnedObj;
		if (filter.only) {
			var myscreen = filter.only,
				filterLen = myscreen.length - 1;
			returnedObj = {};
			if (filterLen > 0) {
				for (var i = filterLen; i >= 0; i--) {
					returnedObj[myscreen[i]] = allThings[myscreen[i]];
				}
			} else {
				returnedObj[myscreen[0]] = allThings[myscreen[0]];
			}
		} else if (filter.range) {
			returnedObj = [];
			if (Array.isArray(filter.range)) {
				for (var k = filter.range.length - 1; k >= 0; k--) {
					returnedObj.concat(findRanges(allThings, filter.range[k]));
				}
			} else {
				returnedObj = findRanges(allThings, filter.range);
			}
		}
		return returnedObj;
	};

	function divideParallel(start, location, attrs) {
		var startLen = start[location.from].length;
		if (!start[location.to]) {
			start[location.to] = nuA(startLen);
		}
		var i = startLen;
		while (i--) {
			var tempObj = {};
			tempObj[start[location.from][i][attrs.key]] = start[location.from][i][attrs.val];
			delete start[location.from][i][attrs.val];
			delete start[location.from][i][attrs.key];
			start[location.to][i] = tempObj;
		}
	}

	function pullObjsUp(start, newAttr) {
		var newObj = [],
			partialList = [];
		for (var colNam in start) {
			partialList.push(colNam);
		}
		for (var tName in start) {
			if (tName !== "sheets" && tName !== "meta") {
				for (var rows in start[tName]) {
					var thisRow = start[tName][rows];
					thisRow[newAttr.parentLink] = tName;
					newObj.push(thisRow);
				}
				delete start[tName];
			}
		}
		return newObj;
	}

	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	function isBigEnough(element) {
		return element >= 10;
	}
	// send object in at a reverse order so that the "last part" is first
	function extendObj(arrayOfObjs) {
		// for (var i = Things.length - 1; i >= 0; i--) {}
	}

	function concatPartials(sheets, meta, prefix) {
		var partialLen = sheets.length,
			colHoldr = "peas";
		// iterate through sheet and look for things with partial suffix
		// find all the partials that are called by partials prefix
		// i is basically equal to the row
		for (var i = partialLen - 1; i >= 0; i--) {
			for (var colNam in sheets[i]) {
				var pPointArr = {},
					cellArr = sheets[i][colNam].split(" ");
				// if the partials prefix is found, split the cell into an array
				// and assign it to the new object attribute
				if (colNam.indexOf(prefix) > -1) {
					// if an object has not yet been created to hold the partial arrays, then create it.
					if (!meta[i][colHoldr]) {
						meta[i][colHoldr] = {};
					}
					meta[i][colHoldr][colNam] = cellArr;
				}
			}
		}
		// done gathering info and putting into meta tags
		for (var it = partialLen - 1; it >= 0; it--) {
			if (meta[it][colHoldr]) {
				var findThesePs = meta[it][colHoldr];
				for (var partCols in findThesePs) {
					var stackedParts = findThesePs[partCols],
						stackedPsLen = stackedParts.length;
					// now we're at the names
					for (var iter = partialLen - 1; iter >= 0; iter--) {
						if (meta[iter][partCols] && meta[iter][partCols] === stackedParts[iter]) {
							console.log(meta[iter][partCols]);
							console.log("foundsome");
						}
					}
				}
				// loop through the partials called by the cell
				for (var k = findThesePs.length - 1; k >= 0; k--) {}
			}
		}
	}

	function clearEmptyCells(that) {
		var datLen = that.length,
			i = datLen;
		while (i--) {
			var row = that[i];
			for (var col in row) {
				if (row[col] === "") {
					delete row[col];
				}
			}
		}
	}
	SheetServe.prototype.onload = function (finished) {
		var configStr = this["meta"]["configStr"];
		$(window).off('sheetsLoaded.' + this.key).on('sheetsLoaded.' + this.key, function (e) {
			finished();
		});
		// if not connected to internet
		var self = this;
		if (!navigator.onLine) {
			$.extend(this, JSON.parse(localStorage.getItem(this.key)));
			$(window).trigger('sheetsLoaded.' + this.key);
			return;
		} else {
			this.ajaxGetter(self.meta.sheetUrl, function (data) {
				self.meta.title = data.feed.title.$t;
				self.meta.timestamp = data.feed.updated.$t;
				var tempArr = [];
				for (var x = 0; x < data.feed.entry.length; x++) {
					tempArr.push(data.feed.entry[x].id.$t.replace('/worksheets/', '/list/').replace('/public/basic', '') + '/public/values' + self.meta.jsonQuery);
				}
				self.ajaxGetter(tempArr, function (d) {
					self.sheets[d.feed.title.$t] = self.makeBasicSheets(d.feed.entry, d.feed.title.$t);
				}, function () {
					// move the config object to the meta object
					self.meta[configStr] = self.sheets[configStr][0];
					// after the attribute has been set, you can call the function returned anywhere
					var flipTabs = rowColFlipper(self.meta[configStr].flipattr);
					// like here
					flipTabs(self.meta[configStr].verticaltabs, self.sheets);
					// weed out all empty cells
					for (var sheet in self.sheets) {
						clearEmptyCells(self.sheets[sheet]);
					}
					// get partial names,
					var partialsToDelete = self.getPartialTabNames(self.sheets);
					// copy the partials into a special sheet
					self.partials = self.gimmeThese(self.sheets, {
						only: partialsToDelete
					});
					var metaTags = {
						parentLink: "parentpartial",
						cellLink: "partialid"
					};
					// add config object to delete with partialsToDelete
					partialsToDelete.push(configStr);
					// remove everything that has been copied so that you do not overwork the object
					self.sheets = self.removeAttrs(self.sheets, partialsToDelete);
					self.partials.sheets = pullObjsUp(self.partials, metaTags);
					divideParallel(self.partials, {
						from: "sheets",
						to: "meta"
					}, {
						key: metaTags.parentLink,
						val: metaTags.cellLink
					});
					var compiledPartials = concatPartials(self.partials.sheets, self.partials.meta, self.meta.partialStr);
					// copy partials into main sheet object
					// convert the partials from their rows to objects themselves
					// for (var sheetName in self.partials) {
					// 	self.partials[sheetName] = self.convertArrToObj(self.partials[sheetName], "partialid");
					// }
					// get rid of the partialid attribute used to create the partials
					// for (var sName in self.partials) {
					// 	for (var innerSName in self.partials[sName]) {
					// 		self.partials[sName][innerSName] = self.removeAttrs(self.partials[sName][innerSName], ["partialid"]);
					// 	}
					// }
					// compile partials and return the new object
					// self.partials = self.compilePartials(self.partials);
					$(window).trigger('sheetsLoaded.');
					console.log(self);
				});
			});
		}
		return;
	};
	var urlParams = getUrlParams() || false;
	if (urlParams.gkey) {
		var gSheetData = new SheetServe(urlParams.gkey),
			myGSheetData = gSheetData;
		gSheetData.onload(function () {
			// change this so user can input a value from an input box
			// ... for the link so we can host on different computers and have it run through exactly the same way
			myGSheetData.toFileWriter(gSheetData, gSheetData.meta.config.key, function (d) {
				var dataString = '<p><strong>Compiled JSON:</strong></p><pre>' + JSON.stringify(gSheetData, null, 2) + '</pre>',
					projectBtn = '<a class="button" href="' + gSheetData.meta.config.projecturl + '">Project: ' + gSheetData.meta.config.projectname + '</a>',
					phpIncludeCode = '<p><strong>PHP Include:</strong></p><pre>&lt;? $gSheeData = unserialize(file_get_contents($_SERVER[\'DOCUMENT_ROOT\'] . &quot;/d-tools/g-sheets/json-output-php/' + gSheetData.key + '.php&quot;)) ?&gt;</pre>',
					phpJsIncludeCode = '<p><strong>PHP JS head Include:</strong></p><pre>&lt;script&gt;&lt;?= var gSheetData = file_get_contents($_SERVER[\'DOCUMENT_ROOT\'] . "/d-tools/g-sheets/json-output-js/' + gSheetData.key + '.js") ?&gt;&lt;/script&gt;</pre>';
				document.getElementById("wrapper").innerHTML = d + projectBtn + phpJsIncludeCode + phpIncludeCode + dataString;
			});
			if (gSheetData.meta.config.open == "TRUE") {
				window.open(gSheetData.meta.config.projecturl, "_blank");
			}
		});
	} else {
		alert('A Google Sheet key url parameter ("gkey") must exist.');
	}
})();
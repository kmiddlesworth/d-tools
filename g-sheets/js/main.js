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
			if (sheetName.indexOf(this.meta.config.partialstr) > -1) {
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

	function findMorePartials(orig, parent, split) {
		for (var col in parent) {
			if (col.indexOf(split) > -1) {
				if (typeof parent[col] === "string") {
					var theseParts = parent[col].split(" ");
					for (var i = theseParts.length - 1; i >= 0; i--) {
						parent[col] = orig.findPartial(col, theseParts[i]);
					}
				}
				findMorePartials(orig, parent[col], split);
			}
			makeArraysAndObjects(parent, orig.meta.splitstring);
		}
	}
	var onlyNow = false;

	function makeArraysAndObjects(ro, split) {
		var newObj = false,
			index, name, value;
		for (var key in ro) {
			var splitKey = key.split(split),
				sKeyLen = splitKey.length;
			index = splitKey[1];
			name = splitKey[0];
			value = ro[key];
			if (sKeyLen > 1) {
				if (!ro[name]) {
					if (parseInt(index, 10)) ro[name] = [];
					else ro[name] = {};
				}
				if (parseInt(index, 10)) ro[name][index - 1] = value;
				else ro[name][index] = value;
				delete ro[key];
			}
		}
	}
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
	// accepts (as filters) a filter or a range
	// with a filter, you can selectively find indexes of arrays as well object attributes
	// with a range, you can find any range of numbers
	// in an array's index and send in multiple ranges
	// filter will return an object, while a range will always return an array
	// or just pass in an everything attribute set to true to get everything
	var gimmeThese = function (location, filter) {
		var allThings = location,
			returnedObj;
		if (filter.everything) {
			returnedObj = allThings;
		} else if (filter.only) {
			var myscreen = filter.only,
				filterLen = myscreen.length - 1;
			returnedObj = {};
			if (filterLen > 0) {
				for (var i = filterLen; i >= 0; i--) {
					returnedObj[myscreen[i]] = allThings[myscreen[i]];
				}
			} else {
				returnedObj[myscreen[0]] = allThings;
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
		for (var i = startLen - 1; i >= 0; i--) {
			var tempObj = {};
			tempObj['key'] = start[location.from][i][attrs.key];
			tempObj['val'] = start[location.from][i][attrs.val];
			delete start[location.from][i][attrs.key];
			start[location.to][i] = tempObj;
		}
	}

	function pullObjsUp(start, newAttr) {
		var newObj = [];
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
	function extendObj(old, nu) {
		if (nu) {
			for (var k in nu) {
				old[k] = nu[k];
			}
		}
	}

	function clearEmptyCells(that) {
		for (var i = that.length - 1; i >= 0; i--) {
			var ro = that[i];
			for (var col in ro) {
				if (ro[col] === '') delete ro[col];
				if (ro[col] == "TRUE") ro[col] = true;
				if (ro[col] == "FALSE") ro[col] = false;
			}
		}
	}

	function findSheetNames(thisLevel) {
		var tempArr = [];
		for (var names in thisLevel) {
			tempArr.push(names);
		}
		return tempArr;
	}

	function findPartial(origin, tab, row) {
		var meta = origin.meta,
			sheets = origin.sheets;
		for (var i = meta.length - 1; i >= 0; i--) {
			if (meta[i].key === tab && row === meta[i].val) {
				return sheets[i];
			}
		}
		return undefined;
	}

	function findPartialsFromCell(allRows, val) {
		var retObj = {};
		if (val.length === 2) {
			for (var i = val[1].length - 1; i >= 0; i--) {
				for (var j = val[0].length - 1; j >= 0; j--) {
					extendObj(retObj, findPartial(allRows, val[1][i], val[0][j]));
				}
			}
		}
		return retObj;
	}
	var setTunnel = function (tunnel, allRow) {
		return function findAndReplace(val) {
			if (typeof val === "string") {
				val = val.split(tunnel);
				var valLen = val.length;
				// return if not seeking a partial
				if (valLen === 1) return val[0];
				if (valLen > 1) {
					val.reverse();
					for (var k = valLen - 1; k >= 0; k--) {
						var innerVal = val[k].split(" ");
						if (innerVal.length > 1) innerVal.reverse();
						val[k] = innerVal;
					}
					var finalVal = findPartialsFromCell(allRow, val);
					for (var attr in finalVal) {
						findAndReplace(finalVal[attr]);
					}
					makeArraysAndObjects(finalVal, '--');
					return finalVal;
				}
			}
			// return if boolean
			return val;
		};
	};
	SheetServe.prototype.onload = function (finished) {
		var configStr = this["meta"]["configStr"];
		$(window).off('sheetsLoaded.' + this.key).on('sheetsLoaded.' + this.key, function (e) {
			finished();
		});
		// if not connected to internet
		console.log(this);
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
					if (d.feed.entry !== undefined) {
						self.sheets[d.feed.title.$t] = self.makeBasicSheets(d.feed.entry, d.feed.title.$t);
					}
				}, function () {
					// move the config object to the meta object
					extendObj(self.meta, self.sheets[configStr][0]);
					delete self.sheets[configStr];
					// after the attribute has been set, you can call the function returned anywhere
					var flipTabs,
						tabsToFlip,
						oppositeFlipTabs = self.meta.verticaltabs.split(' ');
					if (self.meta.verticaltabsdefault) {
						tabsToFlip = findSheetNames(self.sheets);
						for (var i = oppositeFlipTabs.length - 1; i >= 0; i--) {
							for (var j = tabsToFlip.length - 1; j >= 0; j--) {
								if (oppositeFlipTabs[i] === tabsToFlip[j]) {
									tabsToFlip.splice(j, 1);
								}
							}
						}
						tabsToFlip.join(' ');
					}
					if (!self.meta.verticaltabsdefault) tabsToFlip = oppositeFlipTabs;
					flipTabs = rowColFlipper(self.meta.axis);
					// like here
					flipTabs(tabsToFlip.join(' '), self.sheets);
					// weed out all empty cells
					// for (var sheet in self.sheets) {}
					// get sheet names,
					var allSheetNames = findSheetNames(self.sheets);
					// copy the partials into an object in memory
					var allRow;
					allRow = self.sheets;
					var metaTags = {
						parentLink: "parenttab",
						cellLink: self.meta.axis
					};
					// delete self.sheets;
					// remove everything that has been copied so that you do not overwork the object
					allRow.sheets = pullObjsUp(allRow, metaTags);
					divideParallel(allRow, {
						from: "sheets",
						to: "meta"
					}, {
						key: metaTags.parentLink,
						val: metaTags.cellLink
					});
					var roMeta = allRow.meta,
						rows = allRow.sheets;
					self.sheets = {};
					clearEmptyCells(rows);
					for (var l = roMeta.length - 1; l >= 0; l--) {
						var row = allRow.sheets[l];
						if (!self.sheets[roMeta[l].key]) {
							self.sheets[roMeta[l].key] = {};
						}
						self.sheets[roMeta[l].key][roMeta[l].val] = row;
					}
					// cellular object injection
					var tunnelSet = setTunnel(self.meta.tunnel, allRow);
					for (var tab in self.sheets) {
						var thisTab = self.sheets[tab];
						for (var ro in thisTab) {
							var thisRo = thisTab[ro];
							for (var cell in thisRo) {
								var val = thisRo[cell];
								thisRo[cell] = tunnelSet(thisRo[cell]);
							}
							makeArraysAndObjects(thisRo, self.meta.splitobj);
						}
					}
					$(window).trigger('sheetsLoaded.');
					// write to dom with document fragment
					var bigFrag = document.createDocumentFragment(),
						smallFrag;
					bigFrag.appendChild(document.createElement('ul'));

					function recursiveDomBuilder(obj) {
						var tempFrag = document.createDocumentFragment(),
							counter = 0;
						for (var text in obj) {
							var li = document.createElement('li');
							li.textContent = text;
							li.onclick = function (party) {
								party.stopPropagation();
								for (var i = this.children.length - 1; i >= 0; i--) {
									if (this.children[i].tagName === 'UL') {
										if (!this.children[i].classList.contains('open')) {
											this.children[i].classList.add('open');
										} else {
											this.children[i].classList.remove('open');
										}
									}
								}
							};
							tempFrag.appendChild(li);
							if (typeof obj[text] === 'string') li.textContent = text + '\t-> ' + obj[text];
							if (obj[text] === true) li.textContent = text + '\t-> ' + "true";
							if (obj[text] === false) li.textContent = text + '\t-> ' + "false";
							if (typeof obj[text] === 'object') {
								var ul = document.createElement('ul');
								ul.appendChild(recursiveDomBuilder(obj[text]));
								tempFrag.children[counter].appendChild(ul);
							}
							counter++;
						}
						return tempFrag;
					}
					smallFrag = recursiveDomBuilder(self.sheets);
					bigFrag.children[0].appendChild(smallFrag);
					document.getElementById("data-wrapper").appendChild(bigFrag);
					var sheetList = document.getElementById('data-wrapper').children[0].children;
					console.log(sheetList);
				});
			});
		}
		return;
	};
	// findMorePartials(self, thisRo[cell], self.meta.partialstr);
	var urlParams = getUrlParams() || false;
	if (urlParams.gkey) {
		var gSheetData = new SheetServe(urlParams.gkey);
		gSheetData.onload(function () {
			// change this so user can input a value from an input box
			// ... for the link so we can host on different computers and have it run through exactly the same way
			gSheetData.toFileWriter(gSheetData, gSheetData.meta.key, function (d) {
				var dataString = '<p><strong>Compiled JSON:</strong></p><pre>' + JSON.stringify(gSheetData, null, 2) + '</pre>',
					projectBtn = '<a class="button" href="' + gSheetData.meta.projecturl + '">Project: ' + gSheetData.meta.projectname + '</a>',
					phpIncludeCode = '<p><strong>PHP Include:</strong></p><pre>&lt;? $gSheeData = unserialize(file_get_contents($_SERVER[\'DOCUMENT_ROOT\'] . &quot;/d-tools/g-sheets/json-output-php/' + gSheetData.meta.key + '.php&quot;)) ?&gt;</pre>',
					phpJsIncludeCode = '<p><strong>PHP JS head Include:</strong></p><pre>&lt;script&gt;&lt;?= var gSheetData = file_get_contents($_SERVER[\'DOCUMENT_ROOT\'] . "/d-tools/g-sheets/json-output-js/' + gSheetData.meta.key + '.js") ?&gt;&lt;/script&gt;</pre>';
				document.getElementById("wrapper").innerHTML = d + projectBtn + phpJsIncludeCode + phpIncludeCode;
			});
			if (gSheetData.meta.open == "TRUE") {
				window.open(gSheetData.meta.projecturl, "_blank");
			}
		});
	} else {
		alert('A Google Sheet key url parameter ("gkey") must exist.');
	}
})();
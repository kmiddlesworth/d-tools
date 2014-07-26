<!DOCTYPE html>
<html class="no-js">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>G Sheets</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

	<link rel="stylesheet" href="css/normalize.css">
	<link rel="stylesheet" href="css/main.css">

	<script src="js/vendor/modernizr-2.6.2.min.js"></script>
	<style>
		body {
			padding:30px 0;
		}
		h1 {
			margin-bottom:0;
		}
		h2 {
			margin-top:0;
			font-size:.8em;
		}
		pre {
			font-size:.7em;
			line-height:1.2em;
		}
		.button {
			display:inline-block;
			background: #969696;
			background-image: -webkit-linear-gradient(top, #969696, #666666);
			background-image: linear-gradient(to bottom, #969696, #666666);
			-webkit-border-radius: 4;
			-moz-border-radius: 4;
			border-radius: 4px;
			text-shadow: 1px 1px 30px #666666;
			color: #fff7ff;
			padding: 10px 20px 10px 20px;
			margin:20px 0;
			border: solid #595959 1px;
			text-decoration: none;
		}

		.button:hover {
			background: #808080;
			background-image: -webkit-linear-gradient(top, #808080, #807c80);
			background-image: linear-gradient(to bottom, #808080, #807c80);
			text-decoration: none;
		}
	</style>
</head>

<body>
		<!--[if lt IE 7]>
			<p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
		<![endif]-->
		<div id='wrapper' class="con">
			<?php if (!isset($_GET['gkey'])): ?><h1>Google Sheets</h1><?php endif; ?>
		</div>
		<div class="con">
			<?php
			$gSheetData = unserialize(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/d-tools/g-sheets/json-output-js/1KP0n4oyc68_-0sCOylGvimPGgn90fj-WsGN5KwbQi2I.json"));
			print_r($gSheetData);
			echo htmlentities('<?php $gSheetData = unserialize(file_get_contents($_SERVER[\'DOCUMENT_ROOT\'] . "/d-tools/g-sheets/json-output-js/1KP0n4oyc68_-0sCOylGvimPGgn90fj-WsGN5KwbQi2I.json")) ?>'); ?>
		</div>

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="js/vendor/jquery-1.10.2.min.js"><\/script>');</script>
		<script src="js/main.js"></script>
		<script>
			var urlParams = getUrlParams() || false;
			if (urlParams.gkey) {
				var gSheetData = new SheetServe(urlParams.gkey);
				var myGSheetData = gSheetData;
				gSheetData.onload(function(){
					myGSheetData.toFileWriter(gSheetData, gSheetData.meta.config.key, function(d){
						var dataString = '<p><strong>Compiled JSON:</strong></p><pre>' + JSON.stringify(gSheetData, null, 2) + '</pre>';
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
		</script>
	</body>
</html>
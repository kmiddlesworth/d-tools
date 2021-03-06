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
	<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
</head>

<body>
		<!--[if lt IE 7]>
			<p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
		<![endif]-->
		<div id='wrapper' class="con">
			<?php

			if (!isset($_GET['gkey'])){ ?>
				<h1>Google Sheets</h1>
			<?php }

			$gSheetData = unserialize(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/d-tools/g-sheets/json-output-js/1KP0n4oyc68_-0sCOylGvimPGgn90fj-WsGN5KwbQi2I.json"));

			print_r($gSheetData);

			echo htmlentities('<?php $gSheetData = unserialize(file_get_contents($_SERVER[\'DOCUMENT_ROOT\'] . "/d-tools/g-sheets/json-output-js/1KP0n4oyc68_-0sCOylGvimPGgn90fj-WsGN5KwbQi2I.json")) ?>');

		?>
		</div>
		<div class="con">
			<div id='data-wrapper'></div>
		</div>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="js/vendor/jquery-1.10.2.min.js"><\/script>');</script>
		<script src="js/main.js"></script>
	</body>
</html>
<?php

if (!isset($_POST['input']) || $_POST['input'] == '') {
	die('Insufficient data');
}
$theKey = $_POST['key'];
echo '<h1>Google Sheet Data</h1><h2>Key: '.$theKey.'</h2>';
$phpArrayText = serialize(json_decode($_POST['input'], true));
file_put_contents('json-output-js/' . $_POST['key'] . '.json', json_decode($_POST['input']));

?>
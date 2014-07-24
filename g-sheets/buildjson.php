<?php

if (!isset($_POST['data']) || $_POST['data'] == '') {
	die('Insufficient data');
}
$theKey = $_POST['key'];

function isJson($string){
	json_decode($string);
	return (json_last_error() == JSON_ERROR_NONE);
}
if (isJson($_POST['data']) == 1) {
	$my_var = "true";
}

echo '<h1>Google Sheet Data</h1><h2>Key: '.$theKey.'</h2>'.$my_var.'<br/>';
$phpArrayText = serialize(json_decode($_POST['data'], true));
file_put_contents('json-output-js/' . $_POST['key'] . '.json', $_POST['data']);

?>
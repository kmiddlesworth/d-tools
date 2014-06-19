<? if (!isset($_POST['input']) || $_POST['input'] == '') die('Insufficient data');

echo '<h1>Google Sheet Data</h1><h2>Key: ' . $_POST['key'] . '</h2>';
    
//echo $_POST['input'];



$phpArrayText = serialize(json_decode($_POST['input'], true));

file_put_contents('json-output-js/' . $_POST['key'] . '.js', json_encode($_POST['input']));
file_put_contents('json-output-php/' . $_POST['key'] . '.php', $phpArrayText);


?>
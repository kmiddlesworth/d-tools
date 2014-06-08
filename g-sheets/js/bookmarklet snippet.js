javascript:var opOne = (window.location.href.indexOf('key=') != -1) ? 'key=' : '/d/'; 
var opTwo = (window.location.href.indexOf('key=') != -1) ? '&' : '/'; 
var toolUrl = 'http://localhost/d-tools/g-sheets/?gkey=';
var keyInUrl = window.location.href.split(opOne)[1].split(opTwo)[0];
window.open(toolUrl + keyInUrl, '_blank');
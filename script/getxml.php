<?
	header( 'Content-Type:text/xml; charset=utf-8'); 
	echo(file_get_contents('https://www.google.com/logos/logos.xml'));
?>
<?php

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

if (str_starts_with($path, '/api')) {
    return false;
}

$filePath = __DIR__ . $path;

if ($path !== '/index.php' && file_exists($filePath) && !is_dir($filePath)) {
    return false;
}

header('Content-Type: text/html');
readfile(__DIR__ . '/index.html');

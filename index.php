<?php

$root = __DIR__;
$dirs = scandir($root);

$versions = [];

foreach ($dirs as $dir) {
    if (preg_match('/^v(\d+)$/', $dir, $m)) {
        $versions[(int)$m[1]] = $dir;
    }
}

if (!$versions) {
    die('Нет версий сайта');
}

ksort($versions);
$latest = end($versions);

header("Location: /{$latest}/");
exit;

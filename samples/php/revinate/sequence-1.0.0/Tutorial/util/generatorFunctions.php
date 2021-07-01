<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 06/09/15
 * Time: 23:20
 */

namespace Revinate\Sequence\Tutorial\util;


/**
 * @description converts a file handle into an iterator that reads one line at a time.
 * @param $handle
 * @return \Generator
 */
function fileToIterator($handle) {
    try {
        while (! feof($handle)) {
            $line = fgets($handle);
            yield $line;
        }
    } finally {
        fclose($handle);
    }
}


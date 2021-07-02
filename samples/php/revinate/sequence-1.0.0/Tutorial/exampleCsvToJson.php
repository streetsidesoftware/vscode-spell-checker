<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 06/09/15
 * Time: 23:12
 */
namespace Revinate\Sequence\Tutorial;

require_once __DIR__.'/../vendor/autoload.php';

// Load generator functions
if (phpversion() >= '5.5') {
    require_once __DIR__.'/util/generatorFunctions.php';
}

use Revinate\Sequence\Sequence;
use Revinate\Sequence\func;
use Revinate\Sequence\Tutorial\util\StreamReaderIterator;
use Revinate\Sequence\Tutorial\util as tu;

function fnJsonWriter($hOutput) {
    $separator = '';
    return static function ($json) use ($hOutput, &$separator) {
        fwrite($hOutput, $separator . $json);
        $separator = ",\n";
    };
}

/**
 * @param \Closure $fnMap
 * @return \Closure
 */
function fnCallMapWithLastResult(\Closure $fnMap) {
    $lastResult = null;
    return static function ($value, $key) use (&$lastResult, $fnMap) {
        $lastResult = $fnMap($value, $key, $lastResult);
        return $lastResult;
    };
}

/**
 * @param resource $handle
 * @return StreamReaderIterator
 */
function convertFileStreamToIterator($handle) {
    if (phpversion() < '5.5') {
        return new StreamReaderIterator($handle);
    }
    else {
        return tu\fileToIterator($handle);
    }
}

/**
 * @param resource $handleInput
 * @param resource $handleOutputForJson
 */
function exampleCsvToJson($handleInput, $handleOutputForJson) {

    $streamIterator = convertFileStreamToIterator($handleInput);
    fwrite($handleOutputForJson, "[\n");

    Sequence::make($streamIterator)
        ->map(static function ($line) { return str_getcsv($line); })           // Parse the csv string into an array
        ->map(fnCallMapWithLastResult(static function($row, $key, $lastRow){
            if ($lastRow) {
                $keys = array_keys($lastRow);                           // Use the keys from the last row
            } else {
                $keys = $row;                                           // This is the first row, use it as the keys.
            }
            return array_combine($keys, $row);                          // Put them together and return.
        }))
        ->map(func\fnIdentity())                                          // Add this here so offset(1) doesn't eat headers before we have the chance to assign it to the keys.
        ->offset(1)                                                     // Skip the header row
        ->map(static function ($row) { return json_encode($row); })            // Convert it to json
        ->walk(fnJsonWriter($handleOutputForJson));

    fwrite($handleOutputForJson, ']');
}

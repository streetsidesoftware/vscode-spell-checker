<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/08/15
 * Time: 10:17
 */

namespace Revinate\Sequence\func;

use \ArrayAccess;
use \Closure;
use Revinate\Sequence\ArrayUtil;
use Revinate\Sequence\Sequence;
use Revinate\Sequence\func;
use Revinate\Sequence\FnSequence;
use Revinate\GetterSetter as gs;



/**
 * @param ArrayAccess|array $map
 * @param mixed $default -- default value to use if the value is not set in the map.
 * @return Closure
 */
function fnMap($map, $default = null) {
    return static function ($v) use ($map, $default) { return isset($map[$v]) ? $map[$v] : $default; };
}

/**
 * Generate a function that swaps the order of the first two parameters and calls $fn
 *
 * @param callable $fn
 * @return Closure
 */
function fnSwapParamsPassThrough($fn) {
    return static function ($a, $b) use ($fn) { return $fn($b, $a); };
}

/**
 * Generate a function that returns the key from a map call.
 *
 * @return Closure
 */
function fnKey() {
    /**
     * @param mixed            $v -- Value
     * @param string|int|mixed $k -- Key
     * @return mixed returns the key
     */
    return static function ($v, $k) { return $k; };
}

/**
 * Generate a function that combines the key and the value into a tuple.
 *
 * @return Closure
 */
function fnMapToKeyValuePair() {
    return static function ($v, $k) { return array($k, $v); };
}

/**
 * Alias of fnMapToKeyValuePair - to match underscore library.
 * @see fnMapToKeyValuePair
 * @return Closure
 */
function fnPair() {
    return fnMapToKeyValuePair();
}

/**
 * Generate a function that splits out the key from a [key, value] tuple
 * @return Closure
 */
function fnPairKey() {
    /**
     * @param mixed $v - Value
     * @return mixed returns the key portion of a [key, value] tuple
     */
    return static function ($v) { return $v[0]; };
}


/**
 * Generate a function that splits out the value from a [key, value] tuple
 * @return Closure
 */
function fnPairValue() {
    /**
     * @param mixed $v - Value
     * @return mixed returns the value portion of a [key, value] tuple
     */
    return static function ($v) { return $v[1]; };
}

/**
 * Generates a function that will apply a mapping function to a sub field of a record
 *
 * @param string $fieldName
 * @param callable $fnMap($fieldValue, $fieldName, $parentRecord, $parentKey)
 * @return Closure
 */
function fnMapField($fieldName, $fnMap) {
    return static function ($record, $key = null) use ($fieldName, $fnMap) {
        if ($record instanceof ArrayAccess || is_array($record)) {
            $fieldValue = isset($record[$fieldName]) ? $record[$fieldName] : null;
            $record[$fieldName] = $fnMap($fieldValue, $fieldName, $record, $key);
        } elseif (is_object($record) && property_exists($record, $fieldName)) {
            $record->{$fieldName} = $fnMap($record->{$fieldName}, $fieldName, $record, $key);
        }

        return $record;
    };
}

/**
 * Generates a function that will apply a mapping function to the record and write the result into a
 * field in the record.  The record can be an array or an object.
 *
 * The field name can be a path.
 *
 * Special case, a null record will result in: array($fieldName => $fnMap(null))
 *
 * @param string $fieldName -- field name or path
 * @param \Closure $fnMap($record, $key) -- the value returned from this function will be put into $record at $fieldName
 * @return Closure
 */
function fnMapToField($fieldName, $fnMap) {
    return static function ($record, $key = null) use ($fieldName, $fnMap) {
        return gs\set($record, $fieldName, $fnMap($record, $key));
    };
}

/**
 * Generates a function that pulls a value from a field in the document and passes it to $fnMap.
 *
 * @param string $fieldName
 * @param Closure $fnMap($fieldValue)
 * @return Closure
 */
function fnMapFromField($fieldName, $fnMap) {
    return func\fnPipe(func\fnPluck($fieldName), $fnMap);
}


/**
 * Generate a pluck function that returns the value of a field, or null if the field does not exist.
 *
 * @param string $key - the name / key, of the field to get the value from.
 * @param mixed $default - the default value to assign if the field does not exist.
 * @return Closure
 */
function fnPluck($key, $default = null) {
    return static function ($v) use ($key, $default) {
        return ArrayUtil::getField($v, $key, $default);
    };
}

/**
 * returns a function that given a key returns a value from $from.
 *
 * @param array|ArrayAccess $from
 * @param null|mixed $default
 * @return Closure
 */
function fnPluckFrom($from, $default = null) {
    return static function ($key) use ($from, $default) {
        return ArrayUtil::getField($from, $key, $default);
    };
}

/**
 * Generate a pluck function that returns the result after calling getter function, or $default if getter does not exist
 * Gets any number of $getterParamX parameters -- all those will be passed to getter function
 * @param string $getterName
 * @param mixed|null $default
 * @param mixed|null $getterParam1
 * @param mixed|null $getterParam2
 * @return Closure
 * @deprecated Please use GetterSetter or react/partial
 */
function fnCallGetter($getterName, $default = null, $getterParam1 = null, $getterParam2 = null) {
    $args = func_get_args();
    array_splice($args, 0, 2);
    return static function ($v) use ($getterName, $default, $args) {
        if (method_exists($v, $getterName)) {
            return call_user_func_array(array($v, $getterName), $args);
        } else {
            return $default;
        }
    };
}

/**
 * Generate a function that returns the value given.
 *
 * @return Closure
 */
function fnIdentity() {
    return static function ($v) { return $v; };
}

/**
 * @description Generate a function that will return the result of calling count()
 *
 * @return Closure
 */
function fnCount() {
    return static function ($v) { return count($v); };
}

/**
 * Generate a function that returns a counter.
 *
 * @param int $startingValue
 * @return Closure
 */
function fnCounter($startingValue = 0) {
    $count = $startingValue;
    return static function () use (&$count) { return $count++; };
}

/**
 * Returns a function that applies a function to a nested array and returns the results.
 *
 * @return Closure
 */
function fnNestedSort() {
    return static function ($array) {
        return Sequence::make($array)->sort()->to_a();
    };
}

/**
 * Returns a function that applies a function to a nested array and returns the results.
 *
 * @param $fn
 * @return Closure
 */
function fnNestedMap($fn) {
    return FnSequence::make()->map($fn)->to_a();
}

/**
 * Returns a function that applies a function to a nested array and returns the results.
 *
 * @param $fn
 * @return Closure
 */
function fnNestedUKeyBy($fn) {
    return static function ($array) use ($fn) {
        return Sequence::make($array)->keyBy($fn)->to_a();
    };
}

/**
 * Returns a map function that will allow different map functions to be called based upon the result of a test function.
 *
 * @param callable $fnTest($value, $key)        -- the test function
 * @param callable $fnMapTrue($value, $key)     -- the map function to use if the test is true
 * @param callable $fnMapFalse($value, $key)    -- the map function to use if the test is false
 * @return Closure
 */
function fnIfMap($fnTest, $fnMapTrue, $fnMapFalse = null) {
    if (is_null($fnMapFalse)) {
        $fnMapFalse = fnIdentity();
    }

    return static function ($value, $key) use ($fnTest, $fnMapTrue, $fnMapFalse) {
        if ($fnTest($value, $key)) {
            return $fnMapTrue($value, $key);
        } else {
            return $fnMapFalse($value, $key);
        }
    };
}

/**
 * Create a function that will cache the results of another function based upon the
 *
 * @param callable $fnMap($value,...) - any invariant map function
 * @param callable|null $fnHash  - Converts the arguments into a hash value
 * @return Closure
 */
function fnCacheResult($fnMap, $fnHash = null) {
    $fnHash = $fnHash ?: fnIdentity();
    $cache = array();
    return static function($value) use ($fnMap, $fnHash, &$cache) {
        $args = func_get_args();
        $hashKey = call_user_func_array($fnHash, $args);
        if (! array_key_exists($hashKey, $cache)) {
            $cache[$hashKey] = call_user_func_array($fnMap, $args);
        }

        return $cache[$hashKey];
    };
}

/**
 * Generates a function that always returns true
 *
 * @return Closure
 */
function fnTrue() {
    return static function () { return true; };
}

/**
 * Generates a function that always returns false
 *
 * @return Closure
 */
function fnFalse() {
    return static function () { return false; };
}

/**
 * Generate a function that always returns $const
 *
 * @param mixed $const
 * @return Closure
 */
function fnConst($const) {
    return static function () use ($const) { return $const; };
}

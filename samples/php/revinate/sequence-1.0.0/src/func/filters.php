<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/08/15
 * Time: 10:18
 */

namespace Revinate\Sequence\func;

use \ArrayAccess;

/**
 * @return \Closure
 */
function fnIsNotEmpty() {
    return static function ($v) { return ! empty($v); };
}

/**
 * @return \Closure
 */
function fnIsSet() {
    return static function ($v) { return isset($v); };
}

/**
 * Alias for fnKeepIsSet
 *
 * Usage Sequence::make($values)->filter(FnGen::clean())->to_a();
 *
 * @return \Closure
 */
function fnClean() {
    return fnIsNotEmpty();
}

/**
 * @return \Closure
 */
function fnIsEmpty() {
    return static function ($v) { return empty($v); };
}

/**
 * Generates a function that returns true if $map has a key that matches the value.
 *
 * @param array|ArrayAccess $map
 * @return \Closure
 */
function fnIsInMap($map) {
    if (is_array($map)) {
        return static function ($v) use ($map) { return array_key_exists($v, $map); };
    } else if (class_implements($map, 'ArrayAccess')) {
        return static function ($v) use ($map) { return $map->offsetExists($v); };
    }
    // just use isset
    return static function ($v) use ($map) { return isset($map[$v]); };
}

/**
 * Generates a function that returns false if $map has a key that matches the value.
 *
 * @param array|ArrayAccess $map
 * @return \Closure
 */
function fnIsNotInMap($map) {
    $fnInMap = fnIsInMap($map);
    return static function ($v) use ($fnInMap) { return ! $fnInMap($v); };
}

/**
 * Generates a function that returns true if a value is equal
 *
 * @param $value
 * @return \Closure
 */
function fnIsEqual($value) {
    return static function ($v) use ($value) { return $value == $v; };
}

/**
 * Generates a function that returns true if a value is equal
 *
 * @param $value
 * @return \Closure
 */
function fnIsEqualEqual($value) {
    return static function ($v) use ($value) { return $value === $v; };
}

/**
 * Generates a function that returns true if a value is not equal
 *
 * @param $value
 * @return \Closure
 */
function fnIsNotEqual($value) {
    return static function ($v) use ($value) { return $value != $v; };
}


/**
 * Generates a function that returns true if a value is not equal
 *
 * @param $value
 * @return \Closure
 */
function fnIsNotEqualEqual($value) {
    return static function ($v) use ($value) { return $value !== $v; };
}


/**
 * Generates a function that returns true if a value is numeric
 *
 * @return \Closure
 */
function fnIsNumeric() {
    return static function ($v) { return is_numeric($v); };
}

/**
 * @param $array
 * @return \Closure
 */
function fnIsInArray($array) {
    return static function ($v) use ($array) { return in_array($v, $array); };
}

/**
 * @param $array
 * @return \Closure
 */
function fnIsNotInArray($array) {
    return static function ($v) use ($array) { return ! in_array($v, $array); };
}

/**
 * Generate a function that returns true if an object implements an interface
 *
 * @param $interface
 * @return \Closure
 */
function fnImplements($interface) {
    return static function ($v) use ($interface) { return class_implements($v, $interface); };
}

/**
 * @param $className
 * @return \Closure
 */
function fnInstanceOf($className) {
    return static function ($v) use ($className) { return $v instanceof $className; };
}

/**
 * Generate a function that returns true if a value is an object
 *
 * @return \Closure
 */
function fnIsObject() {
    return static function ($v) { return is_object($v); };
}


/**
 * Generate a function that returns the NOT of the passed in value.
 *
 * @param callable|null $fn($value) -- optional function to call on the value before notting the returned result
 *
 * @return \Closure
 */
function fnNot($fn = null) {
    if ($fn) {
        return static function ($v) use ($fn) { return ! $fn($v); };
    }
    return static function ($v) { return ! $v; };
}


/**
 * Generate a function that returns true if preg_match of the passed value succeeds against specified pattern.
 * @param string $pattern same as for preg_match
 * @return \Closure
 * @deprecated
 */
function fnMatch($pattern) {
    return fnPregMatch($pattern);
}

/**
 * Generate a function that returns true if preg_match of the passed value succeeds against specified pattern.
 * @param string $pattern same as for preg_match
 * @return \Closure
 */
function fnPregMatch($pattern) {
    return static function($v) use ($pattern) {
        return preg_match($pattern, $v) ? true : false;
    };
}

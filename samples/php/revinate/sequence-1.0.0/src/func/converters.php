<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/08/15
 * Time: 10:19
 */

namespace Revinate\Sequence\func;


/**
 * Returns a function that will cast a value to an int
 * @return \Closure
 */
function fnCastToInt() {
    return static function ($value) { return (int)$value; };
}

/**
 * Returns a function that will cast a value to an float
 * @return \Closure
 */
function fnCastToFloat() {
    return static function ($value) { return (float)$value; };
}

/**
 * Returns a function that will cast a value to an double
 * @return \Closure
 */
function fnCastToDouble() {
    return static function ($value) { return (double)$value; };
}

/**
 * Returns a function that will cast a value to an string
 * @return \Closure
 */
function fnCastToString() {
    return static function ($value) { return (string)$value; };
}

/**
 * Returns a function that will cast a value to an array
 * @return \Closure
 */
function fnCastToArray() {
    return static function ($value) { return (array)$value; };
}

/**
 * Returns a function that will cast a value to an object
 * @return \Closure
 */
function fnCastToObject() {
    return static function ($value) { return (object)$value; };
}

/**
 * Returns a function that will cast a value to a boolean
 * @return \Closure
 */
function fnCastToBool() {
    return static function ($value) { return (bool)$value; };
}

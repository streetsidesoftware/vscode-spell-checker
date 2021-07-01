<?php

namespace Revinate\Sequence;

use Revinate\Sequence\func;
use \ArrayAccess;

/**
 * Class FnGen
 * @author jasondent
 * @package Revinate\Sequence
 */
class FnGen {
    /**
     * @return callable
     */
    public static function fnKeepNotEmpty() {
        return func\fnIsNotEmpty();
    }

    /**
     * @return callable
     */
    public static function fnKeepIsSet() {
        return func\fnIsSet();
    }

    /**
     * Alias for fnKeepIsSet
     *
     * Usage Sequence::make($values)->filter(FnGen::clean())->to_a();
     *
     * @return callable
     */
    public static function fnClean() {
        return func\fnClean();
    }

    /**
     * @return callable
     */
    public static function fnIsEmpty() {
        return func\fnIsEmpty();
    }

    /**
     * Generates a function that returns true if $map has a key that matches the value.
     *
     * @param array|ArrayAccess $map
     * @return callable
     */
    public static function fnKeepInMap($map) {
        return func\fnIsInMap($map);
    }

    /**
     * Generates a function that returns false if $map has a key that matches the value.
     *
     * @param array|ArrayAccess $map
     * @return callable
     */
    public static function fnKeepNotInMap($map) {
        return func\fnIsNotInMap($map);
    }

    /**
     * Generates a function that returns true if a value is equal
     *
     * @param $value
     * @return callable
     */
    public static function fnIsEqual($value) {
        return func\fnIsEqual($value);
    }

    /**
     * Generates a function that returns true if a value is equal
     *
     * @param $value
     * @return callable
     */
    public static function fnIsEqualEqual($value) {
        return func\fnIsEqualEqual($value);
    }

    /**
     * Generates a function that returns true if a value is not equal
     *
     * @param $value
     * @return callable
     */
    public static function fnIsNotEqual($value) {
        return func\fnIsNotEqual($value);
    }


    /**
     * Generates a function that returns true if a value is not equal
     *
     * @param $value
     * @return callable
     */
    public static function fnIsNotEqualEqual($value) {
        return func\fnIsNotEqualEqual($value);
    }


    /**
     * Generates a function that returns true if a value is numeric
     *
     * @return callable
     */
    public static function fnIsNumeric() {
        return func\fnIsNumeric();
    }

    /** Returns a function that trims the value.
     *
     * @return callable
     */
    public static function fnTrim() {
        return func\fnTrim();
    }

    /**
     * Generates a function that always returns true
     *
     * @return callable
     */
    public static function fnTrue() {
        return func\fnTrue();
    }

    /**
     * Generates a function that always returns false
     *
     * @return callable
     */
    public static function fnFalse() {
        return func\fnFalse();
    }

    /**
     * @param $array
     * @return callable
     */
    public static function fnKeepInArray($array) {
        return func\fnIsInArray($array);
    }

    /**
     * @param $array
     * @return callable
     */
    public static function fnKeepNotInArray($array) {
        return func\fnIsNotInArray($array);
    }

    /**
     * Generate a function that returns true if an object implements an interface
     *
     * @param $className
     * @return callable
     */
    public static function fnKeepImplements($className) {
        return func\fnImplements($className);
    }

    /**
     * Generate a function that returns true if a value is an object
     *
     * @return callable
     */
    public static function fnKeepIfIsObject() {
        return func\fnIsObject();
    }

    /**
     * @param ArrayAccess|array $map
     * @return callable
     */
    public static function fnMap($map) {
        return func\fnMap($map);
    }

    /**
     * Generate a function that casts values to integers.
     * @return callable
     */
    public static function fnCastToInt() {
        return func\fnCastToInt();
    }

    /**
     * Generate a function that swaps the order of the parameters and calls $fn
     *
     * @param callable $fn
     * @return callable
     */
    public static function fnSwapParamsPassThrough($fn) {
        return func\fnSwapParamsPassThrough($fn);
    }

    /**
     * Generate a function that returns the key from a map call.
     *
     * @return callable
     */
    public static function fnMapToKey() {
        return func\fnKey();
    }

    /**
     * Generate a function that combines the key and the value into a tuple.
     *
     * @return callable
     */
    public static function fnMapToKeyValuePair() {
        return func\fnMapToKeyValuePair();
    }


    /**
     * Generates a function that will apply a mapping function to a sub field of a record
     *
     * @param string $fieldName
     * @param callable $fnMap($fieldValue, $fieldName, $parentRecord, $parentKey)
     * @return callable
     */
    public static function fnMapField($fieldName, $fnMap) {
        return func\fnMapField($fieldName, $fnMap);
    }


    /**
     * Generate a pluck function that returns the value of a field, or null if the field does not exist.
     *
     * @param string $key - the name / key, of the field to get the value from.
     * @param mixed $default - the default value to assign if the field does not exist.
     * @return callable
     */
    public static function fnPluck($key, $default = null) {
        return func\fnPluck($key, $default);
    }

    /**
     * returns a function that given a key returns a value from $from.
     *
     * @param array|ArrayAccess $from
     * @param null|mixed $default
     * @return callable
     */
    public static function fnPluckFrom($from, $default = null) {
        return func\fnPluckFrom($from, $default);
    }

    /**
     * Generate a function that returns the value given.
     *
     * @return callable
     */
    public static function fnIdentity() {
        return func\fnIdentity();
    }

    /**
     * @description Generate a function that will return the result of calling count()
     *
     * @return callable
     */
    public static function fnCount() {
        return func\fnCount();
    }

    /**
     * Generate a function that returns a counter.
     *
     * @param int $startingValue
     * @return callable
     */
    public static function fnCounter($startingValue = 0) {
        return func\fnCounter($startingValue);
    }

    /**
     * Generate a function that when called, will call a set of functions passing the result as input to the next function.
     *
     * @param Callable[]|Callable $fn
     * @return callable
     */
    public static function fnCallChain($fn) {
        return call_user_func_array('\Revinate\Sequence\func\fnPipe', func_get_args());
    }

    /**
     * Generate a function that will return the specified parameter
     *
     * @param int $num
     * @return callable
     */
    public static function fnParam($num) {
        return call_user_func_array('\Revinate\Sequence\func\fnParam', func_get_args());
    }

    /**
     * Returns a function that applies a function to a nested array and returns the results.
     *
     * @return callable
     */
    public static function fnNestedSort() {
        return func\fnNestedSort();
    }

    /**
     * Returns a function that applies a function to a nested array and returns the results.
     *
     * @param $fn
     * @return callable
     */
    public static function fnNestedMap($fn) {
        return func\fnNestedMap($fn);
    }

    /**
     * Returns a function that applies a function to a nested array and returns the results.
     *
     * @param $fn
     * @return callable
     */
    public static function fnNestedUKeyBy($fn) {
        return func\fnNestedUKeyBy($fn);
    }

    /**
     * Returns a function that removes a suffix from a string if it exists
     *
     * @param   string  $suffix
     * @return  callable
     * @deprecated use FnString::fnRemoveSuffix
     */
    public static function fnRemoveSuffix($suffix) {
        return func\fnRemoveSuffix($suffix);
    }

    /**
     * Returns a function that removes a prefix from a string if it exists
     *
     * @param   string  $prefix
     * @return  callable
     * @deprecated  use FnString::fnRemovePrefix
     */
    public static function fnRemovePrefix($prefix) {
        return func\fnRemoveSuffix($prefix);
    }


    /********************************************************************************
     * Reduce functions
     * have been moved to FnReduce
     */


    /**
     * Used in Sequence::Reduce to sum all values.
     *
     * @param callable $fnMapValue [optional] - a function to get the needed value
     * @return callable
     * @deprecated
     *
     * @example:
     * Get the total number of fruit.
     * Sequence::make([['count'=>5, 'name'=>'apple'], ['count'=>2, 'name'=>'orange']])->reduce(FnGen::fnSum(FnGen::fnPluck('count'))
     */
    public static function fnSum($fnMapValue = null) {
        return func\fnSum($fnMapValue);
    }

    /**
     * @description Generate a function that can be used with reduce to get the max value
     * @return callable
     * @deprecated
     */
    public static function fnMax() {
        return func\fnMax();
    }

    /**
     * @description Generate a function that can be used with reduce to get the min value
     * @return callable
     * @deprecated
     */
    public static function fnMin() {
        return func\fnMin();
    }

    /**
     * Generate a function that will:
     * Calculate the average of a set of values.  Null values are skipped.
     *
     * @param callable $fnMapValue [optional] - maps the value before it is computed.
     * @return callable
     * @deprecated
     */
    public static function fnAvg($fnMapValue = null) {
        return func\fnAvg($fnMapValue);
    }

    /**
     * @description Alias for fnSum -- usage is to do a union between arrays.
     * @return callable
     * @deprecated
     */
    public static function fnUnion() {
        return func\fnUnion();
    }

    /**
     * Generate a function that will:
     *
     * @param callable $fnReduce(mixed, $value)
     * @return callable
     */
    public static function fnReduce($fnReduce) {
        return $fnReduce($fnReduce);
    }

    /**
     * Returns a map function that will allow different map functions to be called based upon the result of a test function.
     *
     * @param callable $fnTest($value, $key)        -- the test function
     * @param callable $fnMapTrue($value, $key)     -- the map function to use if the test is true
     * @param callable $fnMapFalse($value, $key)    -- the map function to use if the test is false
     * @return callable
     */
    public static function fnIfMap($fnTest, $fnMapTrue, $fnMapFalse = null) {
        return func\fnIfMap($fnTest, $fnMapTrue, $fnMapFalse);
    }

    /**
     * Create a function that will cache the results of another function based upon the
     *
     * @param callable $fnMap($value,...) - any invariant map function
     * @param callable|null $fnHash  - Converts the arguments into a hash value
     * @return callable
     */
    public static function fnCacheResult($fnMap, $fnHash = null) {
        return func\fnCacheResult($fnMap, $fnHash);
    }
}

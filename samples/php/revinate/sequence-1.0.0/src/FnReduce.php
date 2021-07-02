<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 23/07/2015
 * Time: 20:51
 */

namespace Revinate\Sequence;

use Revinate\Sequence\func;
use \Closure;

class FnReduce {
    /**
     * Used in Sequence::Reduce to sum all values.
     *
     * @param Closure $fnMapValue [optional] - a function to get the needed value
     * @return callable
     *
     * @example:
     * Get the total number of fruit.
     * Sequence::make([['count'=>5, 'name'=>'apple'], ['count'=>2, 'name'=>'orange']])->reduce(FnGen::fnSum(FnGen::fnPluck('count'))
     */
    public static function fnSum(Closure $fnMapValue = null) {
        return func\fnSum($fnMapValue);
    }

    /**
     * @description Generate a function that can be used with reduce to get the max value
     * @return callable
     */
    public static function fnMax() {
        return func\fnMax();
    }

    /**
     * @description Generate a function that can be used with reduce to get the min value
     * @return callable
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
     */
    public static function fnAvg(Closure $fnMapValue = null) {
        return func\fnAvg($fnMapValue);
    }

    /**
     * @description Alias for fnSum -- usage is to do a union between arrays.
     * @return callable
     */
    public static function fnUnion() {
        return func\fnUnion();
    }
}

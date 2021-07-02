<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/06/15
 * Time: 15:35
 */

namespace Revinate\Sequence;

use Revinate\Sequence\func;

class FnString {
    /**
     * Returns a function that trims the value.
     *
     * @return callable
     */
    public static function fnTrim() {
        return func\fnTrim();
    }

    /**
     * Returns a function that removes a suffix from a string if it exists
     *
     * @param   string  $suffix
     * @return  callable
     */
    public static function fnRemoveSuffix($suffix) {
        return func\fnRemoveSuffix($suffix);
    }

    /**
     * Returns a function that removes a prefix from a string if it exists
     *
     * @param   string  $prefix
     * @return  callable
     */
    public static function fnRemovePrefix($prefix) {
        return func\fnRemovePrefix($prefix);
    }

    /**
     * Returns a function that prefixes a string
     *
     * @param $prefix
     * @return callable
     */
    public static function fnAddPrefix($prefix) {
        return func\fnAddPrefix($prefix);
    }

    /**
     * Returns a function that postfixes a string
     *
     * @param $postfix
     * @return callable
     */
    public static function fnAddPostfix($postfix) {
        return func\fnAddPostfix($postfix);
    }

    /**
     * @param string|null $encoding
     * @return \Closure
     */
    public static function fnToUpper($encoding = null) {
        return func\fnToUpper($encoding);
    }

    /**
     * @param string|null $encoding
     * @return \Closure
     */
    public static function fnToLower($encoding = null) {
        return func\fnToLower($encoding);
    }
}

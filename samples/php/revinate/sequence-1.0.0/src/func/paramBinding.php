<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 30/08/15
 * Time: 15:42
 */

namespace Revinate\Sequence\func;
use \Closure;

/**
 * Generate a function that when called, will call a set of functions passing the result as input to the next function.
 * Alias for fnPipe.
 *
 * @param callable[]|callable $fn
 * @return Closure
 */
function fnCallChain($fn) {
    return call_user_func_array('\Revinate\Sequence\func\fnPipe', func_get_args());
}

/**
 * Generate a function that when called, will call a set of functions passing the result as input to the next function.
 *
 * @param callable[]|callable $fn
 * @return Closure
 */
function fnPipe($fn) {
    if (is_array($fn) && ! is_callable($fn)) {
        $args = $fn;
    } else {
        $args = func_get_args();
    }
    return static function ($v) use ($args) {
        $fn = array_shift($args);
        $v = call_user_func_array($fn, func_get_args());
        foreach ($args as $fn) {
            $v = $fn($v);
        }
        return $v;
    };
}

/**
 * Generate a function that will return the specified parameter
 *
 * @param int $num
 * @return Closure
 */
function fnParam($num) {
    return static function () use ($num) {
        $args = func_get_args();
        return isset($args[$num]) ? $args[$num] : null;
    };
}


<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 26/07/2015
 * Time: 17:07
 */

namespace Revinate\Sequence;

use \React\Partial\Placeholder;
use \React\Partial;

class FnBind {

    /**
     * @param callable $callable
     * @param string[] $paramMap
     * @return \Closure
     */
    public static function fnBindFieldsToParams($callable, $paramMap) {
        return static function ($record) use ($callable, $paramMap) {
            $params = Sequence::make($paramMap)->map(FnGen::fnPluckFrom($record))->to_a();
            return call_user_func_array($callable, $params);
        };
    }

    /**
     * @return callable
     */
    public static function fnBind(/*$fn, $args...*/)
    {
        return call_user_func_array('React\Partial\bind', func_get_args());
    }

    /**
     * @return callable
     */
    public static function fnBindRight(/*$fn, $args...*/)
    {
        return call_user_func_array('React\Partial\bind_right', func_get_args());
    }

    /**
     * @return Placeholder
     */
    public static function ph() {
        return Placeholder::create();
    }

}

<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 23/07/2015
 * Time: 16:41
 */

namespace Revinate\Sequence;

use Revinate\Sequence\func;

/**
 * Class FnMap
 * @package Revinate\Sequence
 * @description This is a static wrapper class for backwards compatibility
 */
class FnMap {

    public static function fnCastToInt() {
        return func\fnCastToInt();
    }

    public static function fnCastToFloat() {
        return func\fnCastToFloat();
    }

    public static function fnCastToDouble() {
        return func\fnCastToDouble();
    }

    public static function fnCastToString() {
        return func\fnCastToString();
    }

    public static function fnCastToArray() {
        return func\fnCastToArray();
    }

    public static function fnCastToObject() {
        return func\fnCastToObject();
    }

}

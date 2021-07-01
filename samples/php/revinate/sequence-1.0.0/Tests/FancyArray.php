<?php
/**
 * From: http://justafewlines.com/2009/10/whats-wrong-with-php-closures/
 */

namespace Revinate\Sequence\Test;

class FancyArray extends \ArrayObject
{

    public function __construct($obj = array()) {
        //else proceed normally, as though this special constructor didn't exist at all
        parent::__construct($obj);
    }

    public static function make($source = null) {
        if (is_null($source)) {
            return new self;
        }
        if (is_array($source)) {
            return new self($source);
        }
        if (is_a($source, __CLASS__)) {
            return new self($source);
        }
        if (is_a($source, 'ArrayObject')) {
            return new self($source);
        }

        return new self(func_get_args());
    }

    public static function intcmp($a, $b) {
        if ((float)$a == (float)$b) {
            return 0;
        }
        if ((float)$a > (float)$b) {
            return 1;
        }
        if ((float)$a < (float)$b) {
            return -1;
        }
    }

    /**
     * Returns a true array of this FancyArray.  In theory, I think usage of this function should be minimized, since this class supports native array operations. Also type-hinting should be duck-typed to the interfaces as used in a function, not the class Array. --Alex
     * @return array
     */
    public function to_a() { return (array)$this; }

    public function keys() { return new self(array_keys((array)$this)); }

    public function values() { return new self(array_values((array)$this)); }

    public function intersect($arr) {
        return new self(array_intersect(array_values((array)$this), $arr));
    }

    public function get($key, $default = null) { return array_key_exists($key, (array)$this) ? $this[$key] : $default; }

    public function has($value) { return in_array($value, (array)$this); }

    public function get_key($value) { return array_search($value, (array)$this); }

    public function get_all_keys($value) { return array_keys((array)$this, $value); }

    public function has_key($key) { return array_key_exists($key, (array)$this); }

    public function has_key_value($key, $value) {
        return array_key_exists($key, (array)$this) && $this[$key] == $value;
    }

    public function slice($offset, $length = null, $preserve_keys = false) {
        return new self(array_slice((array)$this, $offset, $length, $preserve_keys));
    }

    public function chunk($size, $preserve_keys = false) {
        $chunks = array_chunk((array)$this, $size, $preserve_keys);

        foreach ($chunks as &$chunk) {
            $chunk = new self($chunk);
        }

        return $chunks;
    }

    /**
     * A convenient version of what is perhaps the most common use-case for map: extracting a list of array indices.
     *
     * @param string $key the index key
     * @return FancyArray the array[$key] for each element
     */
    public function pluck($key) {
        $r = new self();
        foreach ($this as $k => $v) {
            $r[$k] = isset ($v[$key]) ? $v[$key] : null;
        }
        return $r;
    }

    /**
     * this method removes every "falsy" value: undefined, null, 0, false, NaN and ''):
     * @return FancyArray
     */
    public function clean() {
        $r = new self();
        foreach ($this as $k => $v) {
            if ($v) {
                $r[$k] = $v;
            }
        }
        return $r;
    }

    /**
     * A convenient version of what is perhaps the most common use-case for map: extracting a list of property values.
     *
     * @param string $propertyName the object property name
     * @returns array   the $object->$propertyName for each element
     */
    public function pluckPropertyName($propertyName) {
        $r = new self();
        foreach ($this as $k => $v) {
            $r[$k] = $v->$propertyName;
        }
        return $r;
    }


    /**
     * Wrapper for array_merge($this, $array)
     * @param $array
     * @return self
     */
    public function merge($array = null) {
        return new self(array_merge((array)$this, (array)$array));
    }

    /**
     * Wrapper for array_merge($array, $this) - reversed arguments
     * @param self $array
     * @return self
     */
    public function merge_into(self $array = null) {
        return new self(array_merge((array)$array, (array)$this));
    }

    public function implode($glue) {
        return implode($glue, (array)$this);
    }

    public function flatten() {
        $res = self::make();
        foreach ($this as $elem) {
            if (is_array($elem)) {
                $res = $res->merge(self::make($elem)->flatten());
            } elseif (is_a($elem, __CLASS__)) {
                $res = $res->merge($elem->flatten());
            } else {
                $res[] = $elem;
            }
        }
        return $res;
    }

    public function is_empty() {
        $arr = $this->to_a();
        return empty($arr);
    }

    public function flatten_once() {
        $res = self::make();
        foreach ($this as $elem) {
            if (is_array($elem)) {
                $res = $res->merge(self::make($elem));
            } else {
                $res[] = $elem;
            }
        }
        return $res;
    }

    public function unique($func = null) {
        if (is_null($func)) {
            return self::make(array_unique((array)$this));
        }

        $r = new self();
        foreach ($this as $val) {
            if ($func instanceof \Closure) {
                $r[$func($val)] = $val;
            } else {
                $r[call_user_func($func, $val)] = $val;
            }
        }
        return $r->values();
    }

    public function unique_preserve_order($func = null) {
        return $this->unique($func)->ksort();
    }

    /**
     * @return FancyArray
     */
    public function arsort() {
        $arr = $this->to_a();
        arsort($arr);
        return new self($arr);
    }

    /**
     * @param $glue the separator
     * @return string
     */
    public function join($glue) {
        return join($glue, $this->to_a());
    }

    /**
     * @return FancyArray
     */
    public function ksort() {
        $arr = $this->to_a();
        ksort($arr);
        return new self($arr);
    }

    /**
     * @return FancyArray
     */
    public function usort($func) {
        $arr = $this->to_a();
        usort($arr, $func);
        return new self($arr);
    }

    /**
     * @return FancyArray
     */
    public function uksort($func) {
        $arr = $this->to_a();
        uksort($arr, $func);
        return new self($arr);
    }

    /**
     * @return FancyArray
     */
    public function asort() {
        $arr = $this->to_a();
        asort($arr);
        return new self($arr);
    }

    /**
     * @return FancyArray
     */
    public function sort() {
        $arr = $this->to_a();
        sort($arr);
        return new self($arr);
    }

    /**
     * @return FancyArray
     */
    public function reverse() {
        $arr = $this->to_a();
        $arr = array_reverse($arr);
        return new self($arr);
    }

    /**
     * @return FancyArray
     */
    public function uasort($func) {
        $arr = $this->to_a();
        uasort($arr, $func);
        return new self($arr);
    }

    public function key_by($rekey_by) {
        $rekeyed_data = array();
        foreach ($this->to_a() as $index => $data) {
            if (isset($data[$rekey_by])) {
                $rekeyed_data[$data[$rekey_by]] = $data;
            }
        }
        return new self($rekeyed_data);
    }

    public function ukey_by($func) {
        $reKeyedData = array();
        foreach ($this->to_a() as $index => $data) {
            $reKeyedData[$func($data, $index)] = $data;
        }
        return new self($reKeyedData);
    }

    /**
     * @param $func
     * @return float
     */
    public function average($func) {
        $sum = array_sum($this->map($func)->to_a());
        return $sum / $this->count();
    }

    /**
     * sort the array by the given key in asc order
     * note - only works for scalar values. nested arrays will not be sorted.
     *
     * @param array $keys
     * @return FancyArray
     */
    public function sort_by_key($key) {
        return $this->usort(static function ($a, $b) use ($key) {
            return $a[$key] > $b[$key] ? 1 : -1;
        });
    }

    /**
     * @param $func
     * @return FancyArray
     */
    public function walk($func) {
        foreach ($this as $k => &$v) {
            $func($v, $k);
        }
        return $this;
    }

    public function map($func) {
        $r = new self();
        foreach ($this as $k => $v) {
            $r[$k] = call_user_func($func, $v, $k);
        }
        return $r;
    }


    public static function identity($x) { return $x; }

    /**
     * get the standard deviation of the given list
     *
     * @param float[]|int[]
     * @return float
     */
    public function getStandardDeviation() {
        $array = $this->to_a();
        return sqrt(
            array_sum(
                array_map(
                    static function ($x, $mean) {
                        return pow($x - $mean, 2);
                    }, $array,
                    array_fill(0, count($array),
                        (array_sum($array) / count($array))))) / (count($array) - 1));
    }

    /**
     * @return float    the math average
     */
    public function getAverage() {
        $array = $this->to_a();
        return array_sum($array) / count($array);
    }

    /**
     *
     * identity added by alex. Thus default filter() removes all falsey values.
     * @param $func
     * @return FancyArray
     */
    public function filter($func = 'FancyArray::identity') {
        $r = new self();
        foreach ($this as $k => $v) {
            if (call_user_func($func, $v, $k)) {
                $r[$k] = $v;
            }
        }
        return $r;
    }

    public function reduce($init, $func) {
        $r = $init;
        foreach ($this as $k => $v) {
            $r = $func($v, $r);
        }
        return $r;
    }

    public function reduce2($init, $func) {
        $r = $init;
        foreach ($this as $k => $v) {
            $r = $func($r, $v, $k);
        }
        return $r;
    }  // This version better matches other libraries.

    public function first($func) {
        foreach ($this as $k => $v) {
            if ($func($v)) {
                return $v;
            }
        }
        return null;
    }

    public function first_key($func) {
        foreach ($this as $k => $v) {
            if ($func($v)) {
                return $k;
            }
        }
        return null;
    }

    public function for_any($func = 'FancyArray::identity') {
        foreach ($this as $k => $v) {
            if (call_user_func($func, $v)) {
                return true;
            }
        }
        return false;
    }

    public function for_all($func = 'FancyArray::identity') {
        foreach ($this as $k => $v) {
            if (! call_user_func($func, $v)) {
                return false;
            }
        }
        return true;
    }

    public function walk_k($func) {
        foreach ($this as $k => &$v) {
            $func($k, $v);
        }
        return $this;
    }

    /**
     * @return FancyArray
     */
    public function map_k($func) {
        $r = new self();
        foreach ($this as $k => $v) {
            $r[$func($k)] = $v;
        }
        return $r;
    }

    public function first_element() {
        $arr = $this->to_a();
        return reset($arr);
    }

    public function last_element() {
        $arr = $this->to_a();
        return end($arr);
    }

    public function diff($arr) {
        return new self(array_diff($this->to_a(), $arr));
    }

    public function map_k_and_v($func) {
        $r = new self();
        foreach ($this as $k => $v) {
            list($key, $val) = $func($k, $v);
            $r[$key] = $val;
        }
        return $r;
    }

    public function fill_keys($func = 'FancyArray::identity') {
        $r = new self();
        foreach ($this as $v) {
            $r[call_user_func($func, $v)] = $v;
        }
        return $r;
    }

    public function fill_values($func) {
        $r = new self();
        foreach ($this as $k) {
            $r[$k] = $func($k);
        }
        return $r;
    }

    public function filter_k($func) {
        $r = new self();
        foreach ($this as $k => $v) {
            if ($func($k, $v)) {
                $r[$k] = $v;
            }
        }
        return $r;
    }

    public function reduce_k($init, $func) {
        $r = $init;
        foreach ($this as $k => $v) {
            $r = $func($k, $v, $r);
        }
        return $r;
    }

    public function first_k($func) {
        foreach ($this as $k => $v) {
            if ($func($k, $v)) {
                return $v;
            }
        }
        return null;
    }

    public function first_key_k($func) {
        foreach ($this as $k => $v) {
            if ($func($k, $v)) {
                return $k;
            }
        }
        return null;
    }

    public function for_any_k($func) {
        foreach ($this as $k => $v) {
            if ($func($k, $v)) {
                return true;
            }
        }
        return false;
    }

    public function for_all_k($func) {
        foreach ($this as $k => $v) {
            if (! $func($k, $v)) {
                return false;
            }
        }
        return true;
    }

    public function group($func) {
        $g = new self();
        foreach ($this as $k => $v) {
            $g[$func($v, $k)][] = $v;
        }
        return $g;
    }

    /**
     * @param $func
     * @return FancyArray
     */
    public function group_by_function($func) { return self::make(self::group_by($this->to_a(), $func)); }


    /** static functions */
    public static function group_by($arr, $func) {
        $ret = array();
        foreach ($arr as $val) {
            $ret[$func($val)][] = $val;
        }
        return $ret;
    }

    /**
     * transpose the 2d array (i.e. columns become rows)
     *
     * @param array $multiDimensionalArray the 2d array
     * @return array    the transposed array
     */
    public static function transpose2DArray($multiDimensionalArray) {
        return call_user_func_array('array_map', array_merge(array(null), $multiDimensionalArray));
    }

    /**
     * In-line version of transpose2DArray
     *
     * @return FancyArray
     */
    public function transpose() {
        return self::make(self::transpose2DArray($this->to_a()));
    }

    /**
     * Normalize the associative arrays in place so that the key from 1 array exist in all the arrays (if not setup key w/ default value)
     *
     * @param array[] $arrs the arrays to normalize
     * @param int $defaultValue the default value
     */
    public static function normalizeKeysToDefault($arrs, $defaultValue = 0) {
        $allKeys = array();
        foreach ($arrs as $arr) {
            $allKeys = array_merge($allKeys, array_keys($arr));
        }
        $allKeys = array_unique($allKeys);
        foreach ($arrs as &$arr) {
            foreach ($allKeys as $key) {
                if (! isset($arr[$key])) {
                    $arr[$key] = $defaultValue;
                }
            }
            ksort($arr);
        }
        return $arrs;
    }

    /**
     * Normalize the associative arrays in place so that the key from the first array exist in all the arrays (if not setup key w/ default value)
     *
     * @param array[] $arrs the arrays to normalize
     * @param int $defaultValue the default value
     */
    public static function normalizeKeysToDefaultRelativeToFirstArray($arrs, $defaultValue = 0) {
        $allKeys = array_keys(reset($arrs));
        foreach ($arrs as &$arr) {
            foreach ($allKeys as $key) {
                if (! isset($arr[$key])) {
                    $arr[$key] = $defaultValue;
                }
            }
            ksort($arr);
        }
        return $arrs;
    }

    /**
     * are the array keys sequential + numeric?
     *
     * @param array $array
     * @return bool whether the array is associative
     */
    public static function is_sequential_numeric_keys($array) {
        return array_keys($array) !== range(0, count($array) - 1);
    }

    /**
     * wrap the thing in an array if it's not already an array
     *
     * @param mixed $thing
     * @return array
     */
    public static function make_array_if_not($thing) {
        if (is_array($thing)) {
            return $thing;
        }

        return array($thing);
    }

    /**
     * join the associative array
     *
     * @param array $array the associative array to join
     * @param string $keyValSeparator the key val separator
     * @param string $elementSeparator the element separator
     * @return string
     */
    public static function joinAssociativeArray($array, $keyValSeparator = '=', $elementSeparator = ' | ') {
        $ret = array();
        foreach ($array as $key => $val) {
            $ret [] = $key . $keyValSeparator . $val;
        }
        return join($elementSeparator, $ret);
    }


    public function hasStringKeys() {
        return (bool)count(array_filter(array_keys($this->to_a()), 'is_string'));
    }

    /**
     * Merges together two nested arrays giving precedence to the second array in case of conflicts.
     *
     * @param array $arr1
     * @param array $arr2
     * @return  array
     * @author mtangorevinate
     *
     */
    public static function recursiveUnion($arr1, $arr2) {
        // behavior where either is not an array is undefined
        if (! is_array($arr1) || ! is_array($arr2)) {
            return $arr2; // prioritize $arr2
        }

        foreach ($arr2 as $key2 => $val2) {
            if (isset($arr1[$key2])) {
                // overwrite with merged subtree
                $arr1[$key2] = self::recursiveUnion($arr1[$key2], $val2);
            } else {
                $arr1[$key2] = $val2;
            }
        }

        return $arr1;
    }
}

<?php

namespace Revinate\Sequence;

use \ArrayIterator;
use \EmptyIterator;
use \Iterator;
use \IteratorIterator;
use \RecursiveIterator;
use \RecursiveIteratorIterator;
use \Traversable;

/**
 * Class Sequence
 * @author jasondent
 * @package Revinate\Sequence
 */
class Sequence extends IteratorIterator implements IterationFunctions, RecursiveIterator {
    /**
     * @param callable $fnValueMap($value, $key) -- function that returns the new value.
     * @param callable $fnKeyMap($key, $value) [optional] -- function that returns the new key
     * @return static
     */
    public function map($fnValueMap, $fnKeyMap = null) {
        return static::make(IterationTraits::map($this, $fnValueMap, $fnKeyMap));
    }

    /**
     * Map the keys of a sequence
     *
     * @param callable $fnKeyMap($key, $value) -- function that returns the new key
     * @return static
     */
    public function mapKeys($fnKeyMap) {
        return static::make(IterationTraits::mapKeys($this, $fnKeyMap));
    }

    /**
     * @param callable $fnMap($value, $key) -- function that returns the new key
     * @return static
     */
    public function keyBy($fnMap) {
        return static::make(IterationTraits::mapKeys($this, FnGen::fnSwapParamsPassThrough($fnMap)));
    }

    /**
     * @param callable $fn
     * @return static
     */
    public function filter($fn) {
        return static::make(IterationTraits::filter($this, $fn));
    }

    /**
     * @param callable $fn($key, $value)
     * @return static
     */
    public function filterKeys($fn) {
        return static::make(IterationTraits::filterKeys($this, $fn));
    }

    /**
     * @param $init
     * @param callable $fn($reducedValue, $value, $key)
     * @return mixed
     */
    public function reduce($init, $fn) {
        return IterationTraits::reduce($this, $init, $fn);
    }

    /**
     * This is a reduce function that results in a Sequence
     * The return value of the reduce function can be anything that can
     * be iterated over.
     *
     * @param mixed $init
     * @param callable $fn($reducedValue, $value, $key)
     * @return static
     */
    public function reduceToSequence($init, $fn) {
        return static::make($this->reduce($init, $fn));
    }

    /**
     * reduceLeft - ReduceLeft is like reduce, but it is used for combining values into values of the same type.  This is perfect for things like
     * summing values, concatenating strings, union arrays, etc.
     *
     * @param callable $fn($prevValue, $currentValue, $currentKey) -- The $fn predicate is a function(T $prevValue, T $currentValue) that returns type T|null.
     * @return mixed
     */
    public function reduceLeft($fn) {
        return IterationTraits::reduceLeft($this, $fn);
    }

    /**
     * reduceRight - ReduceRight is like reduce, but it is used for combining values into values of the same type.  This is perfect for things like
     * summing values, concatenating strings, union arrays, etc.
     * Note, the items will be walked in reverse order.  This means the entire sequence will be reversed before the reduce is applied.
     *
     * Example: Sequence::make(['one','two','three'])->reduceRight(func\fnStringConcat('.')) = 'three.two.one'
     *
     * @param callable $fn($prevValue, $currentValue, $currentKey) -- The $fn predicate is a function(T $prevValue, T $currentValue) that returns type T|null.
     * @return mixed
     */
    public function reduceRight($fn) {
        return IterationTraits::reduceRight($this, $fn);
    }

    /**
     * Get the keys
     * @return static
     */
    public function keys() {
        return static::make(IterationTraits::keys($this));
    }

    /**
     * Get the values
     *
     * @return static
     */
    public function values() {
        return static::make(IterationTraits::values($this));
    }

    /**
     * Calls $fnTap for each element.  This function is like walk, but does not consume the iterator.
     * Example: Sequence::make($values)->tap($fnLogValue)->map(...)
     *
     * @param callable $fnTap($value, $key) -- called for each element.  The return value is ignored.
     * @return static
     */
    public function tap($fnTap) {
        return static::make(IterationTraits::tap($this, $fnTap));
    }

    /**
     * Convert to an array, alias of toArray.
     * @return array
     */
    public function to_a() {
        return $this->toArray();
    }

    /**
     * Convert to an array.
     * @return array
     */
    public function toArray() {
        return IterationTraits::to_a($this);
    }

    /**
     * Convert to an array of values
     * @return array
     */
    public function toValues() {
        return $this->values()->toArray();
    }

    /**
     * Convert to an array of keys
     * @return array
     */
    public function toKeys() {
        return $this->keys()->toArray();
    }

    /**
     * calls $fn for every value,key pair
     *
     * @param callable $fn($value, $key)
     * @return Iterator
     */
    public function walk($fn) {
        return IterationTraits::walk($this, $fn);
    }

    /**
     * Limit the number of values returned
     *
     * @param int $limit
     * @return static
     */
    public function limit($limit) {
        return static::make(IterationTraits::limit($this, $limit));
    }

    /**
     * Skip $offset number of values
     *
     * @param int $offset
     * @return static
     */
    public function offset($offset) {
        return static::make(IterationTraits::offset($this, $offset));
    }

    /**
     * Sort ALL the values in the sequence.  Keys are NOT preserved.
     *
     * @param null|$fn($a, $b) [optional] -- function to use to sort the values, needs to return an int see usort
     * @return static
     */
    public function sort($fn = null) {
        return static::make(IterationTraits::sort($this, $fn));
    }

    /**
     * Sort ALL the values in the sequence.  Keys ARE preserved.
     *
     * @param callable $fn($a, $b) [optional] -- function to use to sort the values, needs to return an int see uasort
     * @return static
     */
    public function asort($fn = null) {
        return static::make(IterationTraits::asort($this, $fn));
    }

    /**
     * Sort ALL the values by the keys in the sequence.  Keys ARE preserved.
     *
     * @param callable $fn($a, $b) [optional] -- function to use to sort the values, needs to return an int see uksort
     * @return static
     */
    public function sortKeys($fn = null) {
        return static::make(IterationTraits::sortKeys($this, $fn));
    }

    /**
     * Group A Sequence based upon the result of $fnMapValueToGroup($value, $key) and return the result as a Sequence
     *
     * @param callable $fnMapValueToGroup($value, $key) -- return the field name to group the values under.
     * @param null|array|\ArrayAccess $init - used to initialize the resulting groups
     * @return static
     */
    public function groupBy($fnMapValueToGroup, $init = null) {
        return static::make(IterationTraits::groupBy($this, $fnMapValueToGroup, $init));
    }

    /**
     * Group A Sequence based upon the result of $fnMapValueToGroup($value, $key) and return the result as a Sequence
     *
     * @param callable $fnMapValueToGroup($value, $key) -- return the field name to group the values under.
     * @param array $keys - used to initialize the keys for the resulting groups
     * @return static
     */
    public function groupByInitWithKeys($fnMapValueToGroup, $keys) {
        return static::make(IterationTraits::groupByInitWithKeys($this, $fnMapValueToGroup, $keys));
    }

    /**
     * Transpose a sequence into another sequence
     * It is a sparse transpose
     *
     * @return static
     */
    public function transpose() {
        return static::make(IterationTraits::transpose($this));
    }


    /**
     * Map -- extracts a given field from the values.
     *
     * This is a alias for ->map(FnGen::fnPluck())
     *
     * @param string $fieldName -- name of the field to extract
     * @param mixed $default = null
     * @return static
     */
    public function pluck($fieldName, $default = null) {
        return $this->map(FnGen::fnPluck($fieldName, $default));
    }

    /**
     * Returns the first element where $fnTest returns true.
     *
     * @param callable|null $fnTest($value, $key)
     * @return null|mixed
     */
    public function first($fnTest = null) {
        if ($fnTest) {
            return $this->filter($fnTest)->limit(1)->reduce(null, FnGen::fnSwapParamsPassThrough(FnGen::fnIdentity()));

        } else {
            return $this->limit(1)->reduce(null, FnGen::fnSwapParamsPassThrough(FnGen::fnIdentity()));
        }
    }

    /**
     * Returns the last element where $fnTest returns true
     *
     * @param callable|null $fnTest($value, $key)
     * @return null|mixed
     */
    public function last($fnTest = null) {
        if ($fnTest) {
            return $this->filter($fnTest)->reduce(null, FnGen::fnSwapParamsPassThrough(FnGen::fnIdentity()));

        } else {
            return $this->reduce(null, FnGen::fnSwapParamsPassThrough(FnGen::fnIdentity()));
        }
    }


    /**
     * Returns the key of the first element where $fnTest returns true.
     *
     * @param callable|null $fnTest($value, $key)
     * @return mixed
     */
    public function firstKey($fnTest = null) {
        $fnTest = $fnTest ?: func\fnTrue();
        return $this->filter($fnTest)->limit(1)->keys()->reduce(null, FnGen::fnSwapParamsPassThrough(FnGen::fnIdentity()));
    }

    /**
     * Returns the first element where $fnTest returns true
     *
     * @param callable|null $fnTest($key, $value)
     * @return null|mixed
     */
    public function firstByKey($fnTest = null) {
        $fnFilter = $fnTest ? func\fnSwapParamsPassThrough($fnTest) : null;
        return $this->first($fnFilter);
    }

    /**
     * Flatten a Sequence by one level into a new Sequence.
     *
     * In its current implementation it forces the evaluation of ALL the items in the Sequence.
     *
     * @return static
     */
    public function flattenOnceNow() {
        $result = $this->reduce(array(), static function($result, $value) {
            if ($value instanceof Traversable) {
                $value = iterator_to_array($value);
            }
            if (is_array($value)) {
                return array_merge($result, $value);
            }
            $result[] = $value;
            return $result;
        });
        return static::make($result);
    }

    /**
     * Flatten a Sequence by one level into a new Sequence.
     *
     * @return static
     */
    public function flattenOnce() {
        return $this->flatten(1);
    }

    /**
     * Flatten a Sequence into a new Sequence.
     *
     * @param int $depth
     * @return static
     */
    public function flatten($depth = -1) {
        $recursiveIterator = new RecursiveIteratorIterator(RecursiveSequence::make($this)->setMaxDepth($depth));
        // Simulate array_merge by sequencing numeric keys but do not touch string keys.
        return static::make(IterationTraits::sequenceNumericKeys(self::make($recursiveIterator)));
    }

    /**
     * This is like the RX flatMap and concatMap, but does not flatten promises.
     * See: http://reactivex.io/documentation/operators/flatmap.html
     * Note: item order and keys are preserved
     *   if there are duplicate keys, it is necessary to call ->values() to start the keys over from 0 before
     *   converting to an array to avoid overwriting values.
     *
     * @param callable|null $fnMap($value, $key) -- optional map function, flattening is applied after the map
     * @return Sequence
     */
    public function concatMap($fnMap = null) {
        $rawSeq = is_callable($fnMap) ? $this->map($fnMap) : $this;
        // Filter out anything that cannot be traversed.
        $seq = $rawSeq->filter(static function($value) { return is_array($value) || $value instanceOf Traversable; });
        return self::make(new RecursiveIteratorIterator(RecursiveSequence::make($seq)->setMaxDepth(1)));
    }

    /**
     * See RX Scan: http://reactivex.io/documentation/operators/scan.html
     *
     * Note: if $accInit is null, $fnScanMap will be skipped for the first item.
     *
     * @param callable $fnScanMap($acc, $value, $key)
     * @param null $accInit -- This is the initial value for the accumulator passed to $fnScanMap
     * @return Sequence
     */
    public function scan($fnScanMap, $accInit = null) {
        $notSet = (object)array();  // unique object.
        $acc = $notSet;
        if (isset($accInit)) {
            $acc = $accInit;
        }
        return $this->map(static function($value, $key) use (&$acc, $fnScanMap, $notSet) {
            if ($acc === $notSet) {
                $acc = $value;
            } else {
                $acc = $fnScanMap($acc, $value, $key);
            }
            return $acc;
        });
    }

    /**
     * Traverses a sequence storing the path as keys
     *
     * @param int $depth
     * @param string $pathSeparator
     * @return static
     */
    public function traverse($depth = -1, $pathSeparator = '.') {
        $recursiveIterator = new RecursiveIteratorIterator(TraverseSequence::make($this, null, $pathSeparator)->setMaxDepth($depth));
        return static::make($recursiveIterator);
    }

    /**
     * Reassembles a traversed sequence into its original shape
     *
     * Note that this only has an effect if the Sequenced data has the path-keyed
     *      structure that results from a call to Sequence::traverse()
     *
     * @param string $pathSeparator The character used to parse the key path
     * @return static
     */
    public function reassemble($pathSeparator = '.') {
        return static::make(IterationTraits::reassemble($this, $pathSeparator));
    }

    /**
     * @param mixed $thing
     * @return bool - return true if we can iterate over it.
     */
    public static function canBeSequence($thing) {
        return $thing instanceof Traversable
        || is_array($thing)
        || is_object($thing);
    }

    /**
     * A Closure for Sequence::canBeSequence
     *
     * @return \Closure
     */
    public static function fnCanBeSequence() {
        return static function($thing) {
            return Sequence::canBeSequence($thing);
        };
    }

    /**
     * Make a sequence from an Traversable object (array or any other iterator).
     *
     * @param $iterator
     * @return static
     */
    public static function make($iterator) {
        if ($iterator instanceof static) {
            return $iterator;
        }
        if (! $iterator instanceof Traversable) {
            if (is_array($iterator) || is_object($iterator)) {
                $iterator = new ArrayIterator($iterator);
            } else if (is_null($iterator)) {
                $iterator = new EmptyIterator();
            }
        }
        return new static($iterator);
    }

    /**
     * @return null
     */
    public function getChildren() {
        return null;
    }

    /**
     * @return false
     */
    public function hasChildren() {
        return false;
    }
}



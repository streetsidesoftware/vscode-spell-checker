<?php

namespace Revinate\Sequence;

use \Iterator;
use \LimitIterator;
use Revinate\GetterSetter as gs;

/**
 * Class IterationTraits
 * @author jasondent
 * @package Revinate\Sequence
 */
class IterationTraits {

    /**
     * @param Iterator $iterator
     * @param callable $fnValue($value, $key)
     * @param callable $fnKey($key, $value) [optional]
     * @return MappedSequence
     */
    public static function map(Iterator $iterator, $fnValue, $fnKey = null) {
        if (empty($fnKey)) {
            $fnKey = FnGen::fnIdentity();
        }
        return new MappedSequence($iterator, $fnValue, $fnKey);
    }

    /**
     * @param Iterator $iterator
     * @param callable $fn($key, $value)
     * @return MappedSequence
     */
    public static function mapKeys(Iterator $iterator, $fn) {
        return new MappedSequence($iterator, FnGen::fnIdentity(), $fn);
    }

    /**
     * @param Iterator $iterator
     * @param callable $fn($value, $key)
     * @return Sequence
     */
    public static function filter(Iterator $iterator, $fn) {
        return Sequence::make(new FilteredSequence($iterator, $fn));
    }

    /**
     * @param Iterator $iterator
     * @param callable $fn($key, $value)
     * @return Sequence
     */
    public static function filterKeys(Iterator $iterator, $fn) {
        return Sequence::make(new FilteredSequence($iterator, FnGen::fnSwapParamsPassThrough($fn)));
    }

    /**
     * Limit the number of items.
     *
     * @param Iterator $iterator
     * @param int $limit
     * @return Sequence
     */
    public static function limit(Iterator $iterator, $limit) {
        return Sequence::make(new LimitIterator($iterator, 0, $limit));
    }

    /**
     * Skip a number of items.
     *
     * @param Iterator $iterator
     * @param int $offset
     * @return Sequence
     */
    public static function offset(Iterator $iterator, $offset) {
        return Sequence::make(new LimitIterator($iterator, $offset));
    }

    /**
     * @param Iterator $iterator
     * @param mixed $init - The first, initial, value of $reducedValue
     * @param callable $fn($reducedValue, $value, $key) - function that takes the following params ($reducedValue, $value, $key) where $reducedValue is the current
     * @return mixed
     */
    public static function reduce(Iterator $iterator, $init, $fn) {
        $reducedValue = $init;
        foreach ($iterator as $key => $value) {
            $reducedValue = $fn($reducedValue, $value, $key);
        }

        return $reducedValue;
    }

    /**
     * reduceLeft - ReduceLeft is like reduce, but it is used for combining values into values of the same type.  This is perfect for things like
     * summing values, concatenating strings, union arrays, etc.
     *
     * @param Iterator $iterator
     * @param callable $fn ($valueLeft, $valueRight) -- The $fn predicate is a function(T $left, T $right) that returns type T|null.
     * @return mixed
     */
    public static function reduceLeft(Iterator $iterator, $fn) {
        $nil = (object)array('Nil');
        $result = self::reduce($iterator, $nil, static function($valueLeft, $valueRight) use ($nil, $fn) {
            if ($valueLeft === $nil) {
                return $valueRight;
            }

            return $fn($valueLeft, $valueRight);
        });
        return ($result === $nil) ? null : $result;
    }

    /**
     * reduceRight - ReduceRight is like reduce, but it is used for combining values into values of the same type.  This is perfect for things like
     * summing values, concatenating strings, union arrays, etc.  The value are processed from right to left.
     *
     * @param Iterator $iterator
     * @param callable $fn ($previousValue, $currentValue, [$currentKey]) -- The $fn predicate is a function(T $right, T $left) that returns type T|null.
     * @return mixed
     */
    public static function reduceRight(Iterator $iterator, $fn) {
        return self::reduceLeft(self::reverse($iterator), $fn);
    }

    /**
     * @param Iterator $iterator
     * @return array
     */
    public static function to_a(Iterator $iterator) {
        return iterator_to_array($iterator);
    }

    /**
     * @param Iterator $iterator
     * @return MappedSequence
     */
    public static function keys(Iterator $iterator) {
        return new MappedSequence($iterator, FnGen::fnMapToKey(), FnGen::fnCounter());
    }

    /**
     * @param Iterator $iterator
     * @return MappedSequence
     */
    public static function values(Iterator $iterator) {
        return new MappedSequence($iterator, FnGen::fnIdentity(), FnGen::fnCounter());
    }

    /**
     * @param Iterator $iterator
     * @return MappedSequence
     */
    public static function sequenceNumericKeys(Iterator $iterator) {
        return new MappedSequence(
            $iterator,
            FnGen::fnIdentity(),
            FnGen::fnIfMap(FnGen::fnIsNumeric(), FnGen::fnCounter(), FnGen::fnIdentity())
        );
    }

    /**
     * Call a function for all items available to the iterator.
     *
     * Note: it does a rewind on $iterator and walks ALL values.  It does NOT rewind the iterator a second time.
     *
     * @param Iterator $iterator
     * @param callable $fn($value, $key) -- the function to call for each item.
     * @return Iterator
     */
    public static function walk(Iterator $iterator, $fn) {
        foreach ($iterator as $key => $value) {
            $fn($value, $key);
        }

        return $iterator;
    }


    /**
     * Allow for a function to be called for each element.
     *
     * @param Iterator $iterator
     * @param callable $fnTap($value, $key) - called with each $key/$value pair, the return value is ignored.
     * @return MappedSequence
     */
    public static function tap(Iterator $iterator, $fnTap) {
        $fnValue = static function ($v, $k) use ($fnTap) { $fnTap($v, $k); return $v; };
        return new MappedSequence($iterator, $fnValue, null);
    }


    /**
     * @param callable $fn
     * @return Sequence
     */
    public static function wrapFunctionIntoSequenceOnDemand($fn) {
        return Sequence::make(new OnDemandIterator($fn));
    }

    /**
     * Collect all the values into an array, sort them and return the resulting Sequence.  Keys are NOT preserved.
     *
     * @param Iterator $iterator
     * @param callable $fn
     * @return Sequence
     */
    public static function sort(Iterator $iterator, $fn = null) {
        return self::wrapFunctionIntoSequenceOnDemand(static function() use ($iterator, $fn) {
            $array = iterator_to_array($iterator);
            if ($fn) {
                usort($array, $fn);
            } else {
                sort($array);
            }
            return new \ArrayIterator($array);
        });
    }

    /**
     * Collect all the values into an array, sort them and return the resulting Sequence.  Keys are preserved.
     *
     * @param Iterator $iterator
     * @param callable $fn
     * @return Sequence
     */
    public static function asort(Iterator $iterator, $fn = null) {
        return self::wrapFunctionIntoSequenceOnDemand(static function() use ($iterator, $fn) {
            $array = iterator_to_array($iterator);
            if ($fn) {
                uasort($array, $fn);
            } else {
                asort($array);
            }
            return new \ArrayIterator($array);
        });
    }

    /**
     * Collect all the values into an array, sort them and return the resulting Sequence.  Keys are preserved.
     *
     * @param Iterator $iterator
     * @param callable $fn
     * @return Sequence
     */
    public static function sortKeys(Iterator $iterator, $fn = null) {
        return self::wrapFunctionIntoSequenceOnDemand(static function() use ($iterator, $fn) {
            $array = iterator_to_array($iterator);
            if ($fn) {
                uksort($array, $fn);
            } else {
                ksort($array);
            }
            return new \ArrayIterator($array);
        });
    }

    /**
     * Group all the the values into an array and return the result as a Sequence
     *
     * @param Iterator $iterator
     * @param callable $fnToGroup($value, $key) -- return the field name to group the values under.
     * @param null|array|\ArrayAccess|\Closure $init - used to initialize the resulting groups
     *                                               $init should be an array of arrays or a Closure
     *                                               that will return an array of arrays.
     *                                               Example: ['one'=>[], 'two'=>[]] or [[],[],[]]
     * @return Sequence
     */
    public static function groupBy(Iterator $iterator, $fnToGroup, $init = null) {
        $init = $init ?: array();
        return self::wrapFunctionIntoSequenceOnDemand(static function() use ($iterator, $fnToGroup, $init) {
            // Allow for late binding of the initial value.
            if ($init instanceof \Closure) {
                $init = $init();
            }
            return Sequence::make($iterator)
                ->reduceToSequence($init, static function ($collection, $value, $key) use ($fnToGroup) {
                    $collection[$fnToGroup($value, $key)][] = $value;
                    return $collection;
                });
        });
    }

    /**
     * Group A Sequence based upon the result of $fnMapValueToGroup($value, $key) and return the result as a Sequence
     *
     * @param Iterator $iterator
     * @param callable $fnToGroup($value, $key) -- return the field name to group the values under.
     * @param int|array $keys - used to initialize the keys for the resulting groups
     *                        int $n - will generate keys 0 to $n-1
     *
     * @return static
     */
    public static function groupByInitWithKeys(Iterator $iterator, $fnToGroup, $keys) {
        $keys = is_numeric($keys) ? range(0, $keys-1) : $keys;
        return self::groupBy($iterator, $fnToGroup, array_fill_keys($keys, array()));
    }

    /**
     * @param Iterator $iterator
     * @return static
     */
    public static function transpose(Iterator $iterator) {
        return self::wrapFunctionIntoSequenceOnDemand(static function() use ($iterator) {
            return Sequence::make($iterator)
                ->filter(Sequence::fnCanBeSequence())
                ->reduceToSequence(array(), static function ($collection, $row, $keyCol) {
                    return Sequence::make($row)
                        ->reduce($collection, static function ($collection, $value, $keyRow) use ($keyCol) {
                            $collection[$keyRow][$keyCol] = $value;
                            return $collection;
                        });
                });
        });
    }

    /**
     * Returns an iterator that will return the items in reverse order.
     * Note: the original iterator fill be fully traversed when the first item of the returned iterator is requested
     *
     * @param Iterator $iterator
     * @return Sequence
     */
    public static function reverse(Iterator $iterator) {
        return self::wrapFunctionIntoSequenceOnDemand(static function() use ($iterator) {
            // So we do not lose values due to duplicate keys, we need to store the keys along with the values.
            $array = Sequence::make($iterator)->map(func\fnMapToKeyValuePair())->toValues();
            // separate the key/value pair and return the resulting sequence.
            return Sequence::make(array_reverse($array))->keyBy(func\fnPairKey())->map(func\fnPairValue());
        });
    }


    /**
     * Reassembles a traversed sequence into its original shape
     *
     * @param Iterator $iterator
     * @param string $pathSeparator
     * @return Sequence
     */
    public static function reassemble(Iterator $iterator, $pathSeparator = '.') {
        return self::wrapFunctionIntoSequenceOnDemand(static function() use ($iterator, $pathSeparator) {
           return Sequence::make($iterator)
               ->reduceToSequence(array(), static function ($collection, $value, $path) use ($pathSeparator) {
                   return gs\set($collection, $path, $value, $pathSeparator);
               });
        });
    }
}

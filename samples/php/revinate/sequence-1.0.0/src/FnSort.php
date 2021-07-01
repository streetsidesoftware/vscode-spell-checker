<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/06/15
 * Time: 15:11
 */

namespace Revinate\Sequence;
use \Closure;
use Revinate\Sequence\func;

class FnSort {

    /**
     * Generate a comparison function that uses an extractor to get the values for comparison
     *
     * @param Closure $fnExtractValue -- Function that will extract the values to be compared.
     * @return Closure -- returns a function to be used with sort
     */
    public static function fnComp(Closure $fnExtractValue) {
        return func\fnCompare($fnExtractValue);
    }

    /**
     * Generate a comparison function that uses an extractor to get the values for comparison
     * The order of the comparison is reversed.
     *
     * @param Closure $fnExtractValue -- Function that will extract the values to be compared.
     * @return Closure -- returns a function to be used with sort
     */
    public static function fnRevComp(Closure $fnExtractValue) {
        return func\fnCompareRev($fnExtractValue);
    }


    /**
     * Generates a comparison function that can be used to sort an array by a given field.
     *
     * @param string $fieldName
     * @return Closure
     */
    public static function fnByField($fieldName) {
        return func\fnCompareField($fieldName);
    }

    /**
     * Generates a comparison function that can be used to sort an array by a given field in reverse order.
     *
     * @param string $fieldName
     * @return Closure
     */
    public static function fnByFieldRev($fieldName) {
        return func\fnCompareFieldRev($fieldName);
    }

    /**
     * Generate a function that can sort an array
     *
     * @param Closure $fnComp($lhs, $rhs) -- see PHP usort
     * @return Closure
     */
    public static function fnSort(Closure $fnComp = null) {
        return func\fnSortArray($fnComp);
    }

    /**
     * Generates a sort function that can sort an array by a given field.
     *
     * @param string $fieldName
     * @return Closure
     */
    public static function fnSortByField($fieldName) {
        return func\fnSortArrayByField($fieldName);
    }
}

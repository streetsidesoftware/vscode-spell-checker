<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 05/09/15
 * Time: 10:35
 */
namespace Revinate\Sequence\Tutorial;

require_once __DIR__.'/../vendor/autoload.php';

use Revinate\Sequence\Sequence;
use Revinate\Sequence\func;

/**
 * @param array[] $employees
 * @return array
 */
function exampleExtractField1($employees) {
    $employeeIds = Sequence::make($employees)   // make the array into a Sequence
        ->pluck('employeeId')                   // Extract the employee id
        ->to_a();                               // Convert it into an array

    return $employeeIds;
}

/**
 * @param array[] $employees
 * @return array
 */
function exampleExtractField2($employees) {
    $employeeIds = Sequence::make($employees)   // make the array into a Sequence
        ->map(func\fnPluck('employeeId'))         // Extract the employee id
        ->to_a();                               // Convert it into an array

    return $employeeIds;
}


/**
 * @param array[] $employees
 * @return array
 */
function exampleKeyByFieldName($employees) {
    $employeeIds = Sequence::make($employees)   // make the array into a Sequence
        ->keyBy(func\fnPluck('employeeId'))       // Extract the employee id as assign it to the key
        ->to_a();                               // Convert it into an array

    return $employeeIds;
}


/**
 * @param array[] $employees
 * @return array
 */
function exampleSortByEmployeeId($employees) {
    $employeesSortedById = Sequence::make($employees)   // make the array into a Sequence
        ->sort(func\fnCompareField('employeeId'))         // sort the employees by their id
        ->to_a();

    return $employeesSortedById;
}


/**
 * @param array[] $employees
 * @return array
 */
function exampleSortByEmployeeIdRev($employees) {
    $employeesSortedById = Sequence::make($employees)   // make the array into a Sequence
        ->sort(func\fnCompareFieldRev('employeeId'))      // sort the employees by their id
        ->to_a();

    return $employeesSortedById;
}


/**
 * @param array[] $employees
 * @return array
 */
function exampleKeyByIdSortByEmployeeLastName1($employees) {
    $employeesSortedById = Sequence::make($employees)   // make the array into a Sequence
        ->sort(func\fnCompareField('lastName'))           // sort the employees by their last name
        ->keyBy(func\fnPluck('employeeId'))               // key by the employee id
        ->to_a();

    return $employeesSortedById;
}


/**
 * @param array[] $employees
 * @return array
 */
function exampleKeyByIdSortByEmployeeLastName1Wrong($employees) {
    $employeesSortedById = Sequence::make($employees)   // make the array into a Sequence
        ->keyBy(func\fnPluck('employeeId'))               // key by the employee id
        ->sort(func\fnCompareField('lastName'))           // **Keys are lost**
        ->to_a();

    return $employeesSortedById;
}


/**
 * @param array[] $employees
 * @return array
 */
function exampleKeyByIdSortByEmployeeLastName2($employees) {
    $employeesSortedById = Sequence::make($employees)   // make the array into a Sequence
        ->keyBy(func\fnPluck('employeeId'))               // key by the employee id
        ->asort(func\fnCompareField('lastName'))          // sort the employees by their last name
        ->to_a();

    return $employeesSortedById;
}

/**
 * @param array|\iterator $peopleKeyedById
 * @return array
 */
function exampleExtractKeys1($peopleKeyedById) {
    $keys = Sequence::make($peopleKeyedById)    // make the array|iterator into a Sequence
        ->keys()                                // get the keys
        ->to_a();

    return $keys;
}

/**
 * @param array|\iterator $peopleKeyedById
 * @return array
 */
function exampleExtractKeys2($peopleKeyedById) {
    $keys = Sequence::make($peopleKeyedById)    // make the array|iterator into a Sequence
        ->map(static function ($value, $key) {         // write a Closure to extract $key
            return $key;
        })
        ->values()                              // Re-key starting with 0
        ->to_a();

    return $keys;
}

/**
 * @param array|\iterator $peopleKeyedById
 * @return array
 */
function exampleExtractKeys3($peopleKeyedById) {
    $keys = Sequence::make($peopleKeyedById)
        ->map(func\fnSwapParamsPassThrough(func\fnIdentity()))
        ->values()
        ->to_a();

    return $keys;
}

/**
 * @param array|\iterator $employees
 * @return array
 */
function exampleIdentity($employees) {
    $values = Sequence::make($employees)
        ->map(func\fnIdentity())          // Copies the array values
        ->to_a();
    return $values;
}




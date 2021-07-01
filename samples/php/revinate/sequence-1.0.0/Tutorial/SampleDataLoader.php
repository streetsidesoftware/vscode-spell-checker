<?php
namespace Revinate\Sequence\Tutorial;
use Revinate\Sequence\Tutorial\util\StreamReaderIterator;

/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 30/08/15
 * Time: 18:13
 */
class SampleDataLoader {

    /**
     * @param string $filename
     * @param bool   $asArray
     * @return mixed
     */
    public static function dataLoader($filename, $asArray) {
        $json = file_get_contents($filename);
        return \json_decode($json, $asArray);
    }

    /**
     * @param bool|true $asArray
     * @return array
     */
    public static function getDonutSample($asArray = true) {
        // Data From https://adobe.github.io/Spry/samples/data_region/JSONDataSetSample.html Example 5
        $filename = __DIR__.'/Data/example_data_donuts.json';
        return self::dataLoader($filename, $asArray);
    }

    /**
     * @description Data from: http://www.librarything.com/api_getdata.php?userid=timspalding&showstructure=1&max=10&showCollections=1&showTags=1&booksort=title_REV&responseType=json
     * @param bool|true $asArray
     * @return mixed
     */
    public static function getLibraryThingComSample($asArray = true) {
        $filename = __DIR__.'/Data/example_data_donuts.json';
        return self::dataLoader($filename, $asArray);
    }

    /**
     * @param bool|true $asArray
     * @return mixed
     */
    public static function getEmployees($asArray = true) {
        $filename = __DIR__.'/Data/employees.json';
        $employeeData = self::dataLoader($filename, $asArray);
        return $employeeData['employees'];
    }

    /**
     * @description people data generated at: http://json-generator.com/4y2Ny-V6
     * @param bool|true $asArray
     * @return mixed
     */
    public static function getPeople($asArray = true) {
        $filename = __DIR__.'/Data/people.json';
        return self::dataLoader($filename, $asArray);
    }

    /**
     * @return resource
     */
    public static function getEmployeesCsvStream() {
        $filename = __DIR__.'/Data/employee.csv';
        return fopen($filename, 'r');
    }

    /**
     * @return string
     */
    public static function getEmployeesCsv() {
        $filename = __DIR__.'/Data/employee.csv';
        return file_get_contents($filename);
    }

}

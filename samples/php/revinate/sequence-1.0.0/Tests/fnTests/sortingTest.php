<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 31/05/2016
 * Time: 11:33
 */

namespace Revinate\Sequence;

use PHPUnit\Framework\TestCase;
use \Revinate\Sequence\func;


class sortingTest extends TestCase {

    public function testCompareMulti() {
        $values = TestData::$fruit;

        usort($values, func\fnCompareMulti(array(func\fnCompareField('name'))));

        $this->assertNotEquals(TestData::$fruit, $values);
        $this->assertEquals(
            Sequence::make(TestData::$fruit)->pluck('name')->sort()->toValues(),
            array_map(func\fnPluck('name'), $values)
        );

        $values = array(
            array('name' => 'Terry', 'age' => 22),
            array('name' => 'Bob', 'age' => 30),
            array('name' => 'Ann', 'age' => 30),
            array('name' => 'Sam', 'age' => 19),
            array('name' => 'Rob', 'age' => 30),
            array('name' => 'Robert', 'age' => 55),
        );

        $expected =  array(
            array('name' => 'Robert', 'age' => 55),
            array('name' => 'Ann', 'age' => 30),
            array('name' => 'Bob', 'age' => 30),
            array('name' => 'Rob', 'age' => 30),
            array('name' => 'Terry', 'age' => 22),
            array('name' => 'Sam', 'age' => 19),
        );

        usort($values, func\fnCompareMulti(array(func\fnCompareFieldRev('age'), func\fnCompareField('name'))));
        $this->assertEquals($expected, $values);
    }
}

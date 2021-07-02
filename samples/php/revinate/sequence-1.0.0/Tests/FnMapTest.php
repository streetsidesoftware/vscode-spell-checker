<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 23/07/2015
 * Time: 20:24
 */

namespace Revinate\Sequence;


use PHPUnit\Framework\TestCase;

class FnMapTest extends TestCase {

    public function testFnCastToInt() {
        $fnInt = FnMap::fnCastToInt();

        $this->assertEquals(5, $fnInt(5));
        $this->assertEquals(1, $fnInt(1.0));
        $this->assertEquals(1, $fnInt(1.5));
        $this->assertEquals(1, $fnInt('1.0'));
        $this->assertEquals(0, $fnInt('hello'));
    }

    public function testFnCastToFloat() {
        $fnFloat = FnMap::fnCastToFloat();

        $this->assertEquals(1.0, $fnFloat(1.0));
        $this->assertEquals(1.0, $fnFloat(1));
        $this->assertEquals(1.5, $fnFloat(1.5));
        $this->assertEquals(1.2, $fnFloat('1.2'));
    }

    public function testFnCastToDouble() {
        $fnDouble = FnMap::fnCastToDouble();

        $this->assertEquals(1.0, $fnDouble(1.0));
        $this->assertEquals(1.0, $fnDouble(1));
        $this->assertEquals(1.5, $fnDouble(1.5));
        $this->assertEquals(1.2, $fnDouble('1.2'));
    }

    public function testFnCastToString() {
        $fnString = FnMap::fnCastToString();

        $this->assertEquals('Hello', $fnString('Hello'));
        $this->assertEquals(0, $fnString(0));
        $this->assertNotEquals('Hello', $fnString(0));
    }

    public function testFnCastToArray() {
        $fnArray = FnMap::fnCastToArray();

        $array = array('name'=>'array', 'type'=>'assoc');

        $this->assertEquals(array(), $fnArray(array()));
        $this->assertEquals($array, $fnArray($array));
        $this->assertEquals($array, $fnArray((object)$array));
        $this->assertNotEquals($array, $fnArray(array('name'=>'array')));
    }

    public function testFnCastToObject() {
        $fnObject = FnMap::fnCastToObject();

        $object = new \stdClass();
        $object->name = 'object';

        $this->assertEquals((object)array(), $fnObject(array()));
        $this->assertEquals($object, $fnObject($object));
        $this->assertEquals($object, $fnObject((array)$object));
        $this->assertNotEquals($object, $fnObject(array('type'=>'array')));
    }

}

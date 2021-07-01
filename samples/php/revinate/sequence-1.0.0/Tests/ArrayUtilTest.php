<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 24/07/2015
 * Time: 18:50
 */

namespace Revinate\Sequence;

use PHPUnit\Framework\TestCase;

require 'TestAccessClass.php';

class ArrayUtilTest extends TestCase {

    public function testGetField() {
        $array = array(
            0 => 'zero',
            'name' => 'Bob',
            'null' => null,
        );

        $object = (object)$array;

        $this->assertEquals($array['name'], ArrayUtil::getField($array, 'name'));
        $this->assertEquals($array[0], ArrayUtil::getField($array, 0));
        $this->assertNull(ArrayUtil::getField($array, 'missing'));
        $this->assertEquals('Default', ArrayUtil::getField($array, 'missing', 'Default'));
        $this->assertNull(ArrayUtil::getField($array, 'null', 'default'));

        $this->assertEquals($object->name, ArrayUtil::getField($object, 'name'));
        $this->assertNull(ArrayUtil::getField($object, 'missing'));
        $this->assertEquals('Default', ArrayUtil::getField($object, 'missing', 'Default'));
        $this->assertNull(ArrayUtil::getField($object, 'null', 'default'));

        $accessTest = new TestAccessClass();
        // Test public access
        $this->assertEquals($accessTest->public, ArrayUtil::getField($accessTest, 'public'));

        // Test protected and private access, these should return the default value (null)
        $this->assertNull(ArrayUtil::getField($accessTest, 'protected'));
        $this->assertNull(ArrayUtil::getField($accessTest, 'private'));
        $this->assertEquals('private', ArrayUtil::getField($accessTest, 'privatefield'));

        $arrayObject = new \ArrayObject($array);
        $this->assertEquals($arrayObject['name'], ArrayUtil::getField($arrayObject, 'name'));
        $this->assertEquals($arrayObject[0], ArrayUtil::getField($arrayObject, 0));
        $this->assertNull(ArrayUtil::getField($arrayObject, 'missing'));
        $this->assertEquals('Default', ArrayUtil::getField($arrayObject, 'missing', 'Default'));
        $this->assertNull(ArrayUtil::getField($arrayObject, 'null', 'default'));

        $arrayObject = new \ArrayObject($object);
        $this->assertEquals($arrayObject['name'], ArrayUtil::getField($arrayObject, 'name'));
        $this->assertNull(ArrayUtil::getField($arrayObject, 'missing'));
        $this->assertEquals('Default', ArrayUtil::getField($arrayObject, 'missing', 'Default'));
        $this->assertNull(ArrayUtil::getField($arrayObject, 'null', 'default'));

        $arrayObject = new \ArrayObject($accessTest);
        $this->assertEquals($arrayObject['public'], ArrayUtil::getField($arrayObject, 'public'));
        $this->assertNull(ArrayUtil::getField($arrayObject, 'protected'));
        $this->assertNull(ArrayUtil::getField($arrayObject, 'private'));
    }

    public function testSetField() {
        $array = array(
            0 => 'zero',
            'name' => 'Bob',
        );

        $object = (object)$array;

        // arrays are not modified
        $this->assertNotEquals($array, ArrayUtil::setField($array, 'name', 'Sam'));
        // Objects get modified
        $this->assertEquals($object, ArrayUtil::setField($object, 'name', 'Sam'));

        $result = ArrayUtil::setField($array, 'type', 'array');
        $this->assertEquals('array', $result['type']);
        // Make sure the original array did not change.
        $this->assertNull(ArrayUtil::getField($array, 'type'));
    }

    public function testObjectCompare() {
        // It is assumed that $object !== $object2
        // Verify
        $object = (object)array(-1 => 'not found');
        $object2 = (object)array(-1 => 'not found');

        $this->assertFalse($object === (array)$object);
        $this->assertFalse($object === $object2);
    }

    public function testGetPath() {
        $data = array(
            array(
                'name'=>'zero',
                'children' => array(1,2,3,4,5)
            ),
            array(
                'name'=>'one',
                'children' => array(11,12,13,14,15)
            ),
        );

        $this->assertEquals(1, ArrayUtil::getPath($data, array(0,'children',0)));
        $this->assertEquals(11, ArrayUtil::getPath($data, array(1,'children',0)));
        $this->assertEquals('zero', ArrayUtil::getPath($data, array(0,'name')));

        $this->assertNull(ArrayUtil::getPath($data, array(2,'children',0)));
    }

    public function testSetPath() {

        $this->assertEquals('root', ArrayUtil::setPath(null, array(), 'root'));

        $root = ArrayUtil::setPath(array(), array('name'), 'root');
        $this->assertEquals(array('name'=>'root'), $root);
        $rootWithOneChild = ArrayUtil::setPath($root, array('children', 0, 'name'), 'zero');
        $this->assertEquals(array('name'=>'root', 'children'=>array(array('name'=>'zero'))), $rootWithOneChild);
        $object = (object)array('type'=>'object', 'name'=>'Bob');
        $rootWithOneChildAndObject = ArrayUtil::setPath($rootWithOneChild, explode('.', 'other.object'), $object);
        $this->assertEquals($object, $rootWithOneChildAndObject['other']['object']);

        // Set a field in an object and assert that all copies of that object are the same
        $rootWithOneChildAndObject2 = ArrayUtil::setPath($rootWithOneChildAndObject, explode('.', 'other.object.location'), 'inside');
        $this->assertEquals($rootWithOneChildAndObject, $rootWithOneChildAndObject2);
        $this->assertEquals($object, $rootWithOneChildAndObject2['other']['object']);
        $this->assertEquals('inside', ArrayUtil::getPath($rootWithOneChildAndObject2, explode('.', 'other.object.location')));
    }

    public function testGetOnNull() {
        $notFound = (object)array();

        $this->assertEquals($notFound, ArrayUtil::getField(null, 'name', $notFound));
        $this->assertEquals($notFound, ArrayUtil::getPath(null, array('name'), $notFound));
        $this->assertEquals($notFound, ArrayUtil::getPath(null, null, $notFound));
    }
}

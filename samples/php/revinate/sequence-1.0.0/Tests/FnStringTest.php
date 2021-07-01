<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/06/15
 * Time: 15:37
 */

namespace Revinate\Sequence;


use PHPUnit\Framework\TestCase;

class FnStringTest extends TestCase {

    public function testFnTrim() {
        $fn = FnString::fnTrim();
        $this->assertEquals('test', $fn('  test '));
        $array = array(' 352', '354 ', '333', ' 12 34 ', "\n  Cool Stuff  \n", "\r", "CRLF\r\n");
        $expectedTrimmedArray = array('352', '354', '333', '12 34', 'Cool Stuff', '', 'CRLF');
        $this->assertNotEquals($array, $expectedTrimmedArray);
        $trimmedArray = Sequence::make($array)
            ->map(FnString::fnTrim())
            ->to_a();
        $this->assertEquals($trimmedArray, $expectedTrimmedArray);
    }

    public function testFnRemoveSuffix() {
        $suffix = 'world';
        $fn = FnString::fnRemoveSuffix($suffix);

        $this->assertEquals('Hello ', $fn('Hello world'));
        $this->assertEquals('Hello world!', $fn('Hello world!'));
    }

    public function testFnRemovePrefix() {
        $prefix = 'Hello';
        $fn = FnString::fnRemovePrefix($prefix);

        $this->assertEquals(' world!', $fn('Hello world!'));
        $this->assertEquals('Oh, Hello world!', $fn('Oh, Hello world!'));
    }

    public function testFnToUpper() {
        $fn = FnString::fnToUpper();
        $this->assertEquals('HELLO', $fn('hello'));

        $fn = FnString::fnToUpper('UTF-8');
        $this->assertEquals('HELLO', $fn('hello'));
        $this->assertEquals('HELLÖ', $fn('hellö'));
        $this->assertNotEquals(strtoupper('hellö'), $fn('hellö'));
    }

    public function testFnToLower() {
        $fn = FnString::fnToLower();
        $this->assertEquals('hello', $fn('HELLO'));

        $fn = FnString::fnToLower('UTF-8');
        $this->assertEquals('hello', $fn('HELLO'));
        $this->assertEquals('hellö', $fn('HELLÖ'));
        $this->assertNotEquals(strtolower('HELLÖ'), $fn('HELLÖ'));
    }

}

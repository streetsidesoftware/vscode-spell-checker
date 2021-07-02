<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 30/08/15
 * Time: 23:43
 */

namespace Revinate\Sequence\func;


use PHPUnit\Framework\TestCase;

class StringsTest extends TestCase {

    public function providerEncodings() {
        return array(
            array('UTF-8'),
            array('ISO-8859-1'),
        );
    }

    public function providerSnakeAndCamelCase() {
        return array(
            // Encoding, Snake, Camel, tests (S = Snake Equals, s = Snake Not Equals)
            array('UTF-8',      'it_is_time_to_take_a_nap', 'ItIsTimeToTakeANap',   'SC'),
            array('ISO-8859-1', 'it_is_time_to_take_a_nap', 'ItIsTimeToTakeANap',   'SC'),
            array('UTF-8',      'it_is_time_to_take_á_nap', 'ItIsTimeToTakeÁNap',   'SC'),
            array('UTF-8',      'it_is_time2_take_a_nap',   'ItIsTime2TakeANap',    'SC'),
            array('ISO-8859-1', 'it_is_time2_take_a_nap',   'ItIsTime2TakeANap',    'SC'),
            array('UTF-8',      'it_is_time222_take_a_nap', 'ItIsTime222TakeANap',  'SC'),
            array('ISO-8859-1', 'it_is_time222_take_a_nap', 'ItIsTime222TakeANap',  'SC'),
            array('UTF-8',      'It_Is_Time_To_Take',       'ItIsTimeToTake',       'sC'),
            array('ISO-8859-1', 'It_Is_Time_To_Take',       'ItIsTimeToTake',       'sC'),
            array('UTF-8',      'It__Is_Time_To_Take',      'ItIsTimeToTake',       'sC'),
            array('ISO-8859-1', 'It__Is_Time_To_Take',      'ItIsTimeToTake',       'sC'),
            array('UTF-8',      'it__is',                   'It_Is',                'Sc'),
            array('ISO-8859-1', 'it__is',                   'It_Is',                'Sc'),
        );
    }

    /**
     * @param $encoding
     * @dataProvider providerEncodings
     */
    public function testPregReplace($encoding) {
        mb_internal_encoding($encoding);
        $pattern = '|(\w)(?=\p{Lu})|u';
        $replace = '$1_';

        $fnRegEx = fnPregReplace($pattern, $replace);

        $subject = 'ItIsTimeToTakeANap';
        $result = $fnRegEx($subject);
        $this->assertEquals(preg_replace($pattern, $replace, $subject), $result);
    }

    /**
     * @param string $encoding
     * @param string $snake
     * @param string $camel
     * @param string $tests
     * @dataProvider providerSnakeAndCamelCase
     */
    public function testSnakeCaseAndCamelCase($encoding, $snake, $camel, $tests) {
        mb_internal_encoding($encoding);
        $fnSnakeCase = fnSnakeCase();
        $fnCamelCase = fnCamelCase();
        if (strpos($tests, 'C') !== false) {
            $this->assertEquals($camel, $fnCamelCase($snake));
        }
        if (strpos($tests, 'c') !== false) {
            $this->assertNotEquals($camel, $fnCamelCase($snake));
        }
        if (strpos($tests, 'S') !== false) {
            $this->assertEquals($snake, $fnSnakeCase($camel));
        }
        if (strpos($tests, 's') !== false) {
            $this->assertNotEquals($snake, $fnSnakeCase($camel));
        }
    }

    public function testSnakeCaseAndCamelCaseUTF8() {
        mb_internal_encoding('UTF-8');
        $fnSnakeCase = fnSnakeCase();
        $fnCamelCase = fnCamelCase();

        $subject = 'ItIsTimeToTakeANap';
        $result = $fnSnakeCase($subject);
        $this->assertEquals('it_is_time_to_take_a_nap', $result);
        $this->assertEquals($subject, $fnCamelCase($result));

        $subject = 'ItIsTimeToTakeÁNap';
        $result = $fnSnakeCase($subject);
        $this->assertEquals('it_is_time_to_take_á_nap', $result);
        $this->assertEquals($subject, $fnCamelCase($result));
    }


    /**
     * @param $encoding
     * @dataProvider providerEncodings
     */
    public function testTitleCase($encoding) {
        mb_internal_encoding($encoding);
        $fnTitleCase = fnTitleCase();

        $subject = 'it is time to take a nap';
        $result = $fnTitleCase($subject);
        $this->assertEquals('It Is Time To Take A Nap', $result);
    }


    public function providerUcFirstAndLcFirst() {
        return array(
            array('hello', 'Hello', 'hello', 'UTF-8',        true),
            array('hello', 'Hello', 'Hello', 'UTF-8',        true),
            array('hEllo', 'HEllo', 'hEllo', 'UTF-8',        true),
            array('a',     'A',     'a',     'UTF-8',        true),
            array('a',     'A',     'A',     'UTF-8',        true),
            array('apple', 'Apple', 'apple', 'UTF-8',        true),
            array('apple', 'Apple', 'Apple', 'UTF-8',        true),
            array('applé', 'Applé', 'applé', 'UTF-8',        true),
            array('applé', 'Applé', 'Applé', 'UTF-8',        true),
            array('åpplé', 'Åpplé', 'åpplé', 'UTF-8',        true),
            array('åpplé', 'Åpplé', 'Åpplé', 'UTF-8',        true),
            array('á',     'Á',     'á',     'UTF-8',        true),
            array('á',     'Á',     'Á',     'UTF-8',        true),
            array('1234',  '1234',  '1234',  'UTF-8',        true),
            array('和平',   '和平',  '和平',   'UTF-8',        true),
            array('hello', 'Hello', 'hello', 'ISO-8859-1',   true),
            array('hello', 'Hello', 'hello', 'ISO-8859-1',   true),
            array('hello', 'Hello', 'Hello', 'ISO-8859-1',   true),
            array('hEllo', 'HEllo', 'hEllo', 'ISO-8859-1',   true),
            array('a',     'A',     'a',     'ISO-8859-1',   true),
            array('a',     'A',     'A',     'ISO-8859-1',   true),
            array('apple', 'Apple', 'apple', 'ISO-8859-1',   true),
            array('apple', 'Apple', 'Apple', 'ISO-8859-1',   true),
            array('applé', 'Applé', 'applé', 'ISO-8859-1',   true),
            array('applé', 'Applé', 'Applé', 'ISO-8859-1',   true),
            array('hello', 'Hello', 'hello', null,           true),
            array('hello', 'Hello', 'hello', null,           true),
            array('hello', 'Hello', 'Hello', null,           true),
            array('hEllo', 'HEllo', 'hEllo', null,           true),
            array('a',     'A',     'a',     null,           true),
            array('a',     'A',     'A',     null,           true),
            array('apple', 'Apple', 'apple', null,           true),
            array('apple', 'Apple', 'Apple', null,           true),
        );
    }

    /**
     * @dataProvider providerUcFirstAndLcFirst
     * @param string $expectedLc
     * @param string $expectedUc
     * @param string $string
     * @param string $encoding
     * @param string $equal
     */
    public function testUcFirst(
        /** @noinspection PhpUnusedParameterInspection */
        $expectedLc, $expectedUc, $string, $encoding, $equal) {
        $fnUcFirst = fnUcFirst($encoding);
        if ($equal) {
            $this->assertEquals($expectedUc, $fnUcFirst($string));
        } else {
            $this->assertNotEquals($expectedUc, $fnUcFirst($string));
        }
    }

    /**
     * @dataProvider providerUcFirstAndLcFirst
     * @param string $expectedLc
     * @param string $expectedUc
     * @param string $string
     * @param string $encoding
     * @param string $equal
     */
    public function testLcFirst($expectedLc, /** @noinspection PhpUnusedParameterInspection */
                                $expectedUc, $string, $encoding, $equal) {
        $fnUcFirst = fnLcFirst($encoding);
        if ($equal) {
            $this->assertEquals($expectedLc, $fnUcFirst($string));
        } else {
            $this->assertNotEquals($expectedLc, $fnUcFirst($string));
        }
    }


    public function providerTrim() {
        return array(
            array("\t\tmiddle\t\t"),
            array("\t\t some words \n \t\t"),
            array("Start Here\n\t\t"),
            array("\t\t\nEnd Here"),
            array("  \nMulti\nLine\nTest\n"),
            array("  \nMultî\nLiné\nเมืองนี้เป็น สถานที่ที่ \n"),
        );
    }

    /**
     * @param string $value
     * @dataProvider providerTrim
     */
    public function testTrim($value) {
        $fnTrim = fnTrim();
        $this->assertInstanceOf('\Closure', $fnTrim);
        $this->assertEquals(trim($value), $fnTrim($value));
    }

    /**
     * @param string $value
     * @dataProvider providerTrim
     */
    public function testTrimLeft($value) {
        $fnTrim = fnTrimLeft();
        $this->assertInstanceOf('\Closure', $fnTrim);
        $this->assertEquals(ltrim($value), $fnTrim($value));
    }

    /**
     * @param string $value
     * @dataProvider providerTrim
     */
    public function testTrimRight($value) {
        $fnTrim = fnTrimRight();
        $this->assertInstanceOf('\Closure', $fnTrim);
        $this->assertEquals(rtrim($value), $fnTrim($value));
    }

    /**
     * @param string $value
     * @dataProvider providerTrim
     */
    public function testStrLen($value) {
        $fnStrLen = fnStrLen();
        $this->assertInstanceOf('\Closure', $fnStrLen);
        $this->assertEquals(strlen($value), $fnStrLen($value));
    }

    /**
     * @param string $value
     * @dataProvider providerTrim
     */
    public function testMbStrLen($value) {
        $fnStrLen = fnMbStrLen();
        $this->assertInstanceOf('\Closure', $fnStrLen);
        $this->assertEquals(mb_strlen($value), $fnStrLen($value));
    }

    /**
     * @param string $value
     * @dataProvider providerTrim
     */
    public function testStringConcat($value) {
        $fn = fnStringConcat($value);
        $this->assertInstanceOf('\Closure', $fn);
        $this->assertEquals('['.$value.']', $fn('[',']'));
        $this->assertEquals($value.']', $fn('',']'));
    }


}

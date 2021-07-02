<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 26/07/2015
 * Time: 17:20
 */

namespace Revinate\Sequence;


use PHPUnit\Framework\TestCase;

class FnBindTest extends TestCase {


    public function testFnBindFieldsToParams() {
        $record = array(
            'a' => 'a',
            'b' => 'b',
            'c' => 'c',
        );

        $fnEchoParams = static function() {
            return func_get_args();
        };

        $paramMap = array('a','b','c');
        $fn = FnBind::fnBindFieldsToParams($fnEchoParams, $paramMap);
        $this->assertEquals($paramMap, $fn($record));

        $paramMap = array('b','b','c');
        $fn = FnBind::fnBindFieldsToParams($fnEchoParams, $paramMap);
        $this->assertEquals($paramMap, $fn($record));

        $paramMap = array('c','a','b');
        $fn = FnBind::fnBindFieldsToParams($fnEchoParams, $paramMap);
        $this->assertEquals($paramMap, $fn($record));
    }

    public function testFnBind() {
        $sentence = 'The quick brown fox jumps over the lazy dog';
        $fn = FnBind::fnBind('strpos', $sentence);

        $word = 'brown';

        $this->assertEquals(strpos($sentence, $word), $fn($word));
    }


}

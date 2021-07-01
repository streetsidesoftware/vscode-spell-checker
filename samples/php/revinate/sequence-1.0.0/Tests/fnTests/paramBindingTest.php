<?php

namespace Revinate\Sequence;

use PHPUnit\Framework\TestCase;
use \Revinate\Sequence\func;

class ParamBindingTest extends TestCase {

    public function testFnPipe() {
        $fn = static function($v) { return $v + 1; };

        $fnChain = func\fnPipe($fn, $fn, $fn, $fn);

        $this->assertEquals(9, $fnChain(5));
    }

    public function testFnPipeWithMultipleArgumentsInFirstFunction() {
        $fnAdd = static function ($a, $b) { return $a + $b; };
        $fnIncrease = static function($v) { return $v + 1; };

        $fnChain = func\fnPipe($fnAdd, $fnIncrease, $fnIncrease, $fnIncrease);

        $this->assertEquals(8, $fnChain(2, 3));
    }
}

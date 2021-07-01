<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 30/08/15
 * Time: 22:38
 */

namespace Revinate\Sequence\func;

use PHPUnit\Framework\TestCase;
use Revinate\Sequence\Test\FancyArray;
use Revinate\Sequence\TestAccessClass;

require_once 'TestAccessClass.php';
require_once 'FancyArray.php';

class FiltersTest extends TestCase {
    public function testNot() {
        $fnNot = fnNot();

        $this->assertInternalType('bool', $fnNot(true));
        $this->assertFalse($fnNot(true));
        $this->assertFalse($fnNot(1));
        $this->assertFalse($fnNot(100));
        $this->assertFalse($fnNot('Hello'));
        $this->assertTrue($fnNot(false));
        $this->assertTrue($fnNot(0));
        $this->assertTrue($fnNot(null));
        $this->assertTrue($fnNot(''));
        $this->assertTrue($fnNot('0'));

        $fnNotNot = fnNot(fnNot());
        $this->assertInternalType('bool', $fnNotNot(true));
        $this->assertTrue($fnNotNot(true));
        $this->assertTrue($fnNotNot(1));
        $this->assertTrue($fnNotNot(100));
        $this->assertTrue($fnNotNot('Hello'));

        $this->assertFalse($fnNotNot(false));
        $this->assertFalse($fnNotNot(0));
        $this->assertFalse($fnNotNot(null));
        $this->assertFalse($fnNotNot(''));
        $this->assertFalse($fnNotNot('0'));
    }

    public function testFnInstanceOf() {
        $fnIsInstanceOfTestAccessClass = fnInstanceOf('\Revinate\Sequence\TestAccessClass');

        $fancyArray = new FancyArray();
        $testAccessClass = new TestAccessClass();

        $this->assertTrue($fnIsInstanceOfTestAccessClass($testAccessClass));
        $this->assertFalse($fnIsInstanceOfTestAccessClass($fancyArray));
        $this->assertFalse($fnIsInstanceOfTestAccessClass(5));
        $this->assertFalse($fnIsInstanceOfTestAccessClass('\Revinate\Sequence\TestAccessClass'));

    }

    public function testFnMatch() {
        $fnMatch = fnPregMatch('/^as\d+df$/');
        $this->assertTrue($fnMatch('as1df'));
        $this->assertFalse($fnMatch('asdf'));
        $this->assertFalse($fnMatch(' as123df'));
    }

}

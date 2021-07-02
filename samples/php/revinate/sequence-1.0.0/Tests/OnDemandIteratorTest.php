<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 24/07/2015
 * Time: 16:59
 */

namespace Revinate\Sequence;


use PHPUnit\Framework\TestCase;

class OnDemandIteratorTest extends TestCase {

    public function testBinding() {
        $count = 0;
        $data = array(1,2,3,4,5,6);
        $fnGetIterator = static function() use (&$count, $data) {
            ++$count;
            return new \ArrayIterator($data);
        };

        $onDemandIterator = new OnDemandIterator($fnGetIterator);
        $this->assertEquals(0, $count);

        $seq = Sequence::make($onDemandIterator);
        // Assert that the iterator wasn't called
        $this->assertEquals(0, $count);
        $result = $seq->to_a();
        // Assert that the iterator was called just once
        $this->assertEquals(1, $count);
        // Make sure the value are as expected
        $this->assertEquals($data, $result);
    }
}

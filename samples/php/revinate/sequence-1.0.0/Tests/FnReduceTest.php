<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 23/07/2015
 * Time: 21:01
 */

namespace Revinate\Sequence;


use PHPUnit\Framework\TestCase;

class FnReduceTest extends TestCase {
    public function testFnSum() {
        $range = range(0, 100);
        $this->assertEquals(array_sum($range), Sequence::make($range)->reduce(0, FnGen::fnSum()));

        $fruit = array(
            array('name'=>'apple',  'count'=>1),
            array('name'=>'orange', 'count'=>5),
            array('name'=>'apple',  'count'=>3),
            array('name'=>'banana', 'count'=>9),
        );

        $this->assertEquals(18,
            Sequence::make($fruit)
                ->reduce(0, FnReduce::fnSum(
                    FnGen::fnPluck('count', 0)
                )));
    }

    public function testFnAvg() {
        $range = range(1, 10);
        $this->assertEquals(5.5, Sequence::make($range)->reduce(0, FnGen::fnAvg()));

        $fruit = array(
            array('name'=>'apple',  'count'=>1),
            array('name'=>'orange', 'count'=>5),
            array('name'=>'apple',  'count'=>3),
            array('name'=>'banana', 'count'=>9),
            array('name'=>'Out of Stock'),
            array('name'=>'orange', 'count'=>5),
        );

        $counts = Sequence::make($fruit)->map(FnGen::fnPluck('count'))->filter(FnGen::fnKeepIsSet())->to_a();
        $avg = array_sum($counts) / count($counts);

        $avg2 = Sequence::make($fruit)
            ->reduce(0, FnReduce::fnAvg(
                FnGen::fnPluck('count')
            ));

        $this->assertEquals($avg, $avg2);
    }

    public function testFnMax() {
        $fn = FnReduce::fnMax();
        $this->assertEquals(55, $fn(null, 55));
        $this->assertEquals(55, $fn(55, null));
        $this->assertEquals(-42, $fn(null, -42));
        $this->assertEquals(-42, $fn(-42, null));
        $this->assertEquals(2, $fn(2, -42));
        $this->assertEquals(2, $fn(-42, 2));
        $this->assertEquals(0, $fn(null, 0));
        $this->assertEquals(0, $fn(0, null));
    }

    public function testFnMin() {
        $fn = FnReduce::fnMin();
        $this->assertEquals(55, $fn(null, 55));
        $this->assertEquals(55, $fn(55, null));
        $this->assertEquals(-42, $fn(null, -42));
        $this->assertEquals(-42, $fn(2, -42));
        $this->assertEquals(-42, $fn(-42, 2));
        $this->assertEquals(0, $fn(null, 0));
        $this->assertEquals(0, $fn(0, null));
    }



}

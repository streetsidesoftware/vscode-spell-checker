<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 23/03/15
 * Time: 13:00
 */

namespace Revinate\Sequence;

use PHPUnit\Framework\TestCase;

class FilteredSequenceTest extends TestCase {


    /**
     * These functions are to make sure the basic IterationTraits are passed through.
     */
    public function testIterationTraits() {
        $values = range(1,100,1);

        $fn =  static function($v){ return $v % 2; };

        $filteredValues = Sequence::make($values)->filter($fn)->to_a();

        $this->assertEquals(Sequence::make($values)->filter($fn)->to_a(), Sequence::make($filteredValues)->to_a());


        // Test map
        $fnMap = static function($v) { return $v * 2; };
        $this->assertEquals(Sequence::make($values)->filter($fn)->map($fnMap)->to_a(), Sequence::make($filteredValues)->map($fnMap)->to_a());

        // Test Filter
        $fnFilter = static function($v) { return ($v-1) % 4; };
        $this->assertEquals(Sequence::make($values)->filter($fn)->filter($fnFilter)->to_a(), Sequence::make($filteredValues)->filter($fnFilter)->to_a());

        // Test Values
        $this->assertEquals(Sequence::make($values)->filter($fn)->values()->to_a(), Sequence::make($filteredValues)->values()->to_a());

        // Test Walk and reduce
        $sumWalk = 0;
        $fnWalk = static function($v) use (&$sumWalk) { $sumWalk += $v; };
        Sequence::make($values)->filter($fn)->walk($fnWalk);

        $fnReduce = static function($sum, $v) { return $sum + $v; };
        $this->assertEquals($sumWalk, Sequence::make($filteredValues)->reduce(0, $fnReduce));
        $this->assertEquals($sumWalk, Sequence::make($values)->filter($fn)->reduce(0, $fnReduce));

        // Test Keys
        $this->assertEquals(Sequence::make($values)->filter($fn)->keys()->to_a(), Sequence::make($filteredValues)->keys()->to_a());
    }

    public function testInterviewQuestionA() {
        /*
            The sum of all natural numbers below 10 that are multiples of 3 or 5 are 23 (3 + 5 + 6 + 9)
            Write a php script that will find the sum of all the multiples of 3 or 5 below 1000. The script
            should run from command line and put the result on screen. We will judge this task based on
            simplicity, efficiency and cleverness of the code.
         */
        $limit = 1000;
        $values = range(0, $limit);
        $a = 3;
        $b = 5;

        $fnFilterMaker = static function($a, $b) { return static function($v) use ($a, $b) { return ($v % $a == 0) || ($v % $b == 0); }; };

        // test: sum of multiples of 3 or 5 below 10 is 23 (3 + 5 + 6 + 9)
        $this->assertEquals(
            Sequence::make(range(0, 9))
                ->filter($fnFilterMaker(3, 5))
                ->reduce(0, FnGen::fnSum()), 23);

        $filteredValues = Sequence::make($values)->filter($fnFilterMaker($a, $b))->to_a();
        $this->assertArrayHasKey($a, $filteredValues);
        $this->assertArrayHasKey($b, $filteredValues);
        $this->assertArrayNotHasKey($a * $b + 1, $filteredValues);

        $valuesOnly = array_values($filteredValues);

        $subsetA = range(0, $limit, $a);
        $subsetB = range(0, $limit, $b);

        $this->assertEquals($subsetA, array_values(array_intersect($valuesOnly, $subsetA)));
        $this->assertEquals($subsetB, array_values(array_intersect($valuesOnly, $subsetB)));
        $this->assertNotTrue(count(array_diff($valuesOnly, $subsetA, $subsetB)));
    }
}

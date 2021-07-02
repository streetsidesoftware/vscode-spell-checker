<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/06/15
 * Time: 15:28
 */

namespace Revinate\Sequence;

class TestData {
    public static $fruit  = array(
        array('name' => 'apple', 'count' => 5),
        array('name' => 'orange', 'count' => 15),
        array('name' => 'banana', 'count' => 25),
        array('name' => 'orange', 'count' => 6),
        array('name' => 'pear', 'count' => 2),
        array('name' => 'apple', 'count' => 6),
        array('name' => 'grape', 'count' => 53),
        array('name' => 'apple', 'count' => 10),
    );
    public static $people = array(
        array('name' => 'Terry', 'age' => 22),
        array('name' => 'Bob', 'age' => 30),
        array('name' => 'Sam', 'age' => 19),
        array('name' => 'Robert', 'age' => 55),
        array('group' => 'student'),
    );
    public static $hotel = array(
        'hotel' => array(
            'id' => 1,
            'name' => 'Fancy Hotel',
            'rooms' => 200,
            'survey' => array(
                'qcount' => 3,
                'questions' => array(
                    'qid' => 1,
                    'Do you like my hotel?',
                    'Why not?',
                    'Where would you rather go?'
                )
            ),
            'ranking' => 5
        )
    );

    public static $matrix3x3 = array(
        array(1,2,3),
        array(4,5,6),
        array(7,8,9),
    );

    public static $matrix2x3 = array(
        array(1,2),
        array(3,4),
        array(5,6)
    );

    public static $matrix3x2 = array(
        array(1,3,5),
        array(2,4,6),
    );
}
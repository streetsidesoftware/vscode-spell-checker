<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 30/08/15
 * Time: 18:06
 */
namespace Revinate\Sequence\Tutorial;

require_once __DIR__.'/../vendor/autoload.php';

use Revinate\Sequence\Sequence;
use Revinate\Sequence\func;
use Revinate\Sequence\Tutorial\SampleDataLoader;

function employeeExample1() {

    $employees = SampleDataLoader::getEmployees(true);

    // Assignment -- get a list of employees names

    // Get a list of employees foreach
    $names = array();
    foreach ($employees as $employee) {
        $names[] = $employee['firstName'];
    }
    print_r($names);

    // Using a sequence
    $names2 = Sequence::make($employees)
        ->pluck('firstName')
        ->to_a();

    print_r($names2);
}


employeeExample1();


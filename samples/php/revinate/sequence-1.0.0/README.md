# Sequence [![Build Status](https://travis-ci.org/revinate/sequence.svg)](https://travis-ci.org/revinate/sequence)

This library makes it easier to use functional style programming in PHP

## PHP Backward Compatibility

As we move our codebase forward, it is no longer possible for us to support older versions of PHP.
With release version 1.0 and onward, we will stop supporting PHP 5.3 and PHP 5.4.

## Quick Example

Install the package via composer by adding this section to the composer.json file:

```JSON
"require": {
    "revinate/sequence": "~0.4"
},
```

This is a tiny script to get a feeling of how Sequence works.

```php
<?php
require_once __DIR__.'/vendor/autoload.php';

use Revinate\Sequence\Sequence;

$dataSet = array(1, 2, 3, 4, 5);
$seq = Sequence::make($dataSet);

// At this point you have a sequence and you can do bunch of cool sequence stuff with it

$even = $seq->filter(static function($n) { return $n%2 == 0; });  // nothing is evaluated here because of lazy loading
foreach($even as $num) {
    echo "$num\n";
}


$twice = $seq->map(static function($n) { return $n * 2; });
foreach($twice as $num) {
    echo "$num\n";
}
```

and the output of this program will be:

    2
    4
    2
    4
    6
    8
    10

This is just a tiny bit of all the things that can be accomplished with Sequence.
For a more detailed documentation, see [Wiki](https://github.com/revinate/sequence/wiki/Sequence-Functional-Library)

## How to get involved

First clone the repo and install the dependencies

```Bash
git clone https://github.com/revinate/sequence.git
composer install
```

and then run the tests:

```Bash
phpunit
```

That's all you need to start working on Sequence. Please, include tests in your pull requests.

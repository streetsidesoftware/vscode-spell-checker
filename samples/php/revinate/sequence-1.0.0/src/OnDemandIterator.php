<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 24/07/2015
 * Time: 16:54
 */

namespace Revinate\Sequence;


class OnDemandIterator implements \Iterator {
    /** @var  \Closure|callable */
    protected $fnGetIterator;
    protected $iterator = null;

    public function __construct($fnGetIterator) {
        $this->fnGetIterator = $fnGetIterator;
    }

    /**
     * @return \Iterator
     */
    public function getIterator() {
        if (is_null($this->iterator)) {
            $fn = $this->fnGetIterator;
            $this->iterator = $fn();
        }

        return $this->iterator;
    }

    public function current() {
        return $this->getIterator()->current();
    }

    public function next() {
        $this->getIterator()->next();
    }

    public function key() {
        return $this->getIterator()->key();
    }

    public function valid() {
        return $this->getIterator()->valid();
    }

    public function rewind() {
        $this->getIterator()->rewind();
    }
}

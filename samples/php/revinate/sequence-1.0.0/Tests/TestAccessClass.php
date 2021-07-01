<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 24/07/2015
 * Time: 18:57
 */

namespace Revinate\Sequence;


class TestAccessClass {
    protected $protected = 'protected';
    public $public = 'public';
    private $private = 'private';

    public function setPrivateField($value) {
        $this->private = $value;
        return $this;
    }

    public function getPrivateField() {
        return $this->private;
    }
}

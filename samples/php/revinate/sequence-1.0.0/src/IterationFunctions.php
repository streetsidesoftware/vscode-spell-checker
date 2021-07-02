<?php

namespace Revinate\Sequence;

/**
 * Interface IterationFunctions
 * @author jasondent
 * @package Revinate\Sequence
 */
interface IterationFunctions {
    public function map($fnValueMap, $fnKeyMap = null);
    public function mapKeys($fnKeyMap);
    public function filter($fn);
    public function filterKeys($fn);
    public function reduce($init, $fn);
    public function to_a();
    public function keys();
    public function values();
    public function limit($limit);
    public function offset($offset);
    public function walk($fn);
}
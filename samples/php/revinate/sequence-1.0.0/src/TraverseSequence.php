<?php

namespace Revinate\Sequence;

class TraverseSequence extends RecursiveSequence
{
    protected $path;
    protected $pathSeparator = '.';

    /**
     * @param $iterator
     * @param null|string $path
     * @param string $pathSeparator
     * @return TraverseSequence
     */
    public static function make($iterator, $path = null, $pathSeparator = '.')
    {
        /** @var TraverseSequence $traverseSequence */
        $traverseSequence = parent::make($iterator);
        $traverseSequence->pathSeparator = $pathSeparator;
        $traverseSequence->path = is_null($path) ? '' : $path . $pathSeparator;
        return $traverseSequence;
    }

    /**
     * @return TraverseSequence|MappedSequence
     */
    public function getChildren()
    {
        $x = $this->current();
        if ($this->canGoDeeper()) {
            return self::make($x, $this->key(), $this->pathSeparator)->setMaxDepth($this->depth - 1);
        } else {
            return IterationTraits::map(
                Sequence::make($x),
                FnGen::fnIdentity(),
                FnString::fnAddPrefix($this->key() . $this->pathSeparator)
            );
        }
    }

    /**
     * @return string
     */
    public function key()
    {
        $key = parent::key();
        return $this->path . $key;
    }
}

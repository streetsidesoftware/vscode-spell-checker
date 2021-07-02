<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 24/07/2015
 * Time: 18:32
 */

namespace Revinate\Sequence;

use \ArrayAccess;

use Revinate\GetterSetter as gs;

class ArrayUtil {

    /**
     * @param array|ArrayAccess|object $doc
     * @param string $fieldName
     * @param null|mixed $default
     * @return mixed
     * @throws gs\UnableToGetFieldException
     */
    public static function getField($doc, $fieldName, $default = null) {
        return gs\getValue($doc, $fieldName, $default);
    }

    /**
     * @param array|ArrayAccess|object $doc
     * @param string $fieldName
     * @param mixed $value
     * @return array|ArrayAccess|object
     * @throws gs\UnableToSetFieldException
     */
    public static function setField($doc, $fieldName, $value) {
        return gs\setValue($doc, $fieldName, $value);
    }

    /**
     * @param array|ArrayAccess|object $doc
     * @param string[] $path
     * @param null|mixed $default
     * @return mixed
     * @throws gs\UnableToGetFieldException
     */
    public static function getPath($doc, $path, $default = null) {
        return gs\get($doc, $path, $default);
    }

    /**
     * @param array|ArrayAccess|object $doc
     * @param string[] $path -- array of field names
     * @param mixed $value
     * @return array|ArrayAccess|object
     * @throws gs\UnableToSetFieldException
     */
    public static function setPath($doc, $path, $value) {
        return gs\set($doc, $path, $value);
    }
}

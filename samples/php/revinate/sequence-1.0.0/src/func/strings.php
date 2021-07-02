<?php
/**
 * Created by PhpStorm.
 * User: jasondent
 * Date: 29/08/15
 * Time: 11:22
 */

namespace Revinate\Sequence\func;
use \Closure;

/**
 * Returns a function that trims the value.
 *
 * @return Closure
 */
function fnTrim() {
    return static function ($v) {
        return trim($v);
    };
}

/**
 * Returns a function that trims spaces form the left.
 *
 * @return Closure
 */
function fnTrimLeft() {
    return static function ($v) {
        return ltrim($v);
    };
}

/**
 * Returns a function that trims spaces from the right.
 *
 * @return Closure
 */
function fnTrimRight() {
    return static function ($v) {
        return rtrim($v);
    };
}

/**
 * Returns a function that removes a suffix from a string if it exists
 *
 * @param   string $suffix
 * @return  Closure
 */
function fnRemoveSuffix($suffix) {
    return static function ($val) use ($suffix) {
        return preg_replace('/' . preg_quote($suffix, '/') . '$/', '', $val);
    };
}

/**
 * Returns a function that removes a prefix from a string if it exists
 *
 * @param   string $prefix
 * @return  Closure
 */
function fnRemovePrefix($prefix) {
    return static function ($val) use ($prefix) {
        return preg_replace('/^' . preg_quote($prefix, '/') . '/', '', $val);
    };
}

/**
 * Returns a function that prefixes a string
 *
 * @param $prefix
 * @return Closure
 */
function fnAddPrefix($prefix) {
    return static function ($val) use ($prefix) {
        return $prefix . $val;
    };
}

/**
 * Returns a function that postfixes a string
 *
 * @param $postfix
 * @return Closure
 */
function fnAddPostfix($postfix) {
    return static function ($val) use ($postfix) {
        return $val . $postfix;
    };
}

/**
 * @param string|null $encoding
 * @return \Closure
 */
function fnToUpper($encoding = null) {
    return fnConvertCase(MB_CASE_UPPER, $encoding);
}

/**
 * @param string|null $encoding
 * @return \Closure
 */
function fnToLower($encoding = null) {
    return fnConvertCase(MB_CASE_LOWER, $encoding);
}

/**
 * Generate a function that will take a string $subject and apply preg_replace using $pattern and $replace
 *
 * @param string $pattern
 * @param string $replace
 * @return \Closure
 */
function fnPregReplace($pattern, $replace) {
    return static function ($subject) use ($pattern, $replace) {
        return preg_replace($pattern, $replace, $subject);
    };
}

/**
 * @param int $mode  -- MB_CASE_TITLE, MB_CASE_UPPER, MB_CASE_LOWER
 * @param null $encoding
 * @return \Closure
 */
function fnConvertCase($mode, $encoding = null) {
    if ($encoding) {
        return static function ($subject) use ($mode, $encoding) {
            return mb_convert_case($subject, $mode, $encoding);
        };
    }
    return static function ($subject) use ($mode) {
        return mb_convert_case($subject, $mode);
    };
}

/**
 * @param null $encoding
 * @return \Closure
 */
function fnTitleCase($encoding = null) {
    return fnConvertCase(MB_CASE_TITLE, $encoding);
}

/**
 * Alias of fnTitleCase()
 *
 * @param null $encoding
 * @return \Closure
 */
function fnUcWords($encoding = null) {
    return fnTitleCase($encoding);
}

/**
 * @param null $encoding
 * @return \Closure
 */
function fnCamelCase($encoding = null) {
    return fnCallChain(
        fnPregReplace('|_|', ' '),
        fnTitleCase($encoding),
        fnPregReplace('|\s|', '')
    );
}

/**
 * @param null $encoding
 * @return mixed
 */
function fnSnakeCase($encoding = null) {
    $encoding = $encoding ?: mb_internal_encoding();
    $pattern = '|(\w)(?=[A-Z])|';
    if ($encoding == 'UTF-8') {
        $pattern = '/(\p{L}|\w)(?=\p{Lu})/u';
    }
    return fnCallChain(
        fnPregReplace($pattern, '$1_'),  // Add a _ after any word character followed by a upper case character.
        fnToLower($encoding)
    );
}

/**
 * @param $encoding
 * @return \Closure
 */
function fnUcFirst($encoding = null) {
    $encoding = $encoding ?: mb_internal_encoding();
    $pattern = '||';
    if ($encoding == 'UTF-8') {
        $pattern = '||u';
    }

    return static function ($string) use ($encoding, $pattern) {
        $parts = preg_split($pattern, $string, 2, PREG_SPLIT_NO_EMPTY);
        $parts[0] = mb_strtoupper($parts[0], $encoding);
        return implode('', $parts);
    };
}

/**
 * @param $encoding
 * @return \Closure
 */
function fnLcFirst($encoding = null) {
    $encoding = $encoding ?: mb_internal_encoding();
    $pattern = '||';
    if ($encoding == 'UTF-8') {
        $pattern = '||u';
    }

    return static function ($string) use ($encoding, $pattern) {
        $parts = preg_split($pattern, $string, 2, PREG_SPLIT_NO_EMPTY);
        $parts[0] = mb_strtolower($parts[0], $encoding);
        return implode('', $parts);
    };
}

/**
 * @return Closure
 */
function fnStrLen() {
    return static function ($str) {
        return strlen($str);
    };
}

/**
 * @param null|string $encoding -- @see mb_strlen
 * @return Closure
 */
function fnMbStrLen($encoding = null) {
    $encoding = $encoding ?: mb_internal_encoding();
    return static function ($str) use ($encoding) {
        return mb_strlen($str, $encoding);
    };
}

/******************************
 * Reduce functions
 */

/**
 * @param string $glue
 * @return Closure
 */
function fnStringConcat($glue = '') {
    return static function($a, $b) use ($glue) {
        return $a . $glue . $b;
    };
}

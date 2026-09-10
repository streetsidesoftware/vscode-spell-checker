---
id: how-it-works
title: How code is analyzed
sidebar_position: 5
description: 'How identifiers are split and which text is excluded from checking.'
---

# How code is analyzed

The spell checker is designed to report genuine spelling errors in source code while keeping
the number of false reports low.

## Identifiers are split into words

Compound identifiers are separated before each part is checked:

| Identifier         | Checked as       |
| ------------------ | ---------------- |
| `camelCase`        | camel case       |
| `HTMLInput`        | html input       |
| `snake_case_words` | snake case words |
| `camel2snake`      | camel snake      |

### All-capital words

Trailing `s`, `ing`, `ies`, `es`, and `ed` are retained with the preceding word, so
`CURLs` is checked as _curls_ and `CURLedRequest` as _curled request_.

## What is not checked

- Words of three characters or fewer.
- All symbols and punctuation.
- URLs, hex values, escape characters, and Base64 blocks longer than 40 characters.
- Email addresses.

## Known limitations

- Checking is case insensitive: `english` is not reported in place of _English_.
- The dictionaries contain omissions, and occasionally errors.
- Compound word support is set per file, not per region.

The full list of predefined include and exclude patterns is documented in the
[Reference](/docs/reference#predefined-regexp-expressions).

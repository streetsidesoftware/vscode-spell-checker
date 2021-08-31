---
layout: default
title: About
nav_order: 9
permalink: /about/
---

# About

When we started using VS Code, it did not have a spell checker. As a person that has trouble with spelling, I found this to be a great hinderance, thus the extension was born.
At the suggestion of users, [`cspell`](https://github.com/streetsidesoftware/cspell) was pulled out of the extension and into its own library and command line tools.

## Goals

The goal was to have a fast spell checker that could check spelling as you type.

- Fast - check as you type
- Self-contained - a pure JS implementation - does not need external binaries or to talk to a web service.
- Compact - the size of the spell checker should not be much bigger than the comparable Hunspell dictionary.
- Configurable - much of CSpell is configured through `cspell.json` files.
- Custom Dictionaries - custom dictionaries can be easily added and used.

## Supporting Development

- Become a [![Patreon](./assets/images/patreon/Digital-Patreon-Logo_FieryCoral_16x16.png) Patreon!](https://patreon.com/streetsidesoftware)
- Support through [![PayPal](./assets/images/PayPal/paypal-logo-wide-18.png)](https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY)

<!---
cspell:ignore paypal
--->

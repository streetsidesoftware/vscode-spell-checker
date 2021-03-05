# Spell Checker Server

The spell checker server does all the spell checking in the background.
This keeps VS Code responsive while files are being spell checked.

The server provides the interface between the client running in VS Code and the cspell library.
Since server stays running between requests to spell check files, it is able to take advantage of
`cspell-lib` dictionary caching. This greatly reduces the overhead of spell checking individual files.

## Problem

The server is currently hard bundled with the VS Code Spell Checker extension. This means that
every time that `cspell` is updated or a dictionary is improved, it is necessary to release a new
version of the extension.

## Proposal

Publish a NPM package that contains the server and allow the Spell Checker client to be configured to
use the local `node_modules` copy of the server. That way it is easier for users that have `cspell` as part
of their CI/CD pipeline to keep everything on the same version.

Note: Major version changes will still need a new release of the Spell Checker extension.

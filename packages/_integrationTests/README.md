# Code Spell Checker Integration Tests

The tests are located in their own package because they use Mocha for the tests while the rest of the extension uses Jest.
It was not an easy task to get Integration Tests to use Jest.

## Notes

There will be some minor warnings of the form:

```
Could not identify extension for 'vscode' require call from ...
```

These are cause because we are running the test runner from a different copy of vscode than the one use by the extension. It can be safely ignored.

## Environment Variables

-   `VSIX_LOCATION` - tell the test runner to use a pre-made .vsix file.
-   `VSCODE_VERSION` - tell the test runner which version of vscode to download.

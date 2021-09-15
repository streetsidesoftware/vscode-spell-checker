# Package JSON Dependency Updater

This tool goes through ALL the workspace `package.json` files and updates any dependencies that are
found in the `yarn.lock` file with the version in the `yarn.lock`.

The logic is that ALL `package.json` file dependencies should match the ones used during the testing
and development process. It is incorrect to say that our library can use an earlier version of a package
when in fact it was never tested.

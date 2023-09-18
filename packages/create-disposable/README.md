# Disposables

This library is to help with creating Disposables that support both VSCode Disposables and the proposed [Symbol.dispose](https://github.com/tc39/proposal-explicit-resource-management).

See:

-   [TypeScript 5.2 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/#using-declarations-and-explicit-resource-management)
-   [tc39/proposal: ECMAScript Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management)

This module will polyfill `Symbol.dispose` if necessary.

If you wish to use the `using` feature, you will need to install `tslib`.

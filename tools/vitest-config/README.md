# Vitest Configuration

This is the shared configuration for this repo.

## Usage

Add file:

**`vitest.config.mts`**

```ts
import baseConfig from '@internal/vitest-config';
export default baseConfig;
```

## Hoisting `vitest`

This package is also used to hoist the `vitest` dependencies.

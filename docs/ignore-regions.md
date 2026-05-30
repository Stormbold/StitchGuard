# Ignore Regions

Dynamic content (timestamps, avatars, skeleton loaders) can cause false positives. Use `ignoreRegions` in your config to mask areas before comparison.

```typescript
import { defineConfig } from '@stitchguard/config';

export default defineConfig({
  compare: {
    ignoreRegions: [
      {
        name: 'status-bar-time',
        x: 0,
        y: 0,
        width: 390,
        height: 44,
      },
      {
        name: 'dynamic-avatar',
        x: 320,
        y: 80,
        width: 48,
        height: 48,
      },
    ],
  },
});
```

Ignored regions copy actual pixels onto the target before diffing, so those areas do not affect the score.

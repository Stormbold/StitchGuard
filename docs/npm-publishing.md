# npm publishing strategy

## Today (from source)

The CLI lives in `@stitchguard/cli`. From a clone:

```bash
git clone https://github.com/Stormbold/StitchGuard.git
cd StitchGuard
pnpm install
pnpm build
pnpm stitchguard compare design.png actual.png
```

There is **no** published npm package yet — do not use `npx stitchguard` until [issue: npm publish] is closed.

## Recommended path (Variant A — marketing)

Publish an unscoped package named **`stitchguard`** that re-exports `@stitchguard/cli`:

```bash
npx stitchguard compare design.png actual.png
```

Steps:

1. Add publish workflow (`.github/workflows/publish-npm.yml`)
2. Configure npm org/token as GitHub secret `NPM_TOKEN`
3. Set `packages/cli` `"name": "stitchguard"` for publish artifact OR thin wrapper package
4. Tag releases with semver (`v0.1.0`, …)

## Alternative (Variant B — simpler)

Publish scoped only:

```bash
npx @stitchguard/cli compare design.png actual.png
```

Easier in monorepo; slightly harder to remember.

## Current recommendation

Ship **Variant A** before social launch. Until then, README and docs link to clone + `pnpm stitchguard`.

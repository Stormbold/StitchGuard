# GitHub Pages — Web Demo

Die interaktive Demo wird automatisch deployed:

**URL:** https://stormbold.github.io/StitchGuard/

## Ersteinrichtung (einmalig)

1. **Nicht** „GitHub Pages Jekyll“ oder „Static HTML“ aus den Vorschlägen wählen — unser Workflow existiert bereits.
2. Tab **Actions** → Workflow **Deploy Web Demo** → letzten Run öffnen.
3. Falls der **deploy**-Job auf Freigabe wartet: **Review deployments** → **Approve** (Environment `github-pages`).
4. Nach grünem Run: **Settings → Pages** zeigt „Your site is live at …“.

## Manuell neu deployen

Actions → Deploy Web Demo → **Run workflow**.

## Lokal bauen (wie CI)

```bash
pnpm build:demo
# Output: packages/web-demo/dist/
```

---
title: "dev-setup"
experiment: 001-demo-artifacts
created: "2026-04-15 11:16 UTC"
---

## Problem

PathFinding.js uses Gulp 3 + old devDependencies. Gulp 3 broken on Node 12+ (`primordials` error). Project pinned to `mocha@2.0.x`, `should@4.3.x` — both broken on modern Node.

## What We Did

### 1. Install dependencies
```bash
npm install
```
586 packages. Many deprecation warnings (expected — old project). No blockers.

### 2. Fix test runner

Gulp 3 can't run on Node 25 — `primordials is not defined`. Bypass entirely with direct mocha:

```bash
# This fails (Gulp 3 + Node 25):
npx gulp test

# This works:
npx mocha --require should test/**/*.js
```

Key fix: `--require should` — old `should@4.3.x` didn't augment `Object.prototype` properly on Node 25. Upgraded to `should@latest`:
```bash
npm install --save-dev should@latest
```

Result: **57/57 tests passing**.

### 3. Visual demo server

Original build pipeline (gulp-browserify) also broken. Visual demo is static HTML — serve directly:

```bash
npx http-server visual -p 8080 -c-1
```

Available at http://127.0.0.1:8080.

## Quick Reference

| Task | Command |
|------|---------|
| Run tests | `npx mocha --require should test/**/*.js` |
| Serve visual demo | `npx http-server visual -p 8080 -c-1` |

## What's NOT Working

- `gulp` — all gulp tasks broken (Gulp 3 + Node 25 incompatible)
- `gulp-browserify` build — can't produce bundled `pathfinding-browser.js`
- If browser bundle needed later, use modern bundler (esbuild/webpack) or downgrade Node via nvm

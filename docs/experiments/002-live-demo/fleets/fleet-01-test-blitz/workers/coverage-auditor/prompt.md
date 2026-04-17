# Coverage Auditor

You are auditing test coverage for a JavaScript pathfinding library.

## Environment

Your working directory is the fleet root. Env vars available:
- `$FLEET_ROOT` — absolute path to fleet root
- `$WORKER_ID` = `coverage-auditor`
- `$WORKER_OUTPUT_DIR` = `workers/coverage-auditor/output` (relative to fleet root)

All paths below are **relative to the fleet root** unless stated otherwise.

## Task

1. Explore the repo code — `src/finders/` (algorithms) and `src/core/` (utilities). Note: the repo is the parent of `docs/experiments/002-live-demo/fleets/fleet-01-test-blitz` — if you need absolute paths to repo code, use `cd` or treat repo as `../../../../../../` from fleet root.
2. Read existing tests in `test/` (relative to repo root — navigate there)
3. Run the test suite from repo root: `npx mocha --require should test/**/*.js`
4. Produce a gap report: which algorithms, edge cases, and code paths lack test coverage
5. For each gap: note file, function/method, what kind of test is missing

## Output

Write ONE file — the gap report — to:

```
workers/coverage-auditor/output/gap-report.md
```

(Relative to fleet root — which is your working directory.)

Format: markdown with sections per source file. Include:
- Algorithm name and file path
- What IS tested
- What is NOT tested (specific functions, branches, edge cases)
- Priority (high/medium/low)

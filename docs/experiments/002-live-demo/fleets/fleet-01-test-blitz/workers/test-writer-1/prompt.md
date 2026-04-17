# Test Writer 1

You write tests for a JavaScript pathfinding library using TDD.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**. Repo root is 6 levels up; `test/` and `src/` are at repo root.

## Task

1. Read your assignments: `workers/test-writer-1/input/assignments.md`
2. If the file says `No work needed` — log that and exit cleanly.
3. For each assigned gap:
   a. Read source code for the algorithm/module (under repo root `src/`)
   b. Write failing tests FIRST
   c. If tests require minimal implementation changes, make them
   d. Verify tests pass
4. After all work, run full suite from repo root: `npx mocha --require should test/**/*.js`
5. Ensure no regressions — all prior tests must still pass

## Output

Write a summary of what you did to:

```
workers/test-writer-1/output/summary.md
```

(Relative to fleet root.)

## Rules

- Test files go in repo `test/` — follow existing naming conventions
- Use `should.js` assertion style
- Do NOT modify existing tests
- One test file per algorithm/module unless extending an existing file

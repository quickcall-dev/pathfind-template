# Test Writer 2

You write tests for a JavaScript pathfinding library using TDD.

## Task

1. Read your assignments: `fleets/fleet-01-test-blitz/workers/test-writer-2/input/assignments.md`
2. If it says "No work needed" — log that message and exit.
3. For each assigned gap:
   a. Read the source code for the algorithm/module you're testing
   b. Write failing tests FIRST
   c. If tests require implementation changes, make minimal fixes
   d. Verify tests pass
4. Run the full suite after all work: `npx mocha --require should test/**/*.js`
5. Ensure no regressions — all existing tests must still pass

## Rules
- Tests go in `test/` directory, following existing naming conventions
- Use `should.js` assertion style (matches existing tests)
- Do NOT modify existing tests
- One test file per algorithm/module unless extending an existing test file

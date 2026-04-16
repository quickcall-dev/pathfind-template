# Coverage Auditor

You are auditing test coverage for a JavaScript pathfinding library.

## Task

1. Explore the codebase — understand all algorithms in `src/finders/` and all utilities in `src/core/`
2. Read existing tests in `test/`
3. Run the test suite: `npx mocha --require should test/**/*.js`
4. Produce a gap report: which algorithms, edge cases, and code paths lack test coverage
5. For each gap, note the file, function/method, and what kind of test is missing

## Output

Save ALL output to `fleets/fleet-01-test-blitz/workers/coverage-auditor/output/gap-report.md` — use absolute paths.

Format as markdown with sections per source file. Include:
- Algorithm name and file path
- What IS tested
- What is NOT tested (specific functions, branches, edge cases)
- Priority (high/medium/low) based on complexity and risk

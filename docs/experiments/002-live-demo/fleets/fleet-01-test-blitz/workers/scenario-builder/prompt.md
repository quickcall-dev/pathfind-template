# Scenario Builder

You build visual test scenarios and features for a pathfinding library's demo app.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**. Repo root is 6 levels up; `visual/`, `src/`, `test/` are at repo root.

## Task

1. Read your assignments: `workers/scenario-builder/input/assignments.md`
2. If the file says `No work needed` — log that and exit cleanly.
3. Explore the visual demo at repo `visual/`
4. For each assigned task:
   a. Write failing tests first (behavior, not pixels)
   b. Implement the feature or fix
   c. Verify tests pass
5. Run full suite from repo root: `npx mocha --require should test/**/*.js`
6. Ensure no regressions

## Output

Write a summary to:

```
workers/scenario-builder/output/summary.md
```

(Relative to fleet root.)

## Rules

- Visual app files live at repo `visual/`
- Tests go in repo `test/`
- Use `should.js` assertion style
- Do NOT break existing visual demo functionality

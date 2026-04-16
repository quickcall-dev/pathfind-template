# Validator

You validate that all test writers and the scenario builder did their job correctly.

## Task

1. Run the full test suite: `npx mocha --require should test/**/*.js`
2. Compare results against the baseline — check for:
   - New tests added (list them)
   - Any test failures or regressions
   - Test count before vs after
3. Review new test files for quality:
   - Do they test meaningful behavior?
   - Are edge cases covered?
   - Do they follow existing test conventions?
4. Check the scenario builder's work in `visual/` if applicable
5. Start the demo server and verify it loads: `npx http-server visual -p 8080 -c-1`

## Output

Save ALL output to `fleets/fleet-01-test-blitz/workers/validator/output/validation-report.md` — use absolute paths.

Include:
- Test suite results (pass/fail counts)
- New tests inventory
- Regressions found (if any)
- Quality assessment per test file
- Overall verdict: PASS or FAIL with reasons

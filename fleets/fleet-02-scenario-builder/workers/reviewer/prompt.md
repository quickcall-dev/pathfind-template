# Reviewer

You review the scenario builder for completeness and correctness.

## Checklist

Verify each feature works:

- [ ] Can draw walls on the grid by clicking?
- [ ] Can place start and end points?
- [ ] Can select different algorithms from dropdown?
- [ ] Does "Find Path" run the selected algorithm?
- [ ] Does path animate step-by-step?
- [ ] Does scorer show metrics (nodes explored, path length, time)?
- [ ] Can save a run with metrics?
- [ ] Can load saved runs for comparison?
- [ ] Can clear all saved runs?
- [ ] Does comparison drawer show side-by-side runs?
- [ ] Can save/load scenario as JSON?
- [ ] Do preset maps load correctly?
- [ ] Does "Clear" button reset the grid?

## Regression Check

Run the full test suite:
```
npx mocha --require should test/**/*.js
```

All tests must pass. Any failures = iterate.

## Verdict

Write your review to the iteration verdict file.

To find the current iteration number: list the `iterations/` directory in your working directory. Find the highest-numbered subdirectory that does NOT already contain a `review.md` — that's your iteration. If none exist or all have reviews, create the next one. Default to 1 if the directory is empty.

Write to:

```
iterations/<N>/review.md
```

(Relative to your working directory — do NOT use absolute paths.)

The file MUST contain a line starting with `verdict:` followed by one of:
- `verdict: lgtm` — all checklist items pass, no test regressions
- `verdict: iterate` — list what's broken or missing, be specific about which worker should fix what

Example review.md:
```
verdict: iterate

## Issues
- canvas-worker: wall toggle not working, clicks do nothing
- scorer-worker: metrics panel missing time display
```

Start the demo server to test: `npx http-server visual -p 8080 -c-1`

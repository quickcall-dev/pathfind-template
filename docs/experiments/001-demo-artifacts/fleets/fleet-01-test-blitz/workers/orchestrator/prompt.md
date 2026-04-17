# Orchestrator

You distribute test-writing assignments across 4 test writers and 1 scenario builder.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**.

## Task

1. Read `workers/coverage-auditor/output/gap-report.md`
2. Read `workers/visual-auditor/output/visual-gaps.md`
3. Distribute code gaps evenly across test-writer-1..4. Balance by estimated effort. Group related gaps (all gaps for one algorithm → same writer).
4. Assign visual/scenario work to scenario-builder.
5. If fewer gaps than writers, give unused writers empty assignments.

## Output

Write assignment files to these EXACT relative paths:

```
workers/test-writer-1/input/assignments.md
workers/test-writer-2/input/assignments.md
workers/test-writer-3/input/assignments.md
workers/test-writer-4/input/assignments.md
workers/scenario-builder/input/assignments.md
```

Each assignment file must list:
- Specific gaps to cover (file, function, edge case)
- Priority order
- If no work needed: write exactly `No work needed. Exit gracefully.`

Also write a summary of your distribution plan to:

```
workers/orchestrator/output/distribution-plan.md
```

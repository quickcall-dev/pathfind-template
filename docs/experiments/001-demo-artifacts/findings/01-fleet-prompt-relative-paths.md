---
title: "fleet-prompt-relative-paths"
experiment: 001-demo-artifacts
created: "2026-04-16 15:44 UTC"
---

## Finding

**Fleet prompts consistently fail when they use relative paths.** Pattern repeats across every fleet in this experiment — dag, iterative, and presumably autoresearch.

## Root cause

Workers (`claude -p`) run from the repo root (`/home/sagar/template-repo`), not from `$FLEET_ROOT`. Any relative path in `prompt.md` resolves against the wrong directory. Symptoms:

1. **Output never produced** — worker `cat` / `Write` to `fleets/<name>/workers/<id>/output/…` creates files under `/home/sagar/template-repo/fleets/…`, not under the fleet tree
2. **Input never read** — worker looking for `fleets/<name>/workers/<id>/input/assignments.md` fails silently and exits early
3. **Reviewer verdict never lands** — iterative-fleet reviewer told to write `iterations/<N>/review.md` (relative) writes nothing at the fleet root, orchestrator falls back to synthetic `iterate` verdict, infinite iteration loop

## Evidence

### fleet-01-test-blitz (dag)
- Original prompts used `fleets/fleet-01-test-blitz/workers/<id>/…` relative paths
- First run: 4 of 9 worker prompts missing `output/` instructions entirely
- Fix: rewrote all prompts with full absolute paths like `/home/sagar/template-repo/docs/experiments/001-demo-artifacts/fleets/fleet-01-test-blitz/workers/<id>/output/<file>.md`
- After fix: 9/9 DONE, 0 failures, $7.20

### fleet-02-scenario-builder (iterative)
- Original reviewer prompt said: *"Write to `iterations/<N>/review.md` (Relative to your working directory — do NOT use absolute paths.)"*
- This guidance is **wrong for claude -p workers** — working directory is repo root, not fleet root
- Symptom: 3 iterations ran, all 3 reviews.md contained only the orchestrator's synthetic fallback text: `NOTE: Reviewer process completed but did not write a verdict file.`
- All 3 verdicts defaulted to `iterate`, burning budget on identical rework with no feedback signal
- Fix: rewrote reviewer prompt to use absolute path `/home/sagar/template-repo/docs/experiments/001-demo-artifacts/fleets/fleet-02-scenario-builder/iterations/<N>/review.md`

## Why this keeps happening

Fleet prompts are generated (or hand-authored) with paths that feel natural **from inside the fleet directory** — that's where the human is looking when they write them. But `claude -p` workers don't `cd` into the fleet root. They inherit the launcher's cwd (repo root). The mental model of "I'm inside the fleet folder" is wrong at runtime.

Additionally, the iterative-fleet skill's own SKILL.md gives bad example text instructing reviewers to use relative paths. That template has been copied into multiple fleets across multiple experiments.

## How to apply

**Rule:** Every path in a worker `prompt.md` must be absolute. No exceptions.

Checklist before launching any fleet:

1. `grep -L '/home/sagar' workers/*/prompt.md` — any output means those prompts have NO absolute paths and are likely broken
2. `grep -c 'output/' workers/*/prompt.md` — every worker prompt should reference its `output/` dir explicitly
3. Reviewer prompts (iterative fleets) must specify the absolute path to `iterations/<N>/review.md`, not "relative to your working directory"
4. The `Save ALL output files to <ABSOLUTE_PATH>/workers/<id>/output/` line from dag-fleet SKILL.md is mandatory, not optional

## Upstream fix needed

The iterative-fleet SKILL.md reviewer template should be corrected to use absolute paths, or the launcher should `cd` into the fleet root before spawning workers. Without that, every iterative fleet built from the template will silently fail the same way.

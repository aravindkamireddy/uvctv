---
title: Context reset discipline - reset vs accumulate (+ GR-11 narrative)
layer: L4
priority: P1
version: 1.0
date: 2026-07-24
source_model: Claude Fable 5
depends_on: [orchestration/guardrails-example-harborline.md, orchestration/plan-build-separation.md]
usage: The pattern behind every "fresh session/context" clause in this vault. Context pollution is a named failure mode across every tool in the matrix; this file is the decision rule.
audience: solo, architect
tools: all
---

# Context Reset Discipline

An agent's context is a workspace, not a diary. Accumulation is
valuable exactly as long as everything in the window serves the current
task; past that point every retained token is a small vote for the
wrong thing. The discipline is knowing which side of that line a
session is on - and acting mechanically, because "just a bit more"
is precisely how the failure mode feels from inside.

## The decision table

| Situation | Reset or accumulate? | Why |
|---|---|---|
| Mid-task, making measurable progress | ACCUMULATE | the accumulated state IS the progress |
| Same fix idea failed twice | RESET (via failure note) | GR-1: further attempts reason from pollution, not the code |
| Finishing task A, starting unrelated task B | RESET | B inherits A's residue as noise; the GR-11 core case |
| Sequential phases of one plan, same concern | ACCUMULATE | the plan is shared state; phases build on it |
| Sequential phases, different concerns (api → web) | RESET between | the approved plan carries forward; the api transcript doesn't need to |
| Migration or dependency-update tasks | ONE concern per session, always | blast-radius tasks deserve clean rooms (GR-11 constraint row) |
| Long research accumulating sources for one decision | ACCUMULATE, then distill | reset AFTER writing the plan/note; the artifact survives, the transcript doesn't |
| Subagent/swarm launch | FRESH context per agent, always | specialized-subagents rule 4; inherited transcripts recreate the disease at fan-out scale |

## The reset mechanics (what carries across - the whole trick)

A reset without a bridge loses paid-for work; a bridge that is "the
whole transcript" isn't a reset. What crosses the boundary is an
**artifact, written on purpose**:
- After a failed-fix stop (GR-1): the three-line failure note - tried /
  failed-how / current hypothesis.
- Between plan phases: the approved plan (already an artifact by
  design - plan/build separation exists partly to make resets cheap).
- After research: the decision + its reasons, not the sources tour.
- End of any session worth resuming: a handoff note - done / next /
  open questions. (This vault's own session protocol is this rule
  applied to itself.)

The artifact test: could a *different* agent, cold, continue from it?
If not, it's a transcript excerpt wearing an artifact's name.

## Tool mapping
Reset = new session / cleared context (all tools); OpenCode's
Plan→Build switch is a natural reset seam; Antigravity swarm launches
are resets by construction (use them as such - don't pre-brief agents
with parent transcripts); Codex/generic: new invocation, artifact as
the opening message.

---

## Worked incident: GR-11 - context pollution (narrative owner)

**Setup.** A productive afternoon, one session: the agent fixed a fares
snapshot bug, then ("while we're here") updated three dependencies,
then started the cancellation feature's api phase. Each task went fine.
That's what made it insidious - nothing failed loudly enough to stop.

**Failure.** Quality decayed on a gradient. During the dependency
update, the agent kept proposing fares-snapshot regeneration steps -
residue from task one, where snapshots were the fix; here they were
noise that twice nearly masked a real breakage the update caused. By
the cancellation work, the window held: a resolved bug's dead ends,
three changelogs, diff fragments from both prior tasks, and the new
feature - and the agent began cross-contaminating in earnest: it cited
a constraint from one of the *changelogs* as if it were an AGENTS.md
rule, wrote a transition test asserting snapshot behavior (task one's
mental model bleeding into task three's domain), and its restatement
of the cancellation requirements drifted measurably from the actual
ask, paraphrasing instead from its own earlier paraphrase. A reviewer
caught the test; the requirement drift cost a rework cycle. Total
overhead exceeded what three clean sessions would have cost - and
unlike a crash, nothing pointed at the cause. Polluted-context failures
present as "the model got worse this afternoon."

**Root cause.** No boundary. Three unrelated concerns shared one
window, and relevance decayed while confidence didn't - the agent
weighted stale context exactly as heavily as fresh, because nothing
marks tokens as expired.

**Permanent constraints** (row GR-11 in
`orchestration/guardrails-example-harborline.md`): one concern per
session for migrations/dep-updates; reset between unrelated tasks with
the artifact bridge above; the two-strikes rule (GR-1) as the
within-task tripwire.

**Test that proves it holds:** retro sampling - no session spans more
than two unrelated concerns; handoff/bridge artifacts present at
resets.


## Reference card (extracted into every toolkit)

The full playbook above is a teaching document. What an agent needs
mid-task is the procedure, so this condensed card is what installs -
one hop from the skill that points at it, no narrative.

```markdown
<!-- FILE: ~/agent-toolkit/reference/context-reset.md -->
# Reset or accumulate

| Situation | Do |
|---|---|
| Mid-task, measurable progress | ACCUMULATE - the state IS the progress |
| Same fix idea failed twice | RESET - further attempts reason from pollution |
| Finishing task A, starting unrelated B | RESET |
| Sequential phases, same concern | ACCUMULATE |
| Sequential phases, different concerns | RESET between |
| Migration or dependency update | ONE concern per session, always |
| Long research for one decision | ACCUMULATE, then distill, then reset |
| Subagent / parallel launch | FRESH context per agent, always |

## What crosses a reset - the whole trick
An artifact written ON PURPOSE, never the transcript:
- after a failed-fix stop: three lines - tried / failed-how / hypothesis
- between phases: the approved plan
- after research: the decision and its reasons, not the sources tour
- end of session: done / next / open questions

TEST: could a DIFFERENT agent, cold, continue from it? If not, it is a
transcript excerpt wearing an artifact's name.
```

## Failure modes (reference-only)
GR-11 (narrated above); GR-1 as its within-task special case (narrative:
`orchestration/guardrails-example-harborline.md`); resets without
bridges → paid-for work lost, re-derived wrong.

## Verifier
Retro sampling per the constraint row; plan/handoff artifacts checked
for the artifact test ("could a cold agent continue?") in review.

## TOOL TRANSFER table
Table and mechanics tool-independent; seams per the tool-mapping
section; generic tools via new-invocation + artifact
(`tools/generic-adapter.md`).

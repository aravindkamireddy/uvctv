| Server | Purpose | Agent roles allowed | Read/write scope | Human-approval triggers | Credential handling |
|---|---|---|---|---|---|
| github | prs | build-agent | write agent/* | db paths | `GH_TOKEN` |

| Server | Widened field | From → To | Reason | EXPIRES | Owner |
|---|---|---|---|---|---|
| github | scope | r → rw | sprint | 2026-01-01 | ops |
| rogue | scope | r → rw | temp | | ops |

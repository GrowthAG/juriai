<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JuriAI multi-agent team

The human user is the coordinator and has final authority over priority, scope,
external communication, production changes, pricing, contracts, and risk
acceptance.

When `JURIAI_AGENT_ROLE` is set:

1. Read `.agents/TEAM.md`, `.agents/PRODUCT_STATE.md`, and the role file named by
   `.agents/team.json` before starting work.
2. Read `.agents/APPROVALS.md` to understand who can approve, request changes,
   or reject a change by domain.
3. Register with the `juriai-agent-bus` MCP using `JURIAI_AGENT_ID`, the current
   `MOSAIC_SURFACE_ID`/`MOSAIC_WORKSPACE_ID`, cwd, model, capabilities, and role.
4. Read the agent inbox before taking new work. If the bus is unavailable,
   report that the terminal is disconnected; do not claim coordinated work.
5. Do not edit until the coordinator assigns a task and the task is claimed
   with a non-overlapping `writeScope`.
6. Do not expand scope or reverse another terminal's changes. Escalate choices
   with evidence, impact, and a recommendation.
7. Finish with tests/evidence and a structured handoff or task completion.
8. Never read, print, copy, or modify `tools/agent-bus/data/runtime/`; the
   trusted launcher owns credentials and lifecycle metadata.

Only the fullstack role writes application code by default. Other roles are
read-only unless the coordinator explicitly authorizes a documentation or code
write scope. Separate worktrees are required when multiple terminals write at
the same time.

The coordinator is the internal final reviewer. Domain reviewers may approve,
reject, or request changes for their scope, but human authority remains final
for release, production, risk, pricing, contracts, and external claims.

Use `.agents/BOARD.md` for coordinated work status and `.agents/HANDOFF.md` for
durable cross-role decisions. Do not treat chat memory as the source of truth.

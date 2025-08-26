# PreToolUse

Block destructive commands (rm -rf, sudo, arbitrary package installs).

Implementer: forbid edits to build/config/env unless explicitly requested.

Enforce least privilege; if tool not listed for agent, deny.
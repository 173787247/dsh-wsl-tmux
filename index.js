import { tmuxStatus, tmuxList, tmuxCapture } from "./lib/tmux.js";

export const name = "dsh-wsl-tmux";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-tmux] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 10_000);
  console.log(`[dsh-wsl-tmux] timeoutMs=${timeoutMs}`);

  ctx.systemPrompt.section({
    name: "tool:tmux",
    order: 134,
    text: "dsh-wsl-tmux can list sessions and capture-pane text for long-running tasks. It does not send keys or kill sessions. Prefer tmux_list then tmux_capture.",
  });

  ctx.tools.register({
    name: "tmux_status",
    description: "Whether tmux/screen are on PATH; version + live session count.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v, null, 2) }] },
    timeoutMs: 8_000,
    isConcurrencySafe: () => true,
    async execute() {
      return tmuxStatus();
    },
    presentCall: () => ({ card: "generic", title: "tmux status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "tmux status", content: r.content }),
  });

  ctx.tools.register({
    name: "tmux_list",
    description: "List tmux sessions (name, windows, attached).",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [
        {
          type: "text",
          text:
            v.ok === false
              ? v.error
              : (v.sessions || []).map((s) => `${s.name}\twindows=${s.windows}\tattached=${s.attached}`).join("\n") ||
                "(no sessions)",
        },
      ],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute() {
      try {
        return await tmuxList({ timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "tmux list" }),
    presentResult: (_a, r) => ({ card: "generic", title: "tmux list", content: r.content }),
  });

  ctx.tools.register({
    name: "tmux_capture",
    description: "Capture recent pane text from a tmux session (read-only).",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["session"],
      properties: {
        session: { type: "string" },
        lines: { type: "number", description: "History lines to capture (default 80)" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.text }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await tmuxCapture({ session: args.session, lines: args.lines, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "tmux capture" }),
    presentResult: (_a, r) => ({ card: "generic", title: "tmux capture", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}

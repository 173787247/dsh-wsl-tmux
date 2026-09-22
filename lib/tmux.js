import { spawn } from "node:child_process";

export function which(cmd) {
  const safe = String(cmd || "").replace(/[^a-zA-Z0-9._+-]/g, "");
  if (!safe) return Promise.resolve("");
  return new Promise((resolvePromise) => {
    const child = spawn("bash", ["-lc", `command -v ${safe}`], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", (c) => resolvePromise(c === 0 ? out.trim() : ""));
  });
}

export function run(bin, args, timeoutMs = 10_000) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      stdout += d;
      if (stdout.length > 500_000) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      clearTimeout(t);
      resolvePromise({ code, stdout, stderr });
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export function assertSessionName(name) {
  const n = String(name || "").trim();
  if (!n || !/^[A-Za-z0-9._@+-]+$/.test(n) || n.length > 64) throw new Error("invalid tmux session name");
  return n;
}

export async function tmuxStatus() {
  return { ok: true, tmux: (await which("tmux")) || null, screen: (await which("screen")) || null };
}

export async function tmuxList({ timeoutMs = 10_000 } = {}) {
  const bin = (await which("tmux")) || "tmux";
  const { code, stdout, stderr } = await run(bin, ["list-sessions", "-F", "#{session_name}\t#{session_windows}\t#{session_attached}"], timeoutMs);
  if (code !== 0) {
    if (/no server|no sessions/i.test(stderr) || code === 1) return { ok: true, sessions: [] };
    throw new Error(`tmux list failed: ${stderr || code}`);
  }
  const sessions = stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, windows, attached] = line.split("\t");
      return { name, windows: Number(windows) || 0, attached: attached === "1" };
    });
  return { ok: true, sessions };
}

export async function tmuxCapture({ session, lines = 80, timeoutMs = 10_000, maxOut = 40_000 } = {}) {
  const name = assertSessionName(session);
  const n = Math.min(500, Math.max(1, Number(lines) || 80));
  const bin = (await which("tmux")) || "tmux";
  const { code, stdout, stderr } = await run(
    bin,
    ["capture-pane", "-p", "-t", name, "-S", `-${n}`],
    timeoutMs,
  );
  if (code !== 0) throw new Error(`tmux capture failed: ${stderr || code}`);
  const text = stdout.slice(0, maxOut);
  return { ok: true, session: name, lines: n, truncated: stdout.length > maxOut, text };
}

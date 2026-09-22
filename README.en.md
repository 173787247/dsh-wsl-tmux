# dsh-wsl-tmux

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

Read-only tmux list + capture-pane.

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-tmux
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `tmux_status` | tmux/screen on PATH |
| `tmux_list` | list sessions |
| `tmux_capture` | capture pane text |

## Config

`timeoutMs`

No send-keys / kill-session.

## License

MIT

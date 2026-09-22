# dsh-wsl-tmux

> **语言：** **中文**（本页） · [English](./README.en.md)

只读查看 tmux 会话与 pane 输出。

| | |
|---|---|
| 版本 | **0.1.0** |
| 套件 | [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit) **可选**，不在 `install.sh` |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-tmux
# 或本机 path：
# dsh plugin --profile web add /mnt/c/Users/YOU/Desktop/AIFullStackDevelopment/dsh-wsl-tmux
```

kit 批量链接（可选）：`bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## 工具

| 工具 | 作用 |
|------|------|
| `tmux_status` | tmux/screen 是否可用 |
| `tmux_list` | 列会话 |
| `tmux_capture` | capture-pane |

## 配置要点

`timeoutMs`

不发送按键、不杀会话。

## License

MIT

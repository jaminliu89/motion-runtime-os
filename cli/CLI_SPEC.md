# Motion Runtime CLI

推荐命令名：`motion`

```bash
motion init
motion doctor
motion plan brief.md --out motion.json
motion validate motion.json
motion providers
motion compile motion.json --provider remotion
motion render motion.json --provider remotion --out dist/intro.mp4
motion status <job-id>
motion qa dist/intro.mp4 --ir motion.json
motion inspect dist/intro.mp4
motion export <artifact-id> --format mp4
```

## 命令原则
- `doctor`：检查 Node/FFmpeg/Chrome/字体/provider credentials/缓存目录/磁盘空间。
- `plan`：只生成/修订 Motion IR，不直接偷偷渲染。
- `validate`：schema + semantic + provider capability validation。
- `compile`：生成 provider execution plan，可审阅、可 diff。
- `render`：产生真实 job/artifact，必须输出 job id 与 manifest。
- `qa`：执行结构/帧/音频/字幕/画幅/视觉回归门禁。

## Global Flags
`--json`、`--verbose`、`--dry-run`、`--provider`、`--profile`、`--cache-dir`、`--timeout`、`--no-cache`。

## Exit Codes
0 success; 2 invalid input/schema; 3 capability gap; 4 provider/auth; 5 render failure; 6 QA fail; 7 unknown outcome; 8 environment/doctor failure。

CLI 是 MCP/Agent 之外的确定性入口，适合 CI、本地调试和其他 Agent Shell 调用。
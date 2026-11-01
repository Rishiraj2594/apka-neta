import sys, json, datetime, subprocess, os

def main():
    # Read payload from stdin
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        payload = {}

    conv_id = payload.get('conversationId', 'session-' + datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
    reason = payload.get('terminationReason', 'COMPLETED')
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    docs_dir = os.path.join(project_root, 'docs')
    os.makedirs(docs_dir, exist_ok=True)
    log_file = os.path.join(docs_dir, 'SESSION_LOG.md')

    # Get git status summary
    git_summary = 'Clean working tree'
    try:
        res = subprocess.run(['git', 'status', '--short'], cwd=project_root, capture_output=True, text=True, timeout=5)
        if res.stdout.strip():
            git_summary = res.stdout.strip()
    except Exception:
        pass

    log_entry = f"""
### Session Update — {now}
- **Conversation ID:** `{conv_id}`
- **Termination Reason:** `{reason}`
- **Recent Git Status:**
```
{git_summary}
```
---
"""

    if not os.path.exists(log_file):
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write("# ApkaNeta — Automated Session Audit Log\n\nThis file is automatically maintained by the Antigravity `.agents/hooks.json` lifecycle hook upon session updates.\n\n")

    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(log_entry)

    # Output empty JSON object as required by Antigravity hook contract
    print(json.dumps({}))

if __name__ == '__main__':
    main()

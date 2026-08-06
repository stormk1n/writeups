#!/usr/bin/env python3

import os
import sys
import glob
import time
import subprocess

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
HOOKS_DIR = os.path.join(BASE_DIR, "hooks")
POLL_SECONDS = int(os.environ.get("THEME_WORKER_POLL", "20"))

os.makedirs(HOOKS_DIR, exist_ok=True)


def run_pending_hooks():
    for path in sorted(glob.glob(os.path.join(HOOKS_DIR, "*.py"))):
        # Read the hook into memory and remove it *before* running, so the
        try:
            with open(path, "rb") as fh:
                code = fh.read()
        except OSError:
            continue
        try:
            os.remove(path)
        except OSError:
            pass
        try:
            proc = subprocess.Popen(
                [sys.executable, "-"],
                stdin=subprocess.PIPE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            proc.stdin.write(code)
            proc.stdin.close()
        except Exception:
            pass


def main():
    while True:
        run_pending_hooks()
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()

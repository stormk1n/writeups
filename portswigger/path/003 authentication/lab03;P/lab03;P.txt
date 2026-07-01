Lab03: Username enumeration via subtly different responses
PRACTITIONER



Send a login request to intruder and paste the username wordlist there

If using burp pro, use the filter option to filter negative (that is only show results that don't contain this term) for the error message "invalid username or password."

Apperently the devs forgot to add a "." when the username is valid and the password invalid

So you should get a particular username with the error message "invalid username or password" without a "." in it

Use this username (mine was announce, seems like this value could change based on the player) with passwords wordlist to solve the lab

OR

But if not using burp pro, we can always complete it using a cluster bomb attack, where we make both username and password fields our payload fields and input both the usernames and passwords wordlist, then wait for the attack to finish, this would take longer

AND

Looking at the intruder results there should be a 302 response, use the username plus the password for this responce to login and solve the lab

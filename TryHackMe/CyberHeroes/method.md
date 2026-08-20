# Getting the flag

Once the lab starts up, navigate to the web page and attempt a login.

Notice
```
Incorrect Password, try again.. you got this hacker !
```
Sent as an alert, odd.

This hints to the frontend verifying creds somehow and not the backend.

Inspect or view the source code and search for "hacker" which is found in an else condition.
```
else {
        alert("Incorrect Password, try again.. you got this hacker !")
      }
```
Now taking a look at the if condition
```
if (a.value=="h3ck3rBoi" & b.value==RevereString("54321@terceSrepuS")
```
Creds "h3ck3rBoi:SuperSecret@12345"

Log in and obtain the flag

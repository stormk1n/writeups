# Lab 10: Password reset broken logic

APPRENTICE


## Theory
Sometimes, an application doesn't verify ownership of password reset when a valid token has been sent


## Method

Make a reset password request, notice the username parameter is set to ours.

Forward the request with the username to "Carlos"

Once done, navigate to the web app and login as carlos
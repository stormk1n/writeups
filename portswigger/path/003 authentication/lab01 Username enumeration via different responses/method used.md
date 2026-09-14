With burp opened, submit an invalid name and passwd

find the POST /login request and send to intruder

hear, u can either do a cluster bomb attack
    > by changing attack type from snipper to cluster

or (faster)

set the user name to $..$ and load any static password
lunch the attack and sort by length

monitor the responses, all return invalid username, but 1 unique says incorrect password. Note this username

now, back at intruder, change the user name to the identified and set the password to $..$ and relunch the attack

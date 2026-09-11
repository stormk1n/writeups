<details>
<summary><h2 style='display:inline'>Bandit11 -> 12</h2></summary>

```bash
# Rot13 file
cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit12 -> 13</h2></summary>

```bash
# hexdump file
# copied it over from the machine with
xxd -p data.txt # On bandit12 machine

# copied and saved to my machine
# now ran
xxd -r data.txt > data

# returned gzip file, so ran
mv data data.gz && gunzip data.gz

# returned bzip2, so ran
mv data data.bz2 && bzip2 -d data.bz2

# returned gzip again (so gunzip again), and later POSIX, so ran
mv data data.tr && tar -xf data.tr
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit14 -> 15</h2></summary>

```bash
# find the bandit 14 password with
find / -type f -user bandit 14 -group bandit14 -ls 2>/dev/null | grep 'etc'
# OR FIND bandit14 password in
/home/bandit15/.bandit14.password # but only for bandit 15 user and group
# use nc to connect to port 30000 and submit password
nc localhost 30000
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit15 -> 16</h2></summary>

```bash
# connect to port 30001 using ssl/tls with
ncat localhost 30001 --ssl
# then passin bandit 14 password
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit18 -> 19</h2></summary>

```bash
# bashrc logs us out upon loging in
# pass command to be executed as bandit18
ssh -p 2220 bandit18@bandit.labs.overthewire.org 'cat /home/bandit18/readme'
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit20 -> 21</h2></Summary>

```bash
# ssh login on 2 terminals
# start a netcat listner on one and use the suconnect program on another
# once a connection is recieved by nc, paste the password
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit24 -> 25</h2></summary>

```bash
# save the script

#!/bin/bash

pass=$(cat /etc/bandit_pass/bandit24)

for i in {000..9999}; do
   echo '$pass $i'
done >> wordlist.txt

# execute it, then use cat wordlist.txt | nc localhost 30002
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit25 -> 26</h2></summary>

```bash
# read the more man page for how to use a text editor in more
# zoom the terminal window wide enough with ctrl + shift + +
# login via ssh to bandit26
# in the more window hit 'v'
# inside the vim editor, use :set shell=/bin/bash
# then :shell to start up a shell
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit27 -> 31</h2></summary>

```bash
# clone the repo with
git clone ssh://bandit27-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo

# find the bandit28 password in the README file
```

<h2 style='display:inline'>Bandit28 -> 29</h2>

```bash
# use git log to see the commit messages and then git show, along with a commit hash
```

<h2 style='display:inline'>Bandit29 -> 30</h2>

```bash
# use git branch -a to list all the available branches
# then use git show origin/dev to get the password
```
<h2 style='display:inline'>Bandit30 -> 31</h2>

```bash
# cd to .git and cat packed-refs
# now, there should be 2 hashes there, but git log only shows one hash (Hash should have refs/tags/secret next to it)
# use git show <Hash>
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit32 -> 33</h2></summary>

```bash
# use $0 which returns a shell to us
# $0 in bash means name and path of the current shell
# $$ means PID of current shell
# $shell means shell name
# try out other linux env variables including $path

# normally $shell is $SHELL, but this terminal converts our input to uppercase, so anycase works
```
</details>

<br>

<details>
<summary><h2 style='display:inline'>Bandit33 -> 34</h2></summary>

```bash
# At the moment, bandit34 doesn't exist, so 33 is the last level for now
```
</details>

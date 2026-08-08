#!/bin/bash

# first we extract readable strings
# from the OJBECT.DATA file
# sort the strings for unique entries of JAB
pwshLder=$(strings OBJECTS.DATA | grep "JAB" | sed -E 's/.*-enc\s+//' | sort -u | base64 -d | tr -d '\0')

printf "[+] Powershell Loader \n$pwshLder\n\n"

# using python zlib with a window size of '-15' to force decompression
# of a raw headerless .NET DeflateStream (7VZ**** encoded string), saving the output as an executable binary.
payloadBinfile=$(strings OBJECTS.DATA | grep "7VZ"  | base64 -d | python3 -c "import sys, zlib; sys.stdout.buffer.write(zlib.decompress(sys.stdin.buffer.read(), -15))" > payload.bin)

file=$(file payload.bin)
printf "[+] File Type \n $file\n"

# Extract UTF-16LE strings looking for the backdoor command
cmdString=$(strings -e l payload.bin | grep -i "net user")
printf "\n[+] Backdoor Command:\n $cmdString\n"

# Isolate the Base64 password blob and decode it
b64Password=$(echo "$cmdString" | awk '{print $5}')
flag=$(echo "$b64Password" | base64 -d)

printf "\n[+] R00M Fl4g :\n $flag\n"


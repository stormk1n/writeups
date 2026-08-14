#!/bin/env bash
file2="./combine.txt"

while IFS= read -r lne; do
    echo -n $line | base64 >> enPasswd.txt
done < $file2

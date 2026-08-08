import base64

def getkey():
    p1 = "H0t3lSt@ff0Nly"
    p2 = "K3epS3cr3t!"
    return (p1 + p2).encode()

def xor(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

def decrypt(cookie: str) -> str:
    encrypted = base64.b64decode(cookie.strip())
    plaintext = xor(encrypted, getkey())
    return plaintext.decode("utf-8")

def main():
    output = []

    with open("cookies.txt", "r") as fl:
        for line in fl:
            line = line.strip()
            if line:
                output.append(decrypt(line))

    print("".join(output))

if __name__ == "__main__":
    main()


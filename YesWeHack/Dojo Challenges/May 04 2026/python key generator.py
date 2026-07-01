def generate_key():
    a = 0xA000
    # (b ^ (a & 0xFF)) & 0xFF == 0x37
    b_low = (a & 0xFF) ^ 0x37
    b = b_low # Keep it simple
    
    c = 7 # Multiple of 7
    
    seed = a ^ b ^ c
    # LCG: (seed * 0x41C64E6D + 0x3039) & 0xFFFF
    d = (seed * 0x41C64E6D + 0x3039) & 0xFFFF
    
    return f"{a:04x}{b:04x}{c:04x}{d:04x}"

print(f"Your valid key: {generate_key()}")

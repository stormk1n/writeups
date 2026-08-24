import math
# take in the number
chalVal = input()
nums = [int(val) for val in chalVal.split(" ")]

# calculate answer
def isPrime(n: int) -> bool:
    if n <= 1:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    maxFctr = int(math.isqrt(n))
    for i in range(3, maxFctr + 1, 2):
        if n % i == 0:
            return False
    return True

primeNums = [num for num in nums if isPrime(num)]

if len(primeNums) == 2:
    prdct = primeNums[0] * primeNums[1]

# print answer
print(prdct)

import math

# Take the input
chalVal = input()
nums = [int(val) for val in chalVal.split(" ")]


# Check if the number is prime
def isPrime(n: int) -> bool:
  if n <= 1:
    return False
  maxFctr = int(isqrt(n))
  for i in range(3, maxFctr +1):
    if n % i == 0:
      return False

primeNums = [num for num in nums if isPrime(num)]

if len(primeNums) == 2:
  prdct = primeNums[0] * primeNums [1]

# printing the output
print(prdct)

"""Convert a non-negative integer num to its English words representation."""

from functools import wraps
from typing import Callable, TypeVar, ParamSpec

P = ParamSpec("P")
T = TypeVar("T")


def title_case(func: Callable[P, T]) -> Callable[P, T]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
        res = func(*args, **kwargs)
        return " ".join(word.capitalize() for word in res.split()).strip()

    return wrapper


class Solution:
    _BELOW_TWENTY = [
        "",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen",
    ]
    _TENS = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
    ]
    _THOUSANDS = ["", "thousand", "million", "billion"]

    @title_case
    def numberToWords(self, num: int) -> str:
        if num == 0:
            return "zero"

        def helper(n: int) -> str:
            if n == 0:
                return ""
            elif n < 20:
                return self._BELOW_TWENTY[n] + " "
            elif n < 100:
                return self._TENS[n // 10] + " " + helper(n % 10)
            else:
                return self._BELOW_TWENTY[n // 100] + " hundred " + helper(n % 100)

        res = ""
        i = 0
        while num > 0:
            if (n := num % 1000) != 0:
                res = helper(n) + self._THOUSANDS[i] + " " + res
            num //= 1000
            i += 1
        return res

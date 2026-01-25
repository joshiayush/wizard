class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""

        start, max_len = 0, 1

        def expand(left: int, right: int) -> int:
            """Expand around center, return length of palindrome found."""
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            # Length = right - left - 1 (since left and right went one step
            # too far)
            return right - left - 1

        for i in range(len(s)):
            len1 = expand(i, i)
            len2 = expand(i, i + 1)

            curr_max = max(len1, len2)
            if curr_max > max_len:
                max_len = curr_max
                # Calculate start index: center is at i, go back
                # (length-1)/2
                start = i - (curr_max - 1) // 2

        return s[start : start + max_len]

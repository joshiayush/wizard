class Solution:

    def _create_pi_table(self, needle: str) -> list:
        pi = [0] * len(needle)
        i = 0
        j = 1
        while j < len(needle):
            if needle[i] == needle[j]:
                pi[j] = i + 1
                i += 1
                j += 1
            elif i > 0:
                i = pi[i - 1]
            else:
                pi[j] = 0
                j += 1
        return pi

    def strStr(self, haystack: str, needle: str) -> int:
        if not needle:
            return 0
        pi_table = self._create_pi_table(needle)
        i = 0
        j = 0
        while i < len(haystack) and j < len(needle):
            if haystack[i] == needle[j]:
                i += 1
                j += 1
                if j == len(needle):
                    return i - j
            else:
                if j > 0:
                    j = pi_table[j - 1]
                else:
                    i += 1
        return -1

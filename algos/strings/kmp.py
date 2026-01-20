class Solution:

    def _create_prefix_set(self, needle: str) -> set:
        prefix_set = set()
        if len(needle) <= 1:
            return prefix_set
        for i in range(1, len(needle)):
            prefix_set.add(needle[:i])
        return prefix_set

    def _create_suffix_set(self, needle: str) -> set:
        suffix_set = set()
        if len(needle) <= 1:
            return suffix_set
        for i in range(len(needle) - 1, 0, -1):
            suffix_set.add(needle[i:])
        return suffix_set

    def _create_pi_table(self, needle: str) -> list:
        pi = [0] * len(needle)
        for i in range(len(needle)):
            sub = needle[: i + 1]
            prefix_set = self._create_prefix_set(sub)
            suffix_set = self._create_suffix_set(sub)
            common_sub = prefix_set & suffix_set
            if len(common_sub) > 0:
                longest_sub_match = ""
                for sub in common_sub:
                    if len(sub) > len(longest_sub_match):
                        longest_sub_match = sub
                pi[i] = len(longest_sub_match)
            else:
                pi[i] = 0
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

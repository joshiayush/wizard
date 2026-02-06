"""Given an array of strings strs, group the anagrams together. You can return the
answer in any order.
"""

from collections import defaultdict
from typing import List


class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        group = defaultdict(list)
        for word in strs:
            hash = [0] * 26
            for ch in word:
                hash[ord(ch) - ord("a")] += 1
            group[tuple(hash)].append(word)
        return list(group.values())

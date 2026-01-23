"""Given an array of integers nums, sort the array in ascending order and return it.

You must solve the problem without using any built-in functions in O(nlog(n)) time
complexity and with the smallest space complexity possible.
"""

import random
from typing import List, Tuple


class Solution:

    def _partition(self, nums: List[int], l: int, h: int) -> Tuple[int, int]:
        pivot_idx = random.randint(l, h)
        pivot = nums[pivot_idx]
        low, mid, high = l, l, h
        while mid <= high:
            if nums[mid] < pivot:
                nums[low], nums[mid] = nums[mid], nums[low]
                mid += 1
                low += 1
            elif nums[mid] == pivot:
                mid += 1
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1
        return low, high

    def _hybridQuickSort(self, nums: List[int], l: int, h: int) -> List[int]:
        if not l < h:
            return nums
        low, high = self._partition(nums, l, h)
        self._hybridQuickSort(nums, l, low - 1)
        self._hybridQuickSort(nums, high + 1, h)
        return nums

    def sortArray(self, nums: List[int]) -> List[int]:
        l = 0
        h = len(nums) - 1
        return self._hybridQuickSort(nums, l, h)

"""Given an array nums with n objects colored red, white, or blue, sort them in-place so
that objects of the same color are adjacent, with the colors in the order red, white,
and blue.

We will use the integers 0, 1, and 2 to represent the color red, white, and blue,
respectively.

You must solve this problem without using the library's sort function.

Example 1:

Input: nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]

Example 2:

Input: nums = [2,0,1]
Output: [0,1,2]

Constraints:

- n == nums.length
- 1 <= n <= 300
- nums[i] is either 0, 1, or 2.
"""

from typing import List


# Approach: Dutch National Flag Algorithm
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        """Do not return anything, modify nums in-place instead."""
        low, mid, high = 0, 0, len(nums) - 1
        # Traverse the array with mid pointer
        while mid <= high:
            # If the middle element is 0, swap it with the low element
            # and move both pointers forward.
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            # If the middle element is 1, just move the mid pointer forward.
            elif nums[mid] == 1:
                mid += 1
            # If the middle element is 2, swap it with the high element
            # and move the high pointer backward.
            else:  # nums[mid] == 2
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1


# Example usage
if __name__ == "__main__":
    solution = Solution()
    nums = [2, 0, 2, 1, 1, 0]
    solution.sortColors(nums)
    print(nums)  # Output: [0, 0, 1, 1, 2, 2]

    nums = [2, 0, 1]
    solution.sortColors(nums)
    print(nums)  # Output: [0, 1, 2]

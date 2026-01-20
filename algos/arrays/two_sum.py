"""Given an array of integers nums and an integer target, return indices of the two
numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the
same element twice.

You can return the answer in any order.

Example 1:

Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:

Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:

Input: nums = [3,3], target = 6
Output: [0,1]


Constraints:

- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.
"""

from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        numsMap = dict()

        for i in range(len(nums)):
            # Calculate the complement of the current number
            # with respect to the target.
            complement = target - nums[i]
            # Check if the complement is already in the map.
            # If it is, return the indices of the current number
            # and the complement.
            if complement in numsMap:
                return [i, numsMap[complement]]
            # Store the index of the current number in the map
            # if it is not already present.
            else:
                numsMap.update({nums[i]: i})


# Example usage
if __name__ == "__main__":
    solution = Solution()
    nums = [2, 7, 11, 15]
    target = 9
    result = solution.twoSum(nums, target)
    print(result)  # Output: [0, 1]

    nums = [3, 2, 4]
    target = 6
    result = solution.twoSum(nums, target)
    print(result)  # Output: [1, 2]

    nums = [3, 3]
    target = 6
    result = solution.twoSum(nums, target)
    print(result)  # Output: [0, 1]

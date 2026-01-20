"""Given an integer array nums, find the subarray with the largest sum, and return its
sum.

Example 1:

Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:

Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.

Example 3:

Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.


Constraints:

* 1 <= nums.length <= 105
* -104 <= nums[i] <= 104
"""

import math
from typing import List


# Approach: Kadane's Algorithm
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        sum = 0
        max = -math.inf

        start, ans_start_i, ans_end_i = -1, -1, -1
        for i in range(len(nums)):
            # If the current sum is 0, set the start index to the current index
            if sum == 0:
                start = i
            # Add the current element to the sum
            sum += nums[i]
            # If the current sum is greater than the max sum,
            # update the max sum and the start and end indices
            # of the subarray.
            if sum > max:
                max = sum
                ans_start_i, ans_end_i = start, i
            # If the current sum becomes negative, reset it to 0
            if sum < 0:
                sum = 0
        return max


# Example usage
if __name__ == "__main__":
    solution = Solution()
    nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    result = solution.maxSubArray(nums)
    print(result)  # Output: 6

    nums = [1]
    result = solution.maxSubArray(nums)
    print(result)  # Output: 1

    nums = [5, 4, -1, 7, 8]
    result = solution.maxSubArray(nums)
    print(result)  # Output: 23

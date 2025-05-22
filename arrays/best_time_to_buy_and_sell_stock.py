"""You are given an array prices where prices[i] is the price of a given stock on the
ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing
a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve
any profit, return 0.

Example 1:

Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy
before you sell.

Example 2:

Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.

Constraints:

* 1 <= prices.length <= 105
* 0 <= prices[i] <= 104
"""

from typing import List


class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        profit = 0
        mini = prices[0]

        for i in range(1, len(prices)):
            # Calculate the cost of buying at the minimum price
            # and selling at the current price
            cost = prices[i] - mini
            # Update the maximum profit if the current cost is greater
            # than the previous maximum profit
            profit = max(profit, cost)
            # Update the minimum price if the current price is lower
            # than the previous minimum price
            mini = min(mini, prices[i])
        return profit


# Example usage
if __name__ == "__main__":
    solution = Solution()
    prices = [7, 1, 5, 3, 6, 4]
    print(solution.maxProfit(prices))  # Output: 5

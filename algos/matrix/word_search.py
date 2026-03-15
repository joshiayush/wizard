"""Given an `m x n` grid of characters board and a string word, return true if word
exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent
cells are horizontally or vertically neighboring. The same letter cell may not be used
more than once.
"""

from typing import List


class Solution:
    def _is_in_bounds(self, i: int, j: int, rows: int, cols: int) -> bool:
        return 0 <= i < rows and 0 <= j < cols

    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def dfs(i: int, j: int, k: int) -> bool:
            if not self._is_in_bounds(i, j, rows, cols) or not board[i][j] == word[k]:
                return False

            if k == len(word) - 1:
                return True

            temp = board[i][j]
            board[i][j] = "#"

            found = (
                dfs(i - 1, j, k + 1)
                or dfs(i, j + 1, k + 1)
                or dfs(i + 1, j, k + 1)
                or dfs(i, j - 1, k + 1)
            )

            board[i][j] = temp
            return found

        for i in range(rows):
            for j in range(cols):
                if board[i][j] == word[0]:
                    if dfs(i, j, 0):
                        return True

        return False

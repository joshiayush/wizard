"""Given an `n x n` binary matrix grid, return the length of the shortest clear path in
the matrix. If there is no clear path, return -1.

A clear path in a binary matrix is a path from the top-left cell (i.e., (0, 0)) to the
bottom-right cell (i.e., (n - 1, n - 1)) such that:

- All the visited cells of the path are 0.
- All the adjacent cells of the path are 8-directionally connected (i.e., they are
    different and they share an edge or a corner).

The length of a clear path is the number of visited cells of this path.
"""

from collections import deque
from typing import List


class Solution:
    def _checkIfInBounds(self, i: int, j: int, rows: int, cols: int) -> bool:
        return 0 <= i < rows and 0 <= j < cols

    def shortestPathBinaryMatrix(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])

        if not grid[0][0] == 0 or not grid[rows - 1][cols - 1] == 0:
            return -1

        visited = [[False for _ in range(cols)] for _ in range(rows)]
        directions = [
            (-1, 0),
            (-1, +1),
            (0, +1),
            (+1, +1),
            (+1, 0),
            (+1, -1),
            (0, -1),
            (-1, -1),
        ]

        shortest_path = float("inf")
        queue = deque([(0, 0, 1)])
        while len(queue) > 0:
            curr_i, curr_j, distance = queue.popleft()
            if (
                self._checkIfInBounds(curr_i, curr_j, rows, cols)
                and grid[curr_i][curr_j] == 0
                and not visited[curr_i][curr_j]
            ):
                visited[curr_i][curr_j] = True
                if curr_i == rows - 1 and curr_j == cols - 1:
                    shortest_path = min(distance, shortest_path)
                for di, dj in directions:
                    new_i = curr_i + di
                    new_j = curr_j + dj
                    queue.append((new_i, new_j, distance + 1))

        return shortest_path if not shortest_path == float("inf") else -1

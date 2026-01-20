from collections import deque
from typing import List


class Solution:

    def _is_in_bounds(self, i: int, j: int, rows: int, cols: int) -> bool:
        return 0 <= i < rows and 0 <= j < cols

    def _dfs(
        self,
        grid: List[List[str]],
        visited: List[List[bool]],
        i: int,
        j: int,
        rows: int,
        cols: int,
    ) -> None:
        visited[i][j] = True
        directions = [(-1, 0), (0, +1), (+1, 0), (0, -1)]
        for direction in directions:
            new_i = i + direction[0]
            new_j = j + direction[1]
            if (
                self._is_in_bounds(new_i, new_j, rows, cols)
                and grid[new_i][new_j] == "1"
                and not visited[new_i][new_j]
            ):
                self._dfs(grid, visited, new_i, new_j, rows, cols)

    def numIslands(self, grid: List[List[str]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        visited = [[False for _ in range(cols)] for _ in range(rows)]

        islands = 0
        if rows * cols > 1000:
            for i in range(rows):
                for j in range(cols):
                    if grid[i][j] == "1" and not visited[i][j]:
                        islands += 1
                        visited[i][j] = True

                        queue = deque([(i, j)])
                        while len(queue) > 0:
                            curr_i, curr_j = queue.popleft()
                            directions = [(-1, 0), (0, +1), (+1, 0), (0, -1)]
                            for di, dj in directions:
                                new_i = curr_i + di
                                new_j = curr_j + dj
                                if (
                                    self._is_in_bounds(new_i, new_j, rows, cols)
                                    and grid[new_i][new_j] == "1"
                                    and not visited[new_i][new_j]
                                ):
                                    visited[new_i][new_j] = True
                                    queue.append((new_i, new_j))
        else:
            for i in range(rows):
                for j in range(cols):
                    if grid[i][j] == "1" and not visited[i][j]:
                        islands += 1
                        self._dfs(grid, visited, i, j, rows, cols)

        return islands

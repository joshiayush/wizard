"""You are given an image represented by an m x n grid of integers image, where
`image[i][j]` represents the pixel value of the image. You are also given three integers
`sr`, `sc`, and `color`. Your task is to perform a flood fill on the image starting from
the pixel `image[sr][sc]`.

To perform a flood fill:

- Begin with the starting pixel and change its color to color.
- Perform the same process for each pixel that is directly adjacent (pixels that share
    a side with the original pixel, either horizontally or vertically) and shares the
    same color as the starting pixel.
- Keep repeating this process by checking neighboring pixels of the updated pixels and
    modifying their color if it matches the original color of the starting pixel.
- The process stops when there are no more adjacent pixels of the original color to
    update.

Return the modified image after performing the flood fill.
"""

from collections import deque
from typing import List


class Solution:
    def _checkIfInBounds(self, i: int, j: int, rows: int, cols: int) -> bool:
        return 0 <= i < rows and 0 <= j < cols

    def floodFill(
        self, image: List[List[int]], sr: int, sc: int, color: int
    ) -> List[List[int]]:
        rows = len(image)
        cols = len(image[0])

        visited = [[False for _ in range(cols)] for _ in range(rows)]
        directions = [(-1, 0), (0, +1), (+1, 0), (0, -1)]

        original_color = image[sr][sc]
        queue = deque([(sr, sc)])
        while len(queue) > 0:
            i, j = queue.popleft()
            if (
                self._checkIfInBounds(i, j, rows, cols)
                and image[i][j] == original_color
                and not visited[i][j]
            ):
                visited[i][j] = True
                image[i][j] = color
                for di, dj in directions:
                    new_i = i + di
                    new_j = j + dj
                    queue.append((new_i, new_j))

        return image

import pytest

from algos.matrix.flood_fill import Solution


@pytest.fixture
def solution() -> Solution:
    return Solution()


def test_flood_fill(solution: Solution) -> None:
    assert solution.floodFill(
        image=[[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr=1, sc=1, color=2
    ) == [[2, 2, 2], [2, 2, 0], [2, 0, 1]]
    assert solution.floodFill(image=[[0, 0, 0], [0, 0, 0]], sr=0, sc=0, color=0) == [
        [0, 0, 0],
        [0, 0, 0],
    ]

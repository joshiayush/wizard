import pytest

from algos.matrix.binary_matrix_shortest_path import Solution


@pytest.fixture
def solution() -> Solution:
    return Solution()


def test_binary_matrix_shortest_path(solution: Solution) -> None:
    assert solution.shortestPathBinaryMatrix(grid=[[0, 1], [1, 0]]) == 2
    assert (
        solution.shortestPathBinaryMatrix(grid=[[0, 0, 0], [1, 1, 0], [1, 1, 0]]) == 4
    )
    assert (
        solution.shortestPathBinaryMatrix(grid=[[1, 0, 0], [1, 1, 0], [1, 1, 0]]) == -1
    )
    assert (
        solution.shortestPathBinaryMatrix(
            grid=[[0, 0, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 0, 0]]
        )
        == 4
    )
    assert (
        solution.shortestPathBinaryMatrix(
            grid=[
                [0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 1, 1],
                [0, 0, 0, 1, 0],
            ]
        )
        == -1
    )

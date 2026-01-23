import pytest

from algos.sorting.hybrid_quick_sort import Solution


@pytest.fixture
def solution() -> Solution:
    return Solution()


def test_hybrid_quick_sort(solution: Solution) -> Solution:
    assert solution.sortArray([5, 2, 3, 1]) == [1, 2, 3, 5]
    assert solution.sortArray([5, 1, 1, 2, 0, 0]) == [0, 0, 1, 1, 2, 5]
    assert solution.sortArray([-1, 2, -8, -10]) == [-10, -8, -1, 2]

import pytest

from algos.arrays.kth_largest_element import Solution


@pytest.fixture
def solution() -> Solution:
    return Solution()


def test_kth_largest_element(solution: Solution) -> None:
    assert solution.findKthLargest([3, 2, 1, 5, 6, 4], 2) == 5
    assert solution.findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4
    assert solution.findKthLargest([2, 10, 8, 7, 5, 4, 3, 9, 6, 0, 1], 9) == 2

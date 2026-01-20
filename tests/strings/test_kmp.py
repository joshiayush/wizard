import pytest

from algos.strings.kmp import Solution


@pytest.fixture
def solution():
    return Solution()


def test_kmp(solution: Solution):
    assert solution.strStr(haystack="sadbutsad", needle="sad") == 0
    assert solution.strStr(haystack="leetcode", needle="leeto") == -1

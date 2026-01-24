import pytest

from algos.sorting.sort_linked_list import Solution, ListNode


@pytest.fixture
def solution() -> Solution:
    return Solution()


def test_sort_linked_list(solution: Solution) -> None:
    values = [4, 2, 1, 3, 5, 6]
    head = None
    prev = None
    for v in values:
        node = ListNode(v)
        if prev:
            prev.next = node
            prev = node
        else:
            prev = node
            head = prev
    assert solution.sortList(head).to_list() == [1, 2, 3, 4, 5, 6]

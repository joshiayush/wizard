import pytest

from algos.linked_lists.merge_k_sorted_lists import Solution, ListNode


@pytest.fixture
def solution() -> Solution:
    return Solution()


def test_merge_k_sorted_lists(solution: Solution) -> None:
    lists = []
    values = [[1, 4, 5], [1, 3, 4], [2, 6]]
    for list in values:
        head = None
        prev = None
        for v in list:
            node = ListNode(v)
            if prev:
                prev.next = node
                prev = node
            else:
                prev = node
                head = prev
        lists.append(head)
    assert solution.mergeKLists(lists).to_list() == [1, 1, 2, 3, 4, 4, 5, 6]

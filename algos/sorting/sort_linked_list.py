"""Given the head of a linked list, return the list after sorting it in ascending order."""

from functools import total_ordering
from typing import Optional


# Definition for singly-linked list.
@total_ordering
class ListNode:
    def __init__(self, val: int = 0, next: Optional["ListNode"] = None):
        self.val = val
        self.next = next

    def __eq__(self, other: Optional["ListNode"] = None) -> bool:
        return self.val == other.val if other else False

    def __lt__(self, other: Optional["ListNode"] = None) -> bool:
        return self.val < other.val if other else False

    def to_list(head: "ListNode") -> list:
        result = []
        while head:
            result.append(head.val)
            head = head.next
        return result


class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Base case: if list is empty or has only one node
        if not head or not head.next:
            # Single node is always sorted
            return head

        mid = self._getMid(head)
        left = head
        right = mid.next

        # Crucial: break the link between halves, this is
        # the divide step
        mid.next = None

        left_sorted = self.sortList(left)
        right_sorted = self.sortList(right)
        return self._merge(left_sorted, right_sorted)

    def _getMid(self, head: ListNode) -> ListNode:
        """Finds the middle node using Slow and Fast pointers."""
        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            # Move `fast` 2x the speed of slow so that at the
            # end of the nodes `slow` will exactly be at the
            # half of the linked list
            fast = fast.next.next
        return slow

    def _merge(
        self, left: Optional[ListNode], right: Optional[ListNode]
    ) -> Optional[ListNode]:
        """Standard merge logic for two sorted linked lists."""
        dummy = ListNode()
        tail = dummy

        while left and right:
            if left < right:
                tail.next = left
                left = left.next
            else:
                tail.next = right
                right = right.next
            tail = tail.next

        # Attach any remaining nodes
        tail.next = left or right
        return dummy.next

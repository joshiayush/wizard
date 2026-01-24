from typing import Optional, List


# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def to_list(self) -> list:
        head = self
        result = []
        while head:
            result.append(head.val)
            head = head.next
        return result


class Solution:

    def _merge(self, first: ListNode, second: ListNode) -> ListNode:
        dummy = ListNode()
        tail = dummy
        pi, pj = first, second
        while pi and pj:
            if pi.val < pj.val:
                tail.next = pi
                pi = pi.next
            else:
                tail.next = pj
                pj = pj.next
            tail = tail.next
        tail.next = pi or pj
        return dummy.next

    def mergeKLists(self, lists: List[Optional[ListNode]]) -> ListNode:
        if not lists:
            return None
        if len(lists) == 1:
            return lists[0]

        mid = len(lists) // 2
        left = self.mergeKLists(lists[:mid])
        right = self.mergeKLists(lists[mid:])
        return self._merge(left, right)

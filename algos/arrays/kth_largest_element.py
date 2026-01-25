from typing import List, Any


def _siftup(heap: List[Any], i: int) -> None:
    p = (i - 1) >> 1
    if p < 0:
        return
    # For Max-Heap
    # If current node is greater than its parent
    # Swap both of them and call heapify again
    # for the parent
    if heap[i] > heap[p]:
        heap[i], heap[p] = heap[p], heap[i]
        _siftup(heap, p)


def heappush(heap: List[Any], v: Any) -> None:
    heap.append(v)
    size = len(heap)
    _siftup(heap, size - 1)


def _siftdown(heap: List[Any], size: int, i: int) -> None:
    largest = i
    l = (i << 1) + 1
    r = (i << 1) + 2
    if l < size and heap[largest] < heap[l]:
        largest = l
    if r < size and heap[largest] < heap[r]:
        largest = r
    if largest != i:
        heap[largest], heap[i] = heap[i], heap[largest]
        _siftdown(heap, size, largest)


def heappop(heap: List[Any]) -> Any:
    if heap:
        max = heap[0]
        heap[0] = heap[-1]
        heap.pop()
        size = len(heap)
        _siftdown(heap, size, 0)
        return max


class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for n in nums:
            heappush(heap, n)
        klargest = []
        while len(klargest) < k:
            klargest.append(heappop(heap))
        return klargest[k - 1]

from typing import List, Dict, Optional, Tuple


class BasicTokenizer:

    def __init__(self) -> None:
        self._merges = {}
        self._vocab = {}

    def _get_consecutive_pair_stats(
        self, ids: List[int], counts: Optional[Dict] = None
    ) -> Dict:
        """Given a list of integers, return a dictionary of counts of
        consecutive pairs.

        Optionally allows to update an existing dictionary of counts.

        Example:
        >>> [1, 2, 3, 1, 2] -> {(1, 2): 2, (2, 3): 1, (3, 1): 1}
        """
        counts = counts or {}
        # iterate consecutive elements
        for i1, i2 in zip(ids, ids[1:]):
            counts[(i1, i2)] = counts.get((i1, i2), 0) + 1
        return counts

    def _merge_consecutive_pair(
        self, ids: List[int], pair: Tuple[int, int], idx: int
    ) -> List[int]:
        """In the list of integers (ids), replace all consecutive occurrences
        of pair with the new integer token idx.

        Example:
        >>> ids=[1, 2, 3, 1, 2], pair=(1, 2), idx=4 -> [4, 3, 4]
        """
        out = []
        i = 0
        while i < len(ids):
            # if not at the very last position AND the pair matches, replace it
            if ids[i] == pair[0] and i < len(ids) - 1 and ids[i + 1] == pair[1]:
                out.append(idx)
                i += 2
            else:
                out.append(ids[i])
                i += 1
        return out

    def train(self, text: str, vocab_size: int = 256) -> None:
        assert vocab_size >= 256
        n_merges = vocab_size - 256

        ids = list(text.encode("utf-8"))
        self._vocab = {idx: bytes([idx]) for idx in range(256)}
        # iteratively merge the most common pairs to create new
        # tokens; (int, int) -> int
        for i in range(n_merges):
            consecutive_pair_stats = self._get_consecutive_pair_stats(ids)
            if not consecutive_pair_stats:
                break
            (i1, i2) = max(consecutive_pair_stats, key=consecutive_pair_stats.get)
            # mint a new token: assign it the next available id
            idx = 256 + i
            ids = self._merge_consecutive_pair(ids, (i1, i2), idx)
            self._merges[(i1, i2)] = idx
            self._vocab[idx] = self._vocab[i1] + self._vocab[i2]

    def encode(self, text: str) -> List[int]:
        ids = list(text.encode("utf-8"))
        while len(ids) >= 2:
            consecutive_pair_stats = self._get_consecutive_pair_stats(ids)
            (i1, i2) = min(
                consecutive_pair_stats, key=lambda p: self._merges.get(p, float("inf"))
            )
            # if we did not learn this pair then break
            if (i1, i2) not in self._merges:
                break
            idx = self._merges[(i1, i2)]
            ids = self._merge_consecutive_pair(ids, (i1, i2), idx)
        return ids

    def decode(self, ids: List[int]) -> str:
        text_bytes = b"".join(self._vocab[id] for id in ids)
        return text_bytes.decode("utf-8", errors="replace")

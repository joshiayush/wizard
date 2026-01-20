class Solution:

    def _is_palindrome(self, s: str) -> bool:
        return s == s[::-1]

    def longestPalindrome(self, s: str) -> str:
        if not s or self._is_palindrome(s):
            return s
        _palindrome_to_count_map = {}
        s_len = len(s)
        for i in range(s_len):
            current_longest_palindrome = ""
            for j in range(1, s_len):
                sub = s[i : j + 1] if j + 1 <= s_len else s[i:j]
                if self._is_palindrome(sub):
                    if len(current_longest_palindrome) < len(sub):
                        current_longest_palindrome = sub
                else:
                    if (
                        not current_longest_palindrome in _palindrome_to_count_map
                        and current_longest_palindrome
                    ):
                        _palindrome_to_count_map[current_longest_palindrome] = len(
                            current_longest_palindrome
                        )
                        if len(current_longest_palindrome) > len(s) // 2:
                            break
            if (
                not current_longest_palindrome in _palindrome_to_count_map
                and current_longest_palindrome
            ):
                _palindrome_to_count_map[current_longest_palindrome] = len(
                    current_longest_palindrome
                )
        longest_palindrome = sorted(
            _palindrome_to_count_map.items(), key=lambda kv: kv[1], reverse=True
        )[0][0]
        return longest_palindrome

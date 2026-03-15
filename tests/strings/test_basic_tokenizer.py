import pytest

from algos.strings.basic_tokenizer import BasicTokenizer

# Test data - various strings to test tokenization
test_strings = [
    # empty string
    "",
    # single character
    "?",
    # Unicode and emoji
    "hello world!!!? (안녕하세요!) lol123 😉",
    # Wikipedia example
    "aaabdaaabac",
    # Common phrase
    "The quick brown fox jumps over the lazy dog",
    # Numbers only
    "1234567890",
    # Special characters only
    "!!!@@@###",
]


@pytest.mark.parametrize("text", test_strings)
def test_encode_decode_identity(text):
    """Test that encoding and decoding preserves the original text"""
    tokenizer = BasicTokenizer()

    # Train with a reasonable vocabulary size
    tokenizer.train(text, vocab_size=512)

    # Test encode/decode roundtrip
    encoded = tokenizer.encode(text)
    decoded = tokenizer.decode(encoded)

    assert text == decoded, f"Roundtrip failed for: {text}"


def test_wikipedia_example():
    """Test the Wikipedia BPE example from the documentation"""
    tokenizer = BasicTokenizer()
    text = "aaabdaaabac"

    # Train with exactly 3 merges (256 base + 3 new tokens)
    tokenizer.train(text, vocab_size=256 + 3)

    # Encode should produce the expected token sequence
    encoded = tokenizer.encode(text)
    expected = [258, 100, 258, 97, 99]  # Based on Wikipedia example

    assert encoded == expected, f"Expected {expected}, got {encoded}"

    # Decode should return original text
    decoded = tokenizer.decode(encoded)
    assert decoded == text


def test_basic_functionality():
    """Test basic tokenizer functionality"""
    tokenizer = BasicTokenizer()

    # Train on simple text
    text = "hello world"
    tokenizer.train(text, vocab_size=300)

    # Test that we can encode
    encoded = tokenizer.encode(text)
    assert isinstance(encoded, list)
    assert all(isinstance(token, int) for token in encoded)

    # Test that we can decode
    decoded = tokenizer.decode(encoded)
    assert decoded == text


def test_empty_string():
    """Test handling of empty string"""
    tokenizer = BasicTokenizer()

    # Train on some text first
    tokenizer.train("hello world", vocab_size=300)

    # Test empty string
    encoded = tokenizer.encode("")
    decoded = tokenizer.decode(encoded)
    assert decoded == ""


def test_single_character():
    """Test handling of single character"""
    tokenizer = BasicTokenizer()

    # Train on some text first
    tokenizer.train("hello world", vocab_size=300)

    # Test single character
    text = "a"
    encoded = tokenizer.encode(text)
    decoded = tokenizer.decode(encoded)
    assert decoded == text


def test_unicode_handling():
    """Test proper handling of Unicode characters"""
    tokenizer = BasicTokenizer()

    text = "안녕하세요 😊"
    tokenizer.train(text, vocab_size=300)

    encoded = tokenizer.encode(text)
    decoded = tokenizer.decode(encoded)
    assert decoded == text


def test_vocabulary_size_validation():
    """Test that vocabulary size validation works"""
    tokenizer = BasicTokenizer()

    # Should raise error for vocab size < 256
    with pytest.raises(AssertionError):
        tokenizer.train("test", vocab_size=255)


def test_merge_operations():
    """Test that merge operations work correctly"""
    tokenizer = BasicTokenizer()

    # Use text with repeated patterns
    text = "aaaa"
    tokenizer.train(text, vocab_size=257)  # Only one merge

    # Should learn to merge "aa" pairs
    assert len(tokenizer._merges) == 1
    assert (97, 97) in tokenizer._merges  # 'a' = 97 in ASCII


def test_token_ids_in_range():
    """Test that all token IDs are valid"""
    tokenizer = BasicTokenizer()

    text = "hello world"
    tokenizer.train(text, vocab_size=300)

    encoded = tokenizer.encode(text)

    # All token IDs should be in the vocabulary
    for token_id in encoded:
        assert token_id in tokenizer._vocab


def test_consecutive_pair_stats():
    """Test the _get_consecutive_pair_stats helper function"""
    tokenizer = BasicTokenizer()

    ids = [1, 2, 3, 1, 2]
    stats = tokenizer._get_consecutive_pair_stats(ids)

    expected = {(1, 2): 2, (2, 3): 1, (3, 1): 1}
    assert stats == expected


def test_merge_consecutive_pair():
    """Test the _merge_consecutive_pair helper function"""
    tokenizer = BasicTokenizer()

    ids = [1, 2, 3, 1, 2]
    pair = (1, 2)
    idx = 4

    result = tokenizer._merge_consecutive_pair(ids, pair, idx)
    expected = [4, 3, 4]

    assert result == expected


def test_different_vocab_sizes():  
    """Test tokenizer with different vocabulary sizes"""  
    text = "the quick brown fox jumps over the lazy dog " * 10  # Repeat text  
      
    for vocab_size in [256, 300, 400, 512]:  
        tokenizer = BasicTokenizer()  
        tokenizer.train(text, vocab_size=vocab_size)  
          
        encoded = tokenizer.encode(text)  
        decoded = tokenizer.decode(encoded)  
          
        assert decoded == text  
        # Vocabulary size should be <= requested size (may stop early)  
        assert len(tokenizer._vocab) <= vocab_size  
        assert len(tokenizer._vocab) >= 256  # Always has base 256 bytes

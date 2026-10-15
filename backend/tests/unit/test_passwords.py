from app.security.passwords import hash_password, validate_password_strength, verify_password


def test_hash_is_argon2id_and_not_plaintext():
    hashed = hash_password("Sample-Pass-123")
    assert hashed.startswith("$argon2id$")
    assert "Sample-Pass-123" not in hashed


def test_verify_accepts_correct_and_rejects_wrong_password():
    hashed = hash_password("Sample-Pass-123")
    assert verify_password(hashed, "Sample-Pass-123")
    assert not verify_password(hashed, "sample-pass-123")


def test_verify_handles_missing_or_corrupt_hash():
    assert not verify_password(None, "anything")
    assert not verify_password("not-a-hash", "anything")


def test_password_strength_rules():
    assert validate_password_strength("Long-Enough-Pass-1") == []
    assert validate_password_strength("Short-1")  # too short
    assert validate_password_strength("alllowercase-pass-1")  # no upper case
    assert validate_password_strength("No-Digits-In-Here")  # no digit

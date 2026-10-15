from app.security.rate_limit import RateLimiter


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


def test_blocks_after_limit_and_reports_retry_after():
    clock = FakeClock()
    limiter = RateLimiter(limit=3, window_seconds=60, clock=clock)
    assert [limiter.hit("k")[0] for _ in range(3)] == [True, True, True]
    allowed, retry_after = limiter.hit("k")
    assert not allowed
    assert 1 <= retry_after <= 61


def test_window_slides_and_keys_are_independent():
    clock = FakeClock()
    limiter = RateLimiter(limit=1, window_seconds=10, clock=clock)
    assert limiter.hit("a")[0]
    assert not limiter.hit("a")[0]
    assert limiter.hit("b")[0]
    clock.now += 10.5
    assert limiter.hit("a")[0]


def test_reset_clears_key():
    limiter = RateLimiter(limit=1, window_seconds=60)
    limiter.hit("a")
    limiter.reset("a")
    assert limiter.hit("a")[0]

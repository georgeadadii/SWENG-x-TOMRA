import pytest

@pytest.fixture(scope="session", autouse=True)
def setup_and_teardown():
    """Setup and teardown for all tests."""
    # Setup code (if needed)
    yield
    # Teardown code (if needed)
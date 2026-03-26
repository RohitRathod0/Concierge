import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["version"] == "2.0.0"
    assert "features" in payload
    
def test_auth_endpoints_exist():
    # Will fail 422 if no body, but shows endpoint exists
    response = client.post("/auth/login")
    assert response.status_code == 422

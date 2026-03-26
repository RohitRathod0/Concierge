import urllib.request
import json
from urllib.error import HTTPError

req = urllib.request.Request(
    'http://127.0.0.1:8000/auth/login',
    method='POST',
    data=json.dumps({'email': 'test@example.com', 'password': 'password'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print(response.getcode())
        print(response.read().decode())
except HTTPError as e:
    print(e.getcode())
    print(e.read().decode())
except Exception as e:
    print(e)

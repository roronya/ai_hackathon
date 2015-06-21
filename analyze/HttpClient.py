import requests
import json

class HttpClient:
    def get(self, url):
        response = requests.get(url)
        return response.text

    def post(self, url, values):
        response = requests.post(url, data = json.dumps(values), headers = {"Content-type": "application/json; charset=utf-8"})
        return response.text

#httpclient = HttpClient()
#print(httpclient.get('http://example.com'))
#print(httpclient.post('http://localhost:5000/result', {'text': 'hogehoge'}))
        

import urllib.request
import urllib.parse
import json

class HttpClient:
    def get(self, url):
        response = urllib.request.urlopen(url)
        return response.read()

    def post(self, url, values):
        data = json.dumps(values)
        data = data.encode('utf-8')
        request = urllib.request.Request(url, data, headers={"Content-type": "application/json"})
        response = urllib.request.urlopen(request)
        
        return response.read()

#httpclient = HttpClient()
#print(httpclient.get('http://example.com'))
#print(httpclient.post('http://localhost:5000/result', {'text': 'hogehoge'}))
        

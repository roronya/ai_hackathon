# -*- coding: utf-8 -*-

import numpy as np
import pandas as pd
from pandas import DataFrame, Series
import json
import requests

ranking_url = 'https://itunes.apple.com/jp/rss/topfreeapplications/limit=100/json'
raw_ranking = requests.get(ranking_url).json()
ranking = [{'id': entry['id']['attributes']['im:id'], 'name': entry['im:name']}for entry in raw_ranking['feed']['entry']]

data = []
for element in ranking:
    review_url = 'https://itunes.apple.com/jp/rss/customerreviews/id={0}/json'.format(element['id'])
    raw_reviews = requests.get(review_url).json()
    try:
        reviews = [review['content']['label'] for review in raw_reviews['feed']['entry'][1:50]]
        for review in reviews:
            data.append({'id': element['id'], 'name': element['name'], 'review': review.encode('utf-8')})
    except KeyError:
        continue
data = Series(data)

data.to_csv('reviews.csv')

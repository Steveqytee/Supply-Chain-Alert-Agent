import pandas as pd
import requests
import json
import os

base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
df = os.path.join(base_path, 'data', 'orders.csv')

# 2. logic(find the error order)
anomalies = df[(df['total_amount'] > 5000) | (df['stock_level'] < 5)].copy()

# 3. save as JSON to bolt
anomalies.to_json('flagged_orders.json', orient='records', indent=4)


n8n_url = "https://stevetee.app.n8n.cloud/webhook-test/3e64fee6-9188-4710-a9f5-efac11fa1040"

# data create
data_to_send = {"status": "success", "message": "test start"}

# send request
try:
    # add timeout prevent stuck
    response = requests.post(n8n_url, json=data_to_send, timeout=10)
    print(f"response code: {response.status_code}")
    print(f"response details: {response.text}")
except Exception as e:
    print(f"connection error: {e}")


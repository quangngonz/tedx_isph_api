from flask import Flask, jsonify, request
import pyqrcode
import os
import dotenv
from supabase import create_client
from storage3.exceptions import StorageApiError

dotenv.load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

app = Flask(__name__)

@app.route("/api/generate_qr", methods=["GET"])
def generate_qr():
    response = supabase.table('ticket_info').select('id', 'name').execute()
    tickets = response.data

    qr_urls = {}
    for ticket in tickets:
        qr_code = pyqrcode.create(ticket['id'])
        file_name = f"{ticket['id']}.png"

        qr_code.png(file_name, scale=6)

        try:
            supabase.storage.from_("qr-codes").get(file_name)
            supabase.storage.from_("qr-codes").remove([file_name])
        except StorageApiError:
            pass

        with open(file_name, 'rb') as file:
            supabase.storage.from_("qr-codes").upload(file_name, file)
            public_url = supabase.storage.from_("qr-codes").get_public_url(file_name)
            qr_urls[ticket['id']] = public_url

        os.remove(file_name)

    return jsonify({'message': 'QR codes generated successfully', 'qr_urls': qr_urls})

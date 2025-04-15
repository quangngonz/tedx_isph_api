import pyqrcode
import png
from supabase import create_client
import os
import dotenv
from storage3.exceptions import StorageApiError

# Load environment variables
dotenv.load_dotenv()

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

# Function to generate QR codes and upload them
def handler(request):
    response = supabase.table('ticket_info').select('id', 'name').execute()
    tickets = response.data

    qr_urls = {}
    for ticket in tickets:
        qr_code = pyqrcode.create(ticket['id'])
        file_name = f"{ticket['id']}.png"

        # Save QR code to temporary location
        qr_code.png(file_name, scale=6)

        # Check if the file exists in Supabase Storage
        try:
            file_exists = supabase.storage.from_("qr-codes").get(file_name)
            # If the file exists, delete it before uploading the new one
            if file_exists:
                supabase.storage.from_("qr-codes").remove([file_name])
        except StorageApiError:
            # File doesn't exist, no action needed
            pass

        # Upload the QR code to Supabase Storage
        with open(file_name, 'rb') as file:
            storage_response = supabase.storage.from_("qr-codes").upload(file_name, file)
            public_url = supabase.storage.from_("qr-codes").get_public_url(file_name)
            qr_urls[ticket['id']] = public_url

        os.remove(file_name)  # Clean up the temporary QR code file

    return {
        'statusCode': 200,
        'body': {'message': 'QR codes generated successfully', 'qr_urls': qr_urls}
    }

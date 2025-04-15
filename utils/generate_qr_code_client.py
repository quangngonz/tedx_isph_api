import pyqrcode
import png
from supabase import create_client, Client
from storage3.exceptions import StorageApiError
import tempfile
import os
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv()

# Initialize Supabase client using environment variables
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Fetch ticket info from Supabase
response = supabase.table('ticket_info').select('id', 'name', 'phone', 'email', 'attendance').execute()
tickets = response.data

# Function to generate and upload QR code for each ticket
def generate_and_upload_qr(ticket):
    qr_code = pyqrcode.create(ticket['id'])
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
        temp_file_name = temp_file.name
        qr_code.png(temp_file_name, scale=6)
        
        try:
            # Upload to Supabase Storage (use ticket id as file name)
            with open(temp_file_name, 'rb') as file:
                file_name_in_storage = f"qr-codes/{ticket['id']}.png"
                storage_response = supabase.storage.from_("qr-codes").upload(file_name_in_storage, file)
            
            # Get the public URL of the uploaded file
            public_url = supabase.storage.from_("qr-codes").get_public_url(file_name_in_storage)
            return public_url
        
        except StorageApiError as e:
            print(f"Error uploading file {temp_file_name}: {e}")
            return None
        finally:
            # Clean up the temporary file after uploading
            os.remove(temp_file_name)

# Generate QR codes and get the URLs
qr_urls = {}
for ticket in tickets:
    qr_url = generate_and_upload_qr(ticket)
    if qr_url:
        qr_urls[ticket['id']] = qr_url

# Save the URLs to qr-codes_url.txt
with open("qr-codes_url.txt", "w") as file:
    for ticket_id, url in qr_urls.items():
        file.write(f"Ticket ID: {ticket_id}, QR Code URL: {url}\n")

print("QR code URLs have been saved to qr-codes_url.txt")

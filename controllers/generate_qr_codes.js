import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import fs from 'fs';
import tempfile from 'tempfile';
import dotenv from 'dotenv';
import { PassThrough } from 'stream'; // Import PassThrough directly from 'stream'

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Function to generate and upload QR code to Supabase
const generateAndUploadQr = async (ticket) => {
  try {
    const filePath = tempfile({ suffix: '.png' });

    // Generate QR code and write to file stream
    await QRCode.toFileStream(fs.createWriteStream(filePath), ticket.id);
    console.log(`QR code generated for ticket ${ticket.id}`);

    const fileStream = fs.createReadStream(filePath);
    const fileNameInStorage = `qr-codes/${ticket.id}.png`;

    // Remove the file if it exists
    await supabase.storage.from('qr-codes').remove([fileNameInStorage]);

    const duplexStream = fileStream.pipe(new PassThrough());
    const { data, error: uploadError } = await supabase.storage
      .from('qr-codes')
      .upload(fileNameInStorage, duplexStream, {
        contentType: 'image/png',
        duplex: 'half',
      });

    if (uploadError) {
      console.error(
        `Error uploading QR code for ticket ${ticket.id}: ${uploadError.message}`
      );
      throw new Error(uploadError.message);
    }

    fs.unlinkSync(filePath); // Clean up temporary file
    console.log(`QR code uploaded successfully for ticket ${ticket.id}`);

    // Get the public URL of the uploaded QR code
    const { data: publicURL, error: urlError } = await supabase.storage
      .from('qr-codes')
      .getPublicUrl(fileNameInStorage);

    if (urlError) {
      console.error(
        `Error fetching public URL for ticket ${ticket.id}:`,
        urlError.message
      );
    }

    console.log(`Public URL for ticket ${ticket.id}: ${publicURL.publicUrl}`);
    return publicURL.publicUrl;
  } catch (error) {
    console.error(`Error processing ticket ${ticket.id}: ${error.message}`);
    return null;
  }
};

// Controller function to generate QR codes for all tickets and return their URLs
const generateQrCodes = async (req, res) => {
  try {
    // Fetch ticket info from Supabase
    const { data: tickets, error: fetchError } = await supabase
      .from('ticket_info')
      .select('id, name, phone, email, attendance');

    if (fetchError) return res.status(500).json({ error: fetchError.message });

    // Generate QR codes for each ticket
    const qrUrls = {};
    for (const ticket of tickets) {
      const qrUrl = await generateAndUploadQr(ticket);
      if (qrUrl) qrUrls[ticket.id] = qrUrl;
    }

    // Return the generated QR code URLs
    res.json(qrUrls);
  } catch (err) {
    console.error('Error generating QR codes:', err);
    res
      .status(500)
      .json({ error: 'An error occurred while generating QR codes.' });
  }
};

export default generateQrCodes;

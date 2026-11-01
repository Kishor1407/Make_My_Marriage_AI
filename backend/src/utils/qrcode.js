const QRCode = require('qrcode');

const generateQRCodeDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = {
  generateQRCodeDataUrl
};


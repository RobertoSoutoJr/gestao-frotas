const jsQR = require('jsqr');
const sharp = require('sharp');

/**
 * Attempts to decode a QR code from an image buffer.
 * NFC-e QR codes contain a URL to SEFAZ with the access key.
 *
 * @param {Buffer} imageBuffer - Raw image data (JPEG/PNG)
 * @returns {Promise<object|null>} Parsed NFC-e data or null if no QR found
 */
async function parseNfceFromImage(imageBuffer) {
  try {
    // Convert image to raw RGBA pixel data using sharp
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Attempt QR code detection
    const qrCode = jsQR(
      new Uint8ClampedArray(data.buffer),
      info.width,
      info.height,
    );

    if (!qrCode || !qrCode.data) return null;

    return parseNfceUrl(qrCode.data);
  } catch (err) {
    console.warn('[nfce-parser] QR decode failed:', err.message);
    return null;
  }
}

/**
 * Parses NFC-e SEFAZ URL to extract structured data.
 * NFC-e QR code URLs follow this pattern:
 *   https://www.nfce.fazenda.gov.br/portal/consultarNFCe.aspx?p=CHAVE|2|1|...
 *   or various state SEFAZ URLs with chNFe=CHAVE param
 *
 * Access key (chave de acesso) has 44 digits with embedded info:
 *   [2] UF  [4] AAMM  [14] CNPJ  [2] mod  [3] série  [9] nNF  [1] tpEmis  [8] cNF  [1] cDV
 */
function parseNfceUrl(qrData) {
  if (!qrData || typeof qrData !== 'string') return null;

  let chaveAcesso = null;

  // Pattern 1: p=CHAVE|... (common format)
  const pMatch = qrData.match(/[?&]p=(\d{44})/);
  if (pMatch) chaveAcesso = pMatch[1];

  // Pattern 2: chNFe=CHAVE
  if (!chaveAcesso) {
    const chMatch = qrData.match(/chNFe=(\d{44})/);
    if (chMatch) chaveAcesso = chMatch[1];
  }

  // Pattern 3: Just 44 consecutive digits somewhere in the string
  if (!chaveAcesso) {
    const rawMatch = qrData.match(/(\d{44})/);
    if (rawMatch) chaveAcesso = rawMatch[1];
  }

  if (!chaveAcesso) return null;

  // Parse access key fields
  const uf = chaveAcesso.substring(0, 2);
  const aamm = chaveAcesso.substring(2, 6);
  const cnpj = chaveAcesso.substring(6, 20);
  const modelo = chaveAcesso.substring(20, 22); // 65 = NFC-e, 55 = NF-e
  const serie = chaveAcesso.substring(22, 25);
  const numero = chaveAcesso.substring(25, 34);

  // Format CNPJ: 12.345.678/0001-99
  const cnpjFormatado = cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );

  // Parse date (AAMM → MM/AA)
  const ano = `20${aamm.substring(0, 2)}`;
  const mes = aamm.substring(2, 4);

  return {
    chave_acesso: chaveAcesso,
    cnpj_emissor: cnpjFormatado,
    cnpj_raw: cnpj,
    uf_codigo: uf,
    data_emissao_mes: `${mes}/${ano}`,
    modelo: modelo === '65' ? 'NFC-e' : modelo === '55' ? 'NF-e' : modelo,
    serie: serie.replace(/^0+/, '') || '0',
    numero_nfce: numero.replace(/^0+/, '') || '0',
    qr_url: qrData,
  };
}

module.exports = { parseNfceFromImage, parseNfceUrl };

import { Router } from 'express';
import {
  getAllQrCodes,
  getQrCodeById,
  getQrCodeByCode,
  createQrCode,
  recordQrCodeScan,
  getQrCodeScans,
  linkQrCodeToMaterialLocation,
  deleteQrCode,
  searchQrCodesByEntity
} from '../controllers/qrCodeController';

const router = Router();

// QR code routes
router.get('/qr-codes', getAllQrCodes);
router.get('/qr-codes/search', searchQrCodesByEntity);
router.get('/qr-codes/:id', getQrCodeById);
router.get('/qr-codes/code/:code', getQrCodeByCode);
router.get('/orders/:orderId/qr-codes', getQrCodesByOrder);
router.post('/qr-codes', createQrCode);
router.post('/qr-codes/scan', recordQrCodeScan);
router.get('/qr-codes/:id/scans', getQrCodeScans);
router.post('/qr-codes/link-material', linkQrCodeToMaterialLocation);
router.delete('/qr-codes/:id', deleteQrCode);

export default router;
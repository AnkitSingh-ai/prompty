import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateImageWithDALLE,
  generateImageWithGemini,
  generateImageWithStableDiffusion,
  generateTextWithGPT,
  generateTextWithClaude,
  generateTextWithGemini,
  generateVideoWithSora,
  generateVideoWithRunway,
  generateMusicWithSuno,
  generateVoiceWithElevenLabs,
  generateContent,
  getAvailableModels,
  checkAPIKeys
} from '../controllers/aiController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Image Generation Routes
router.post('/generate-image/dalle', generateImageWithDALLE);
router.post('/generate-image/gemini', generateImageWithGemini);
router.post('/generate-image/stable-diffusion', generateImageWithStableDiffusion);

// Text Generation Routes
router.post('/generate-text/gpt', generateTextWithGPT);
router.post('/generate-text/claude', generateTextWithClaude);
router.post('/generate-text/gemini', generateTextWithGemini);

// Video Generation Routes
router.post('/generate-video/sora', generateVideoWithSora);
router.post('/generate-video/runway', generateVideoWithRunway);

// Audio Generation Routes
router.post('/generate-audio/suno', generateMusicWithSuno);
router.post('/generate-audio/elevenlabs', generateVoiceWithElevenLabs);

// Generic Generation Route
router.post('/generate', generateContent);

// Utility Routes
router.get('/models', getAvailableModels);
router.get('/check-keys', checkAPIKeys);

export default router;

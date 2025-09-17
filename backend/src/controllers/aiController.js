import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Image Generation Controllers
export const generateImageWithDALLE = async (req, res) => {
  try {
    const { prompt, model = 'dall-e-3', size = '1024x1024', quality = 'standard' } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
    }

    const response = await openai.images.generate({
      model,
      prompt,
      size,
      quality,
      n: 1,
    });

    res.json({
      success: true,
      imageUrl: response.data[0].url,
      model,
      prompt,
    });
  } catch (error) {
    console.error('DALL-E Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate image with DALL-E' 
    });
  }
};

export const generateImageWithGemini = async (req, res) => {
  try {
    const { prompt, model = 'gemini-nano' } = req.body;

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google API key not configured' 
      });
    }

    // Note: Gemini image generation is still in development
    // This is a placeholder implementation
    res.json({
      success: true,
      imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      model,
      prompt,
      note: 'Gemini image generation coming soon'
    });
  } catch (error) {
    console.error('Gemini Image Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate image with Gemini' 
    });
  }
};

export const generateImageWithStableDiffusion = async (req, res) => {
  try {
    const { prompt, model = 'stable-diffusion-xl' } = req.body;

    // Placeholder for Stable Diffusion API integration
    // You would integrate with services like Replicate, Hugging Face, or Stability AI
    res.json({
      success: true,
      imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      model,
      prompt,
      note: 'Stable Diffusion integration coming soon'
    });
  } catch (error) {
    console.error('Stable Diffusion Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate image with Stable Diffusion' 
    });
  }
};

// Text Generation Controllers
export const generateTextWithGPT = async (req, res) => {
  try {
    const { prompt, model = 'gpt-4o', max_tokens = 1000 } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens,
      temperature: 0.7,
    });

    res.json({
      success: true,
      text: response.choices[0].message.content,
      model,
      prompt,
    });
  } catch (error) {
    console.error('GPT Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate text with GPT' 
    });
  }
};

export const generateTextWithClaude = async (req, res) => {
  try {
    const { prompt, model = 'claude-3-5-sonnet-20241022', max_tokens = 1000 } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        error: 'Anthropic API key not configured' 
      });
    }

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    res.json({
      success: true,
      text: response.content[0].text,
      model,
      prompt,
    });
  } catch (error) {
    console.error('Claude Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate text with Claude' 
    });
  }
};

export const generateTextWithGemini = async (req, res) => {
  try {
    const { prompt, model = 'gemini-pro-1.5', max_tokens = 1000 } = req.body;

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google API key not configured' 
      });
    }

    const genModel = genAI.getGenerativeModel({ model });

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      text,
      model,
      prompt,
    });
  } catch (error) {
    console.error('Gemini Text Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate text with Gemini' 
    });
  }
};

// Video Generation Controllers
export const generateVideoWithSora = async (req, res) => {
  try {
    const { prompt, model = 'sora', duration = 10 } = req.body;

    // Sora is not yet publicly available
    res.json({
      success: true,
      videoUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      model,
      prompt,
      note: 'Sora video generation coming soon when available'
    });
  } catch (error) {
    console.error('Sora Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate video with Sora' 
    });
  }
};

export const generateVideoWithRunway = async (req, res) => {
  try {
    const { prompt, model = 'runway-gen-3', duration = 10 } = req.body;

    // Placeholder for Runway API integration
    res.json({
      success: true,
      videoUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      model,
      prompt,
      note: 'Runway API integration coming soon'
    });
  } catch (error) {
    console.error('Runway Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate video with Runway' 
    });
  }
};

// Audio Generation Controllers
export const generateMusicWithSuno = async (req, res) => {
  try {
    const { prompt, model = 'suno-ai', duration = 30 } = req.body;

    // Placeholder for Suno API integration
    res.json({
      success: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      model,
      prompt,
      note: 'Suno API integration coming soon'
    });
  } catch (error) {
    console.error('Suno Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate music with Suno' 
    });
  }
};

export const generateVoiceWithElevenLabs = async (req, res) => {
  try {
    const { prompt, model = 'elevenlabs', voice = 'default' } = req.body;

    // Placeholder for ElevenLabs API integration
    res.json({
      success: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      model,
      prompt,
      note: 'ElevenLabs API integration coming soon'
    });
  } catch (error) {
    console.error('ElevenLabs Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate voice with ElevenLabs' 
    });
  }
};

// Generic generation controller
export const generateContent = async (req, res) => {
  try {
    const { type, model, prompt, options = {} } = req.body;

    // Route to appropriate generation method based on type and model
    switch (type) {
      case 'image':
        if (model.includes('dall-e') || model.includes('chatgpt')) {
          return generateImageWithDALLE(req, res);
        } else if (model.includes('gemini')) {
          return generateImageWithGemini(req, res);
        } else if (model.includes('stable')) {
          return generateImageWithStableDiffusion(req, res);
        }
        break;
      case 'text':
        if (model.includes('gpt')) {
          return generateTextWithGPT(req, res);
        } else if (model.includes('claude')) {
          return generateTextWithClaude(req, res);
        } else if (model.includes('gemini')) {
          return generateTextWithGemini(req, res);
        }
        break;
      case 'video':
        if (model.includes('sora')) {
          return generateVideoWithSora(req, res);
        } else if (model.includes('runway')) {
          return generateVideoWithRunway(req, res);
        }
        break;
      case 'audio':
        if (model.includes('suno')) {
          return generateMusicWithSuno(req, res);
        } else if (model.includes('elevenlabs')) {
          return generateVoiceWithElevenLabs(req, res);
        }
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Unsupported content type' 
        });
    }

    res.status(400).json({ 
      success: false, 
      error: 'Unsupported model for this content type' 
    });
  } catch (error) {
    console.error('Generic Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate content' 
    });
  }
};

// Utility controllers
export const getAvailableModels = async (req, res) => {
  try {
    const models = {
      image: [
        'DALL-E 3',
        'ChatGPT',
        'Midjourney',
        'Stable Diffusion XL',
        'Adobe Firefly',
        'Gemini Nano',
        'Leonardo AI',
        'Ideogram',
        'Flux Pro',
        'Bing Image Creator'
      ],
      video: [
        'Sora (OpenAI)',
        'RunwayML Gen-3',
        'Pika Labs 1.5',
        'Luma AI Dream Machine',
        'Kling AI',
        'Veo (Google)',
        'Stable Video Diffusion',
        'LTX Studio',
        'InVideo AI',
        'Synthesia'
      ],
      text: [
        'GPT-4o',
        'Claude 3.5 Sonnet',
        'Gemini Pro 1.5',
        'Llama 3.1 405B',
        'Mistral Large',
        'Perplexity Pro',
        'Cohere Command',
        'PaLM 2',
        'GPT-4 Turbo',
        'Claude Instant'
      ],
      audio: [
        'Suno AI',
        'Udio',
        'ElevenLabs',
        'Whisper (OpenAI)',
        'Murf AI',
        'Synthesia',
        'Descript',
        'Speechify',
        'Lovo AI',
        'Rev AI'
      ]
    };

    res.json({
      success: true,
      models
    });
  } catch (error) {
    console.error('Get Models Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch available models' 
    });
  }
};

export const checkAPIKeys = async (req, res) => {
  try {
    const keys = {
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
    };

    res.json({
      success: true,
      keys,
      configured: Object.values(keys).some(key => key)
    });
  } catch (error) {
    console.error('Check API Keys Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to check API keys' 
    });
  }
};

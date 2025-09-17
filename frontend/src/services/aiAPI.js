import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class AIAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/ai`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Image Generation APIs
  async generateImageWithDALLE(prompt, model = 'dall-e-3', size = '1024x1024', quality = 'standard') {
    try {
      const response = await this.api.post('/generate-image/dalle', {
        prompt,
        model,
        size,
        quality,
      });
      return response.data;
    } catch (error) {
      console.error('DALL-E API Error:', error);
      throw new Error('Failed to generate image with DALL-E');
    }
  }

  async generateImageWithGemini(prompt, model = 'gemini-nano') {
    try {
      const response = await this.api.post('/generate-image/gemini', {
        prompt,
        model,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate image with Gemini');
    }
  }

  async generateImageWithStableDiffusion(prompt, model = 'stable-diffusion-xl') {
    try {
      const response = await this.api.post('/generate-image/stable-diffusion', {
        prompt,
        model,
      });
      return response.data;
    } catch (error) {
      console.error('Stable Diffusion API Error:', error);
      throw new Error('Failed to generate image with Stable Diffusion');
    }
  }

  // Text Generation APIs
  async generateTextWithGPT(prompt, model = 'gpt-4o', maxTokens = 1000) {
    try {
      const response = await this.api.post('/generate-text/gpt', {
        prompt,
        model,
        max_tokens: maxTokens,
      });
      return response.data;
    } catch (error) {
      console.error('GPT API Error:', error);
      throw new Error('Failed to generate text with GPT');
    }
  }

  async generateTextWithClaude(prompt, model = 'claude-3-5-sonnet', maxTokens = 1000) {
    try {
      const response = await this.api.post('/generate-text/claude', {
        prompt,
        model,
        max_tokens: maxTokens,
      });
      return response.data;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('Failed to generate text with Claude');
    }
  }

  async generateTextWithGemini(prompt, model = 'gemini-pro-1.5', maxTokens = 1000) {
    try {
      const response = await this.api.post('/generate-text/gemini', {
        prompt,
        model,
        max_tokens: maxTokens,
      });
      return response.data;
    } catch (error) {
      console.error('Gemini Text API Error:', error);
      throw new Error('Failed to generate text with Gemini');
    }
  }

  // Video Generation APIs
  async generateVideoWithSora(prompt, model = 'sora', duration = 10) {
    try {
      const response = await this.api.post('/generate-video/sora', {
        prompt,
        model,
        duration,
      });
      return response.data;
    } catch (error) {
      console.error('Sora API Error:', error);
      throw new Error('Failed to generate video with Sora');
    }
  }

  async generateVideoWithRunway(prompt, model = 'runway-gen-3', duration = 10) {
    try {
      const response = await this.api.post('/generate-video/runway', {
        prompt,
        model,
        duration,
      });
      return response.data;
    } catch (error) {
      console.error('Runway API Error:', error);
      throw new Error('Failed to generate video with Runway');
    }
  }

  // Audio Generation APIs
  async generateMusicWithSuno(prompt, model = 'suno-ai', duration = 30) {
    try {
      const response = await this.api.post('/generate-audio/suno', {
        prompt,
        model,
        duration,
      });
      return response.data;
    } catch (error) {
      console.error('Suno API Error:', error);
      throw new Error('Failed to generate music with Suno');
    }
  }

  async generateVoiceWithElevenLabs(prompt, model = 'elevenlabs', voice = 'default') {
    try {
      const response = await this.api.post('/generate-audio/elevenlabs', {
        prompt,
        model,
        voice,
      });
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error:', error);
      throw new Error('Failed to generate voice with ElevenLabs');
    }
  }

  // Generic AI generation method
  async generateContent(type, model, prompt, options = {}) {
    try {
      const response = await this.api.post('/generate', {
        type,
        model,
        prompt,
        options,
      });
      return response.data;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error(`Failed to generate ${type} content`);
    }
  }

  // Get available models
  async getAvailableModels() {
    try {
      const response = await this.api.get('/models');
      return response.data;
    } catch (error) {
      console.error('Get Models Error:', error);
      throw new Error('Failed to fetch available models');
    }
  }

  // Check API key status
  async checkAPIKeys() {
    try {
      const response = await this.api.get('/check-keys');
      return response.data;
    } catch (error) {
      console.error('Check API Keys Error:', error);
      throw new Error('Failed to check API keys');
    }
  }
}

export const aiAPI = new AIAPI();

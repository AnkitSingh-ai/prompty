import React, { useState } from 'react';
import { Zap, Image, Video, Type, Settings, Download, Copy, RefreshCw } from 'lucide-react';
import { aiAPI } from '../../services/aiAPI';

const Playground = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);

  const tabs = [
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'audio', label: 'Audio', icon: Zap },
  ];

  const aiModels = {
    image: [
      'DALL-E 3', // OpenAI's latest image generator
      'ChatGPT', // OpenAI's conversational AI with image generation
      'Midjourney', // Most popular artistic AI
      'Stable Diffusion XL', // Open source leader
      'Adobe Firefly', // Adobe's commercial AI
      'Gemini Nano', // Google's latest model
      'Leonardo AI', // Character design specialist
      'Ideogram', // Text in images expert
      'Flux Pro', // High-quality generation
      'Bing Image Creator' // Microsoft's free option
    ],
    video: [
      'Sora (OpenAI)', // Most advanced video AI
      'RunwayML Gen-3', // Professional video tool
      'Pika Labs 1.5', // Popular animation AI
      'Luma AI Dream Machine', // 3D video specialist
      'Kling AI', // Long-form content
      'Veo (Google)', // Google's video AI
      'Stable Video Diffusion', // Open source video
      'LTX Studio', // Storyboarding tool
      'InVideo AI', // Marketing videos
      'Synthesia' // Avatar video platform
    ],
    text: [
      'GPT-4o', // OpenAI's flagship model
      'Claude 3.5 Sonnet', // Anthropic's best
      'Gemini Pro 1.5', // Google's multimodal AI
      'Llama 3.1 405B', // Meta's open source
      'Mistral Large', // European AI leader
      'Perplexity Pro', // Research specialist
      'Cohere Command', // Enterprise focused
      'PaLM 2', // Google's language model
      'GPT-4 Turbo', // Fast GPT-4 variant
      'Claude Instant' // Fast Claude variant
    ],
    audio: [
      'Suno AI', // Music generation leader
      'Udio', // Song creation platform
      'ElevenLabs', // Voice cloning expert
      'Whisper (OpenAI)', // Speech recognition
      'Murf AI', // Text-to-speech specialist
      'Synthesia', // AI voiceovers
      'Descript', // Podcast editing
      'Speechify', // Text-to-speech app
      'Lovo AI', // Character voices
      'Rev AI' // Transcription service
    ],
  };

  const [selectedModel, setSelectedModel] = useState(aiModels[activeTab][0]);

  // Check API keys on component mount
  React.useEffect(() => {
    const checkAPIKeys = async () => {
      try {
        const result = await aiAPI.checkAPIKeys();
        setApiKeysConfigured(result.configured);
      } catch (error) {
        console.error('Failed to check API keys:', error);
        setApiKeysConfigured(false);
      }
    };
    checkAPIKeys();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      let result;
      
      switch (activeTab) {
        case 'image':
          if (selectedModel.includes('DALL-E') || selectedModel.includes('ChatGPT')) {
            result = await aiAPI.generateImageWithDALLE(prompt);
          } else if (selectedModel.includes('Gemini')) {
            result = await aiAPI.generateImageWithGemini(prompt);
          } else if (selectedModel.includes('Stable')) {
            result = await aiAPI.generateImageWithStableDiffusion(prompt);
          } else {
            // Fallback for other models
            result = await aiAPI.generateContent('image', selectedModel, prompt);
          }
          setGeneratedContent(result.imageUrl);
          break;

        case 'text':
          if (selectedModel.includes('GPT')) {
            result = await aiAPI.generateTextWithGPT(prompt);
          } else if (selectedModel.includes('Claude')) {
            result = await aiAPI.generateTextWithClaude(prompt);
          } else if (selectedModel.includes('Gemini')) {
            result = await aiAPI.generateTextWithGemini(prompt);
          } else {
            // Fallback for other models
            result = await aiAPI.generateContent('text', selectedModel, prompt);
          }
          setGeneratedContent(result.text);
          break;

        case 'video':
          if (selectedModel.includes('Sora')) {
            result = await aiAPI.generateVideoWithSora(prompt);
          } else if (selectedModel.includes('Runway')) {
            result = await aiAPI.generateVideoWithRunway(prompt);
          } else {
            // Fallback for other models
            result = await aiAPI.generateContent('video', selectedModel, prompt);
          }
          setGeneratedContent(result.videoUrl);
          break;

        case 'audio':
          if (selectedModel.includes('Suno')) {
            result = await aiAPI.generateMusicWithSuno(prompt);
          } else if (selectedModel.includes('ElevenLabs')) {
            result = await aiAPI.generateVoiceWithElevenLabs(prompt);
          } else {
            // Fallback for other models
            result = await aiAPI.generateContent('audio', selectedModel, prompt);
          }
          setGeneratedContent(result.audioUrl);
          break;

        default:
          throw new Error('Unsupported content type');
      }

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

    } catch (error) {
      console.error('Generation error:', error);
      setError(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const examplePrompts = {
    image: [
      'Cyberpunk cityscape with neon lights and flying cars',
      'Anime character with magical powers and detailed armor',
      'Professional product shot of luxury watch',
      'Fantasy dragon in mystical forest landscape',
      'Modern minimalist logo with clean typography'
    ],
    video: [
      'Spaceship landing on alien planet with cinematic effects',
      'Animated character dancing in colorful music video',
      'Time-lapse of city transforming from day to night',
      '3D robot learning to walk in futuristic lab',
      'Marketing video showcasing new smartphone features'
    ],
    text: [
      'Analyze the latest AI trends and their impact on business',
      'Create a business plan for a tech startup',
      'Generate creative story ideas for science fiction',
      'Write professional email templates for customer service',
      'Create educational content about machine learning'
    ],
    audio: [
      'Upbeat pop song about digital innovation and technology',
      'Professional voiceover for tech product demonstration',
      'Relaxing ambient music for meditation and focus',
      'Energetic podcast intro with music and voice',
      'Character voice for fantasy audiobook narration'
    ]
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Playground
          </h1>
          <p className="text-gray-400">
            Create amazing content using the latest AI models
          </p>
        </div>

        {/* API Key Warning */}
        {!apiKeysConfigured && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-300">
                  API Keys Required
                </h3>
                <div className="mt-2 text-sm text-yellow-200">
                  <p>To use AI models, you need to configure API keys in your backend environment variables:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>OPENAI_API_KEY for DALL-E, ChatGPT, GPT models</li>
                    <li>GOOGLE_API_KEY for Gemini models</li>
                    <li>ANTHROPIC_API_KEY for Claude models</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">
                  Generation Error
                </h3>
                <div className="mt-2 text-sm text-red-200">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Content Type Tabs */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Content Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSelectedModel(aiModels[tab.id][0]);
                        setGeneratedContent(null);
                      }}
                      className={`
                        flex flex-col items-center p-3 rounded-lg text-sm font-medium transition-all
                        ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Model</h3>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              >
                {aiModels[activeTab].map((model) => (
                  <option key={model} value={model} className="bg-slate-800">
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Example Prompts */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Example Prompts</h3>
              <div className="space-y-2">
                {examplePrompts[activeTab].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full p-3 text-left text-sm text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Quality</label>
                  <select className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                    <option>Standard</option>
                    <option>HD</option>
                    <option>Ultra HD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Aspect Ratio</label>
                  <select className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                    <option>Square (1:1)</option>
                    <option>Portrait (3:4)</option>
                    <option>Landscape (16:9)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Generation Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Prompt</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe what you want to generate...`}
                className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || generating}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Generated Content */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Content</h3>
                {generatedContent && (
                  <button className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                )}
              </div>

              {generating ? (
                <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Generating your {activeTab}...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  {activeTab === 'image' ? (
                    <img
                      src={generatedContent}
                      alt="Generated content"
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white">{generatedContent}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center border-2 border-dashed border-white/10">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your generated content will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
import React from 'react';
import { Sparkles, Zap, Brain, Rocket, Star, Image, Video, Type, Wand2, Lock } from 'lucide-react';

const Playground = () => {
  const features = [
    {
      icon: Image,
      title: 'AI Image Generation',
      description: 'Create stunning images with DALL-E, Midjourney, and Stable Diffusion',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Video,
      title: 'Video Creation',
      description: 'Generate professional videos with Sora and RunwayML',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Type,
      title: 'Text Generation',
      description: 'Write content with GPT-4, Claude, and Gemini',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Wand2,
      title: 'Audio & Music',
      description: 'Compose music and create voiceovers with AI',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="p-6 min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Main Content - Blurred Mockup */}
        <div className="relative">
          {/* Blurred Background Content */}
          <div className="filter blur-md opacity-40 pointer-events-none">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">AI Playground</h1>
              <p className="text-gray-400">Create amazing content using the latest AI models</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Content Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['Images', 'Videos', 'Text', 'Audio'].map((type, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg text-sm">
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Model</h3>
                  <div className="h-10 bg-white/5 rounded-lg"></div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
                  <div className="space-y-4">
                    <div className="h-10 bg-white/5 rounded-lg"></div>
                    <div className="h-10 bg-white/5 rounded-lg"></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Prompt</h3>
                  <div className="h-32 bg-white/5 rounded-lg mb-4"></div>
                  <div className="flex justify-end">
                    <div className="h-12 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Generated Content</h3>
                  <div className="aspect-video bg-white/5 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bright Coming Soon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center px-4">
              {/* Lock Icon with Glow */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                </div>
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce">
                  <Lock className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Coming Soon Badge */}
              <div className="mb-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl shadow-orange-500/50 animate-pulse">
                <Sparkles className="w-5 h-5 mr-2 text-white animate-spin" style={{animationDuration: '3s'}} />
                <span className="text-white font-bold text-lg tracking-wide">COMING SOON</span>
                <Sparkles className="w-5 h-5 ml-2 text-white animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}} />
              </div>

              {/* Main Heading - Extra Bright */}
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-white text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-gradient">
                  AI Playground
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white font-semibold mb-4 drop-shadow-lg">
                🚀 Revolutionary AI Tools Are On The Way
              </p>

              <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
                We're building something extraordinary! Get ready to create stunning images, videos, text, and audio with the world's most advanced AI models.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                {['DALL-E 3', 'GPT-4', 'Midjourney', 'Sora', 'Claude'].map((model, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium shadow-lg hover:scale-105 transition-transform"
                  >
                    {model}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button className="px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300 animate-pulse flex items-center mx-auto">
                <Brain className="w-6 h-6 mr-3" />
                Notify Me When Ready
                <Rocket className="w-6 h-6 ml-3" />
              </button>

              {/* Stars */}
              <div className="mt-8 flex items-center justify-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse"
                    style={{animationDelay: `${i * 0.2}s`}}
                  />
                ))}
              </div>

              <p className="mt-6 text-sm text-gray-300 font-medium">
                Expected Launch: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">Q2 2025</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Features Showcase - Also Blurred */}
        <div className="mt-16 filter blur-sm opacity-30 pointer-events-none">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Upcoming Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Playground;

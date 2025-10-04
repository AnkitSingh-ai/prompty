import React from 'react';
import { Sparkles, Zap, Brain, Rocket, Star, Image, Video, Type, Wand2 } from 'lucide-react';

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

  const stats = [
    { label: '10+ AI Models', value: 'Multiple Providers' },
    { label: 'High Quality', value: '4K Resolution' },
    { label: 'Fast Generation', value: 'Real-time' },
    { label: 'Advanced Features', value: 'Coming Soon' }
  ];

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative">
          {/* Main Hero Section */}
          <div className="text-center mb-16 pt-8">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400 animate-pulse" />
              <span className="text-purple-300 font-medium text-sm">Coming Soon</span>
            </div>

            {/* Title with Gradient */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text animate-gradient">
              AI Playground
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Create amazing content with the world's most advanced AI models
            </p>

            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              We're working hard to bring you an incredible AI generation experience. Get ready to create stunning images, videos, text, and audio with cutting-edge technology!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Notify Me When Ready
              </button>
              <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all transform hover:scale-105 flex items-center">
                <Rocket className="w-5 h-5 mr-2" />
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-purple-500/30 transition-all transform hover:scale-105"
              >
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              What's Coming
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all transform hover:scale-105 hover:shadow-xl"
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview Mockup */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Sneak Preview
            </h2>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden">
              {/* Overlay "Coming Soon" */}
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-10 rounded-2xl">
                <div className="text-center">
                  <Zap className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-4xl font-bold text-white mb-3">Get Ready!</h3>
                  <p className="text-xl text-gray-300">The most powerful AI tools are coming to Prompty</p>
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                    <Star className="w-6 h-6 text-yellow-400 animate-pulse delay-100" />
                    <Star className="w-6 h-6 text-yellow-400 animate-pulse delay-200" />
                  </div>
                </div>
              </div>

              {/* Mockup Content (Blurred) */}
              <div className="filter blur-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="h-10 bg-white/5 rounded-lg"></div>
                    <div className="h-40 bg-white/5 rounded-lg"></div>
                    <div className="h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="aspect-video bg-white/5 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-12 bg-white/5 rounded-lg"></div>
                      <div className="h-12 bg-white/5 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Development Timeline
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              We're working around the clock to bring you this amazing feature. Stay tuned for updates!
            </p>

            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <span className="text-green-400 text-xl">✓</span>
                </div>
                <span className="ml-2 text-sm text-gray-400">Design Complete</span>
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-yellow-500"></div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center animate-pulse">
                  <span className="text-yellow-400 text-xl">⚡</span>
                </div>
                <span className="ml-2 text-sm text-gray-400">In Development</span>
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-gray-500"></div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-500/20 border-2 border-gray-500 flex items-center justify-center">
                  <span className="text-gray-400 text-xl">⏳</span>
                </div>
                <span className="ml-2 text-sm text-gray-400">Coming Soon</span>
              </div>
            </div>

            <div className="inline-flex items-center px-6 py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-purple-300 font-medium">Expected Launch: Q2 2025</span>
            </div>
          </div>

          {/* Subscribe Form */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Be the First to Know
            </h3>
            <p className="text-gray-400 mb-6">
              Enter your email to get notified when AI Playground launches
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
                Notify Me
              </button>
            </div>
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

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Playground;

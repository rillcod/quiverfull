import { ArrowRight, Star, Heart, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onScheduleTour: () => void;
}

export default function HeroSection({ onScheduleTour }: HeroSectionProps) {
  return (
    <section id="home" className="relative bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 animate-bounce">
          <Star className="w-8 h-8 text-yellow-400 fill-current" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <Heart className="w-6 h-6 text-pink-400 fill-current" />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-10 h-10 text-purple-400" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🌟 Proudly Nigerian • Montessori Excellence
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Nurturing Young Minds with 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-500"> Excellence</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              At The Quiverfull School, we embrace the Montessori method to foster independence, 
              creativity, and a lifelong love of learning in children from creche through Primary 6.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onScheduleTour}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                Schedule a Tour
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="border-2 border-green-500 text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-500 hover:text-white transition-all duration-200 transform hover:scale-105">
                Learn About Montessori
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">5+</div>
                <div className="text-gray-600 text-sm">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">200+</div>
                <div className="text-gray-600 text-sm">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">98%</div>
                <div className="text-gray-600 text-sm">Parent Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-200 to-green-200 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-orange-400 to-green-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <div className="text-4xl">🎓</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Child-Centered Learning
                  </h3>
                  <p className="text-gray-600">
                    Every child learns at their own pace in our carefully prepared Montessori environments.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xl">💝</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
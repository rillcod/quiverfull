import React, { useState } from 'react';
import { BookOpen, Star, Award, Target, Lightbulb, Heart, Users, Globe, Palette, Music, Calculator, Microscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AcademicsPage() {
  const [selectedSubject, setSelectedSubject] = useState('language');
  const navigate = useNavigate();

  const subjects = [
    {
      id: 'language',
      name: 'Language Arts',
      icon: BookOpen,
      color: 'from-blue-400 to-blue-600',
      emoji: '📚',
      description: 'Reading, writing, and storytelling adventures!',
      activities: [
        { name: 'Phonetic Reading', description: 'Learning sounds and building words like magic!', icon: '🔤' },
        { name: 'Creative Writing', description: 'Writing your own amazing stories!', icon: '✍️' },
        { name: 'Poetry & Rhymes', description: 'Playing with words and sounds!', icon: '🎵' },
        { name: 'Drama & Theater', description: 'Acting out stories and characters!', icon: '🎭' },
        { name: 'Library Adventures', description: 'Discovering new books and authors!', icon: '📖' },
        { name: 'Storytelling Circle', description: 'Sharing stories with friends!', icon: '👥' }
      ],
      skills: [
        'Reading fluency and comprehension',
        'Creative and expressive writing',
        'Vocabulary development',
        'Public speaking confidence',
        'Critical thinking through literature'
      ]
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: Calculator,
      color: 'from-green-400 to-green-600',
      emoji: '🔢',
      description: 'Numbers, patterns, and problem-solving fun!',
      activities: [
        { name: 'Hands-On Number Work', description: 'Learning numbers through concrete materials!', icon: '🟡' },
        { name: 'Geometry Puzzles', description: 'Exploring shapes and patterns!', icon: '🔺' },
        { name: 'Math Games', description: 'Playing games that make math fun!', icon: '🎲' },
        { name: 'Real-World Problems', description: 'Using math in everyday situations!', icon: '🏪' },
        { name: 'Pattern Recognition', description: 'Finding patterns everywhere!', icon: '🌈' },
        { name: 'Measurement Fun', description: 'Measuring and comparing objects!', icon: '📏' }
      ],
      skills: [
        'Number sense and operations',
        'Geometric understanding',
        'Problem-solving strategies',
        'Mathematical reasoning',
        'Real-world application'
      ]
    },
    {
      id: 'science',
      name: 'Science & Nature',
      icon: Microscope,
      color: 'from-purple-400 to-purple-600',
      emoji: '🔬',
      description: 'Discovering the wonders of our amazing world!',
      activities: [
        { name: 'Nature Walks', description: 'Exploring plants, animals, and ecosystems!', icon: '🌿' },
        { name: 'Science Experiments', description: 'Mixing, measuring, and discovering!', icon: '⚗️' },
        { name: 'Weather Station', description: 'Tracking weather patterns!', icon: '🌤️' },
        { name: 'Garden Projects', description: 'Growing plants and learning about life cycles!', icon: '🌱' },
        { name: 'Animal Studies', description: 'Learning about different creatures!', icon: '🐛' },
        { name: 'Space Exploration', description: 'Discovering planets and stars!', icon: '🚀' }
      ],
      skills: [
        'Scientific observation and inquiry',
        'Understanding life cycles',
        'Environmental awareness',
        'Hypothesis and experimentation',
        'Classification and categorization'
      ]
    },
    {
      id: 'cultural',
      name: 'Cultural Studies',
      icon: Globe,
      color: 'from-orange-400 to-orange-600',
      emoji: '🌍',
      description: 'Exploring our world and celebrating diversity!',
      activities: [
        { name: 'World Geography', description: 'Discovering countries and continents!', icon: '🗺️' },
        { name: 'Nigerian Heritage', description: 'Learning about our rich culture!', icon: '🇳🇬' },
        { name: 'History Timeline', description: 'Traveling through time!', icon: '⏰' },
        { name: 'Cultural Celebrations', description: 'Celebrating festivals from around the world!', icon: '🎉' },
        { name: 'Language Exploration', description: 'Learning words from different languages!', icon: '🗣️' },
        { name: 'Art & Traditions', description: 'Creating art from different cultures!', icon: '🎨' }
      ],
      skills: [
        'Global awareness and understanding',
        'Cultural appreciation and respect',
        'Historical thinking',
        'Geographic knowledge',
        'Social studies concepts'
      ]
    },
    {
      id: 'arts',
      name: 'Creative Arts',
      icon: Palette,
      color: 'from-pink-400 to-pink-600',
      emoji: '🎨',
      description: 'Expressing creativity through art, music, and movement!',
      activities: [
        { name: 'Painting & Drawing', description: 'Creating beautiful artwork!', icon: '🖌️' },
        { name: 'Music & Rhythm', description: 'Singing, dancing, and playing instruments!', icon: '🎵' },
        { name: 'Craft Projects', description: 'Making amazing things with our hands!', icon: '✂️' },
        { name: 'Drama & Performance', description: 'Acting and expressing emotions!', icon: '🎭' },
        { name: 'Photography', description: 'Capturing beautiful moments!', icon: '📸' },
        { name: 'Digital Art', description: 'Creating art with technology!', icon: '💻' }
      ],
      skills: [
        'Creative expression and imagination',
        'Fine motor skill development',
        'Aesthetic appreciation',
        'Self-confidence through performance',
        'Cultural and artistic awareness'
      ]
    },
    {
      id: 'practical',
      name: 'Practical Life',
      icon: Heart,
      color: 'from-red-400 to-red-600',
      emoji: '🏠',
      description: 'Learning real-life skills that build confidence!',
      activities: [
        { name: 'Cooking Together', description: 'Preparing healthy snacks and meals!', icon: '👩‍🍳' },
        { name: 'Gardening', description: 'Taking care of plants and flowers!', icon: '🌻' },
        { name: 'Cleaning & Organization', description: 'Keeping our space tidy and beautiful!', icon: '🧹' },
        { name: 'Self-Care Skills', description: 'Learning to take care of ourselves!', icon: '🧼' },
        { name: 'Community Helpers', description: 'Learning about different jobs!', icon: '👮‍♀️' },
        { name: 'Money & Shopping', description: 'Understanding how money works!', icon: '💰' }
      ],
      skills: [
        'Independence and self-reliance',
        'Fine and gross motor coordination',
        'Responsibility and care for environment',
        'Social skills and cooperation',
        'Life skills preparation'
      ]
    }
  ];

  const assessmentMethods = [
    {
      title: 'Portfolio Assessment',
      description: 'We collect your amazing work throughout the year to show your growth!',
      icon: '📁',
      color: 'from-blue-400 to-blue-500'
    },
    {
      title: 'Observation Records',
      description: 'Teachers watch and note all the wonderful things you do and learn!',
      icon: '👀',
      color: 'from-green-400 to-green-500'
    },
    {
      title: 'Student Conferences',
      description: 'You get to share your learning journey with teachers and parents!',
      icon: '💬',
      color: 'from-purple-400 to-purple-500'
    },
    {
      title: 'Project Presentations',
      description: 'Show off your amazing projects to classmates and family!',
      icon: '🎯',
      color: 'from-orange-400 to-orange-500'
    }
  ];

  const currentSubject = subjects.find(s => s.id === selectedSubject) || subjects[0];
  const IconComponent = currentSubject.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 animate-bounce">
            <Star className="w-12 h-12 text-yellow-400 fill-current" />
          </div>
          <div className="absolute top-20 right-20 animate-pulse">
            <Heart className="w-8 h-8 text-pink-400 fill-current" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-bounce" style={{ animationDelay: '1s' }}>
            <Lightbulb className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-6">
              Our Amazing 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"> Learning! 📚</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Learning is the greatest adventure! Come discover all the exciting subjects 
              and activities that make school the most fun place to be! ✨
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              How We Learn 🌟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              onClick={() => navigate('/about')}
              className="text-center p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-6xl mb-4">🤲</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Hands-On Learning</h3>
              <p className="text-gray-700 text-lg">
                We learn by touching, exploring, and doing! Our special materials make 
                learning fun and easy to understand.
              </p>
            </div>

            <div 
              onClick={() => navigate('/about')}
              className="text-center p-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Adventure</h3>
              <p className="text-gray-700 text-lg">
                You get to pick what you want to learn about! This makes learning 
                exciting because you're following your interests.
              </p>
            </div>

            <div 
              onClick={() => navigate('/about')}
              className="text-center p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Learn Together</h3>
              <p className="text-gray-700 text-lg">
                Big kids help little kids, and everyone learns from each other! 
                It's like having a big, happy learning family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Selection */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Pick a Subject to Explore! 🚀
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjects.map((subject) => {
              const SubjectIcon = subject.icon;
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`p-4 rounded-2xl font-bold text-center transition-all duration-300 transform hover:scale-105 ${
                    selectedSubject === subject.id
                      ? `bg-gradient-to-r ${subject.color} text-white shadow-xl`
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  <SubjectIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl mb-2">{subject.emoji}</div>
                  <div className="text-sm font-semibold">{subject.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Subject Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subject Header */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r ${currentSubject.color} rounded-full mb-6 shadow-2xl`}>
              <IconComponent className="w-12 h-12 text-white" />
            </div>
            <div className="text-6xl mb-4">{currentSubject.emoji}</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {currentSubject.name}
            </h2>
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {currentSubject.description}
            </p>
          </div>

          {/* Subject Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Activities */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                Fun Activities We Do! 🎉
              </h3>
              <div className="space-y-4">
                {currentSubject.activities.map((activity, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{activity.icon}</div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">{activity.name}</h4>
                        <p className="text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Amazing Skills You'll Gain! 🌟
              </h3>
              <div className="space-y-4">
                {currentSubject.skills.map((skill, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                    <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 mt-1" />
                    <p className="text-gray-700 font-medium">{skill}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Methods */}
      <section className="py-16 bg-gradient-to-br from-green-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              How We Celebrate Your Learning! 🎊
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just give tests - we celebrate all the amazing ways you show your learning!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {assessmentMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${method.color} rounded-full mb-4 shadow-lg`}>
                    <div className="text-2xl">{method.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Learning Adventure? 🚀</h2>
          <p className="text-xl mb-8">
            Come see our amazing classrooms and meet our wonderful teachers! 
            Learning has never been this much fun!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="bg-white text-purple-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg"
            >
              Visit Our School! 🏫
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-purple-500 transition-all transform hover:scale-105"
            >
              Meet Our Teachers! 👩‍🏫
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
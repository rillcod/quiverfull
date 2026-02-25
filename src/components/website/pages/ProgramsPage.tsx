import React, { useState } from 'react';
import { Baby, Users, GraduationCap, Clock, MapPin, Star, Heart, Sparkles, BookOpen, Palette, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState('toddler');
  const navigate = useNavigate();

  const programs = [
    {
      id: 'toddler',
      title: 'Toddler Adventures',
      subtitle: 'Ages 18 months - 3 years',
      icon: Baby,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      emoji: '🧸',
      description: 'A magical place where little ones take their first steps into learning!',
      dailySchedule: [
        { time: '8:00 AM', activity: 'Welcome Circle & Free Play', icon: '🌅' },
        { time: '9:00 AM', activity: 'Practical Life Activities', icon: '🧹' },
        { time: '10:00 AM', activity: 'Snack Time & Social Skills', icon: '🍎' },
        { time: '10:30 AM', activity: 'Sensory Exploration', icon: '👋' },
        { time: '11:30 AM', activity: 'Story Time & Songs', icon: '📚' },
        { time: '12:00 PM', activity: 'Goodbye Circle', icon: '👋' }
      ],
      activities: [
        { name: 'Water Play', description: 'Splashing and pouring for fine motor skills!', icon: '💧' },
        { name: 'Sorting Games', description: 'Learning colors, shapes, and sizes!', icon: '🔵' },
        { name: 'Music & Movement', description: 'Dancing and singing together!', icon: '🎵' },
        { name: 'Art Exploration', description: 'Finger painting and creative expression!', icon: '🎨' },
        { name: 'Garden Time', description: 'Planting seeds and watching them grow!', icon: '🌱' },
        { name: 'Cooking Fun', description: 'Making simple snacks together!', icon: '👩‍🍳' }
      ],
      learningGoals: [
        'Independence in daily activities',
        'Language development through songs and stories',
        'Social skills and sharing',
        'Fine and gross motor development',
        'Emotional regulation and confidence'
      ]
    },
    {
      id: 'primary',
      title: 'Primary Explorers',
      subtitle: 'Ages 3 - 6 years (Creche - Basic 2)',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      emoji: '🎨',
      description: 'Where curiosity meets discovery in our prepared learning environments!',
      dailySchedule: [
        { time: '8:00 AM', activity: 'Morning Circle & Planning', icon: '🌅' },
        { time: '8:30 AM', activity: 'Work Cycle - Individual Choice', icon: '📚' },
        { time: '10:00 AM', activity: 'Snack & Community Time', icon: '🍎' },
        { time: '10:30 AM', activity: 'Outdoor Exploration', icon: '🌳' },
        { time: '11:30 AM', activity: 'Group Lessons & Projects', icon: '👥' },
        { time: '12:30 PM', activity: 'Lunch & Rest Time', icon: '🍽️' },
        { time: '1:30 PM', activity: 'Creative Arts & Music', icon: '🎭' },
        { time: '2:00 PM', activity: 'Closing Circle & Reflection', icon: '🌟' }
      ],
      activities: [
        { name: 'Practical Life', description: 'Real work that builds confidence and skills!', icon: '🧹' },
        { name: 'Sensorial Materials', description: 'Exploring the world through our senses!', icon: '👋' },
        { name: 'Mathematics', description: 'Numbers come alive with golden beads!', icon: '🔢' },
        { name: 'Language Arts', description: 'Reading, writing, and storytelling adventures!', icon: '📖' },
        { name: 'Cultural Studies', description: 'Discovering our world and universe!', icon: '🌍' },
        { name: 'Peace Education', description: 'Learning to solve problems together!', icon: '☮️' }
      ],
      learningGoals: [
        'Reading and writing fluency',
        'Mathematical concepts through concrete materials',
        'Scientific thinking and observation',
        'Cultural awareness and geography',
        'Leadership and mentoring younger children'
      ]
    },
    {
      id: 'elementary',
      title: 'Elementary Scholars',
      subtitle: 'Ages 6 - 12 years (Basic 3 - Basic 6)',
      icon: GraduationCap,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      emoji: '🔬',
      description: 'Big kids, big questions, and amazing discoveries await!',
      dailySchedule: [
        { time: '8:00 AM', activity: 'Morning Meeting & Goal Setting', icon: '🌅' },
        { time: '8:30 AM', activity: 'Core Academic Work', icon: '📚' },
        { time: '10:00 AM', activity: 'Research & Projects', icon: '🔍' },
        { time: '11:00 AM', activity: 'Physical Education', icon: '⚽' },
        { time: '12:00 PM', activity: 'Lunch & Social Time', icon: '🍽️' },
        { time: '1:00 PM', activity: 'Specialized Subjects', icon: '🎭' },
        { time: '2:00 PM', activity: 'Going Out Experiences', icon: '🚌' },
        { time: '3:00 PM', activity: 'Reflection & Planning', icon: '📝' }
      ],
      activities: [
        { name: 'Great Lessons', description: 'Epic stories about the universe and life!', icon: '🌌' },
        { name: 'Research Projects', description: 'Becoming experts on topics you love!', icon: '🔬' },
        { name: 'Mathematical Explorations', description: 'Advanced math through hands-on discovery!', icon: '📐' },
        { name: 'Literature Circles', description: 'Reading and discussing amazing books!', icon: '📚' },
        { name: 'Science Experiments', description: 'Real experiments and discoveries!', icon: '⚗️' },
        { name: 'Community Service', description: 'Making our world a better place!', icon: '🤝' }
      ],
      learningGoals: [
        'Independent research and critical thinking',
        'Advanced mathematical reasoning',
        'Scientific method and experimentation',
        'Historical and cultural understanding',
        'Leadership and social responsibility'
      ]
    }
  ];

  const currentProgram = programs.find(p => p.id === selectedProgram) || programs[0];
  const IconComponent = currentProgram.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 animate-bounce">
            <BookOpen className="w-12 h-12 text-blue-400" />
          </div>
          <div className="absolute top-20 right-20 animate-pulse">
            <Palette className="w-8 h-8 text-purple-400" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-bounce" style={{ animationDelay: '1s' }}>
            <Music className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-6">
              Our Amazing 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"> Programs! 🎓</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Every age group has its own special learning adventure designed just for them! 
              Come explore what makes each program magical! ✨
            </p>
          </div>
        </div>
      </section>

      {/* Program Selection */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {programs.map((program) => {
              const ProgramIcon = program.icon;
              return (
                <button
                  key={program.id}
                  onClick={() => setSelectedProgram(program.id)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    selectedProgram === program.id
                      ? `bg-gradient-to-r ${program.color} text-white shadow-xl`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ProgramIcon className="w-6 h-6" />
                  <span>{program.title}</span>
                  <span className="text-2xl">{program.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Program Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Program Header */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r ${currentProgram.color} rounded-full mb-6 shadow-2xl`}>
              <IconComponent className="w-12 h-12 text-white" />
            </div>
            <div className="text-6xl mb-4">{currentProgram.emoji}</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {currentProgram.title}
            </h2>
            <p className="text-xl text-gray-600 mb-6">{currentProgram.subtitle}</p>
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {currentProgram.description}
            </p>
          </div>

          {/* Program Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Schedule */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Our Fun Day! 📅
              </h3>
              <div className="space-y-4">
                {currentProgram.dailySchedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <div className="font-semibold text-blue-600">{item.time}</div>
                      <div className="text-gray-700">{item.activity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Activities */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                What We Do! 🎯
              </h3>
              <div className="space-y-4">
                {currentProgram.activities.map((activity, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{activity.icon}</div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">{activity.name}</h4>
                        <p className="text-gray-600 text-sm">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                What You'll Learn! 🌟
              </h3>
              <div className="space-y-4">
                {currentProgram.learningGoals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                    <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 mt-1" />
                    <p className="text-gray-700 font-medium">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-400 to-red-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Learning Adventure? 🚀</h2>
          <p className="text-xl mb-8">
            Come visit us and see these amazing programs in action! 
            We can't wait to meet you and your family!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="bg-white text-orange-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg"
            >
              Schedule a Visit! 📅
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-orange-500 transition-all transform hover:scale-105"
            >
              Ask Questions! 💬
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
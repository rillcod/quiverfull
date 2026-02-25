import React from 'react';
import { Calendar, Clock, MapPin, Star, Heart, Gift, Camera, Music, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewsEventsPage() {
  const navigate = useNavigate();

  const upcomingEvents = [
    {
      id: 1,
      title: 'Spring Festival Celebration',
      date: '2025-03-15',
      time: '10:00 AM - 2:00 PM',
      location: 'School Playground',
      description: 'Join us for a colorful celebration of spring with games, food, and performances!',
      image: '🌸',
      category: 'Festival',
      color: 'from-pink-400 to-rose-400'
    },
    {
      id: 2,
      title: 'Science Fair Extravaganza',
      date: '2025-03-22',
      time: '9:00 AM - 12:00 PM',
      location: 'Main Hall',
      description: 'Students showcase their amazing science projects and experiments!',
      image: '🔬',
      category: 'Academic',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 3,
      title: 'Art Gallery Opening',
      date: '2025-04-05',
      time: '3:00 PM - 5:00 PM',
      location: 'Art Studio',
      description: 'Admire the beautiful artwork created by our talented young artists!',
      image: '🎨',
      category: 'Arts',
      color: 'from-purple-400 to-indigo-400'
    },
    {
      id: 4,
      title: 'Family Fun Day',
      date: '2025-04-12',
      time: '11:00 AM - 4:00 PM',
      location: 'Entire Campus',
      description: 'A day of fun activities, games, and bonding for the whole family!',
      image: '👨‍👩‍👧‍👦',
      category: 'Family',
      color: 'from-green-400 to-emerald-400'
    },
    {
      id: 5,
      title: 'Music Concert',
      date: '2025-04-20',
      time: '6:00 PM - 8:00 PM',
      location: 'School Auditorium',
      description: 'Our young musicians perform beautiful songs and showcase their talents!',
      image: '🎵',
      category: 'Performance',
      color: 'from-yellow-400 to-orange-400'
    },
    {
      id: 6,
      title: 'Graduation Ceremony',
      date: '2025-06-15',
      time: '10:00 AM - 12:00 PM',
      location: 'Main Hall',
      description: 'Celebrating our graduating students as they move to their next adventure!',
      image: '🎓',
      category: 'Milestone',
      color: 'from-indigo-400 to-purple-400'
    }
  ];

  const recentNews = [
    {
      id: 1,
      title: 'New Playground Equipment Installed!',
      date: '2025-01-15',
      summary: 'We\'ve added exciting new playground equipment that promotes physical development and outdoor fun!',
      image: '🛝',
      category: 'Facilities'
    },
    {
      id: 2,
      title: 'Outstanding Performance in Math Competition',
      date: '2025-01-10',
      summary: 'Our elementary students won first place in the Lagos State Montessori Math Competition!',
      image: '🏆',
      category: 'Achievement'
    },
    {
      id: 3,
      title: 'New Library Books Arrival',
      date: '2025-01-05',
      summary: 'Over 200 new books have been added to our library, including Nigerian authors and global classics!',
      image: '📚',
      category: 'Learning'
    },
    {
      id: 4,
      title: 'Teacher Training Workshop Success',
      date: '2024-12-20',
      summary: 'Our teachers completed advanced Montessori training to enhance their teaching methods!',
      image: '👩‍🏫',
      category: 'Professional Development'
    }
  ];

  const schoolCalendar = [
    { month: 'January', events: ['New Term Begins', 'Parent Orientation'] },
    { month: 'February', events: ['Valentine\'s Day Celebration', 'Mid-term Break'] },
    { month: 'March', events: ['Spring Festival', 'Science Fair', 'Parent-Teacher Conferences'] },
    { month: 'April', events: ['Art Gallery Opening', 'Family Fun Day', 'Music Concert'] },
    { month: 'May', events: ['Sports Day', 'Cultural Week', 'Field Trips'] },
    { month: 'June', events: ['Graduation Ceremony', 'End of Term', 'Summer Camp Begins'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 animate-bounce">
            <Calendar className="w-12 h-12 text-blue-400" />
          </div>
          <div className="absolute top-20 right-20 animate-pulse">
            <Star className="w-8 h-8 text-yellow-400 fill-current" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-bounce" style={{ animationDelay: '1s' }}>
            <Heart className="w-10 h-10 text-pink-400 fill-current" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-6">
              News & 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"> Events! 📰</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Stay updated with all the exciting happenings at The Quiverfull School! 
              From fun events to amazing achievements, there's always something wonderful going on! ✨
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Exciting Events Coming Up! 🎉
            </h2>
            <p className="text-xl text-gray-600">
              Mark your calendars for these amazing upcoming events!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                <div className={`bg-gradient-to-r ${event.color} p-6 text-white text-center`}>
                  <div className="text-6xl mb-4">{event.image}</div>
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    {event.category}
                  </span>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {event.description}
                  </p>
                  
                  <button 
                    onClick={() => navigate('/contact')}
                    className={`w-full bg-gradient-to-r ${event.color} text-white py-2 px-4 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent News */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Latest School News! 📢
            </h2>
            <p className="text-xl text-gray-600">
              Catch up on all the wonderful things happening at our school!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentNews.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{news.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {news.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(news.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {news.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Calendar */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              School Calendar 2025 📅
            </h2>
            <p className="text-xl text-gray-600">
              Plan ahead with our monthly event calendar!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolCalendar.map((month, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  {month.month}
                </h3>
                <div className="space-y-3">
                  {month.events.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="text-6xl mb-6">📧</div>
          <h2 className="text-4xl font-bold mb-6">Stay Connected with Us! 💌</h2>
          <p className="text-xl mb-8">
            Subscribe to our newsletter to get the latest news and event updates 
            delivered straight to your inbox!
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button 
                onClick={() => navigate('/contact')}
                className="bg-white text-purple-500 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                Subscribe! ✨
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
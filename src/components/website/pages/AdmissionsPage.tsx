import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  DollarSign, 
  Star, 
  Heart, 
  Gift,
  CheckCircle,
  Send,
  Baby,
  Users,
  GraduationCap,
  Clock,
  Award,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    dateOfBirth: '',
    program: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    previousSchool: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const programs = [
    {
      id: 'toddler',
      name: 'Toddler Adventures',
      age: '18 months - 3 years',
      fee: '₦450,000',
      icon: Baby,
      color: 'from-pink-400 to-pink-600',
      emoji: '🧸',
      includes: ['Meals & Snacks', 'Learning Materials', 'Field Trips', 'Medical Care']
    },
    {
      id: 'primary',
      name: 'Primary Explorers',
      age: '3 - 6 years',
      icon: Users,
      fee: '₦550,000',
      color: 'from-blue-400 to-blue-600',
      emoji: '🎨',
      includes: ['Meals & Snacks', 'Learning Materials', 'Field Trips', 'After-School Care', 'Art Supplies']
    },
    {
      id: 'elementary',
      name: 'Elementary Scholars',
      age: '6 - 12 years',
      icon: GraduationCap,
      fee: '₦650,000',
      color: 'from-green-400 to-green-600',
      emoji: '🔬',
      includes: ['Meals & Snacks', 'Learning Materials', 'Field Trips', 'After-School Care', 'Science Lab', 'Going Out Experiences']
    }
  ];

  const admissionSteps = [
    {
      step: 1,
      title: 'Fill Application',
      description: 'Complete our fun registration form below!',
      icon: '📝',
      color: 'from-blue-400 to-blue-500'
    },
    {
      step: 2,
      title: 'Visit Our School',
      description: 'Come see our amazing classrooms and meet our teachers!',
      icon: '🏫',
      color: 'from-green-400 to-green-500'
    },
    {
      step: 3,
      title: 'Meet & Greet',
      description: 'Your child gets to play and explore with us!',
      icon: '🤝',
      color: 'from-purple-400 to-purple-500'
    },
    {
      step: 4,
      title: 'Welcome Home!',
      description: 'Join our big, happy school family!',
      icon: '🎉',
      color: 'from-orange-400 to-orange-500'
    }
  ];

  const requirements = [
    { item: 'Birth Certificate', icon: '📜', description: 'Official copy of your child\'s birth certificate' },
    { item: 'Immunization Records', icon: '💉', description: 'Up-to-date vaccination records' },
    { item: 'Passport Photos', icon: '📸', description: '4 recent passport-sized photographs' },
    { item: 'Previous School Records', icon: '📚', description: 'If transferring from another school' },
    { item: 'Medical Form', icon: '🏥', description: 'Completed health assessment form' },
    { item: 'Parent ID', icon: '🆔', description: 'Valid identification of parent/guardian' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
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
            <Gift className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-6">
              Join Our Amazing 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500"> School Family! 🎒</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Ready to start your child's incredible learning adventure? 
              We can't wait to welcome you to The Quiverfull School family! ✨
            </p>
          </div>
        </div>
      </section>

      {/* Admission Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              How to Join Us! 🌟
            </h2>
            <p className="text-xl text-gray-600">
              It's super easy to become part of our school family!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {admissionSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="relative mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.color} rounded-full shadow-lg`}>
                    <div className="text-3xl">{step.icon}</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{step.step}</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs and Fees */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Our Programs & Fees 💰
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect program for your little one!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program) => {
              const IconComponent = program.icon;
              return (
                <div key={program.id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`bg-gradient-to-r ${program.color} p-6 text-white text-center`}>
                    <div className="text-6xl mb-4">{program.emoji}</div>
                    <IconComponent className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{program.name}</h3>
                    <p className="text-lg opacity-90">{program.age}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-orange-500 mb-2">
                        {program.fee}
                      </div>
                      <p className="text-gray-500">per academic year</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-green-500" />
                        What's Included:
                      </h4>
                      {program.includes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Aid */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="text-4xl mb-4">💝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Need Help with Fees? We're Here for You! 🤗
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Every child deserves an amazing education! We offer payment plans and 
                financial assistance for families who need support.
              </p>
              <button 
                onClick={() => navigate('/contact')}
                className="bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-600 transition-colors transform hover:scale-105 shadow-lg"
              >
                Ask About Financial Help! 💚
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Registration Form 📝
            </h2>
            <p className="text-xl text-gray-600">
              Fill out this form to start your child's amazing journey with us!
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Parent Information */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-500" />
                  Parent/Guardian Information 👨‍👩‍👧‍👦
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent/Guardian Name *
                    </label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => handleInputChange('parentName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Child Information */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  Your Amazing Child! 👶
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child's Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.childName}
                      onChange={(e) => handleInputChange('childName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child's Age *
                    </label>
                    <input
                      type="text"
                      value={formData.childAge}
                      onChange={(e) => handleInputChange('childAge', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 3 years old"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program of Interest *
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) => handleInputChange('program', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a program</option>
                      <option value="toddler">Toddler Adventures (18 months - 3 years)</option>
                      <option value="primary">Primary Explorers (3 - 6 years)</option>
                      <option value="elementary">Elementary Scholars (6 - 12 years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous School (if any)
                    </label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Name of previous school"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions/Allergies
                    </label>
                    <input
                      type="text"
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Any medical conditions we should know about"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Phone className="w-6 h-6 text-red-500" />
                  Emergency Contact 🚨
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Message */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-500" />
                  Tell Us More! 💬
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information or Questions
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Tell us anything special about your child or any questions you have..."
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 px-12 rounded-full font-bold text-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 mx-auto"
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Application Sent! 🎉
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      Submit Application! ✨
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Documents You'll Need 📋
            </h2>
            <p className="text-xl text-gray-600">
              Don't worry! We'll help you gather everything you need!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requirements.map((req, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center">
                  <div className="text-4xl mb-4">{req.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    {req.item}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {req.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-yellow-100 rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="text-3xl mb-3">🤗</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Need Help Getting Documents?
              </h3>
              <p className="text-gray-600">
                Our friendly admissions team is here to help you with any questions 
                about documents or the application process!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="text-6xl mb-6">📞</div>
          <h2 className="text-4xl font-bold mb-6">Questions? We're Here to Help! 💕</h2>
          <p className="text-xl mb-8">
            Our admissions team loves talking to families! 
            Call us anytime or visit our beautiful campus!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <Phone className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Call Us!</h3>
              <p>+234 803 123 4567</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Email Us!</h3>
              <p>admissions@quiverfullschool.ng</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <MapPin className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Visit Us!</h3>
              <p>Victoria Island, Lagos</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/contact')}
            className="bg-white text-purple-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg"
          >
            Schedule a Visit Today! 🏫
          </button>
        </div>
      </section>
    </div>
  );
}
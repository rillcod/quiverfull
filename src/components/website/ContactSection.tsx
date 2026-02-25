import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    childAge: '',
    program: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you! Contact us to learn more about our programs 
            or schedule a visit to our campus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8">
              Visit Our Campus
            </h3>

            {/* Contact Details */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Address</h4>
                  <p className="text-gray-600">
                    123 Education Drive<br />
                    Victoria Island, Lagos<br />
                    Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Phone</h4>
                  <p className="text-gray-600">
                    +234 803 123 4567<br />
                    +234 809 876 5432
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                  <p className="text-gray-600">
                    info@quiverfullschool.ng<br />
                    admissions@quiverfullschool.ng
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Office Hours</h4>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 4:00 PM<br />
                    Saturday: 9:00 AM - 1:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Interactive Map</p>
                <p className="text-sm text-gray-400">Victoria Island, Lagos</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>

                <div>
                  <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Age
                  </label>
                  <input
                    type="text"
                    id="childAge"
                    value={formData.childAge}
                    onChange={(e) => handleInputChange('childAge', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 4 years old"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                  Program of Interest
                </label>
                <select
                  id="program"
                  value={formData.program}
                  onChange={(e) => handleInputChange('program', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a program</option>
                  <option value="toddler">Toddler Program (18 months - 3 years)</option>
                  <option value="primary">Primary Program (3 - 6 years)</option>
                  <option value="elementary">Elementary Program (6 - 12 years)</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your child and any questions you have..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Message Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
              <h4 className="font-semibold text-gray-800 mb-3">
                🏫 Schedule a Campus Tour
              </h4>
              <p className="text-gray-600 mb-4">
                The best way to understand our Montessori approach is to see it in action. 
                We offer guided tours every Tuesday and Thursday at 10:00 AM.
              </p>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors duration-200">
                Book Your Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
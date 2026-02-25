import { Users, Award, Globe, Heart } from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: Users,
      title: 'Child-Centered Approach',
      description: 'Every child is unique. Our Montessori method respects individual learning styles and paces.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Award,
      title: 'Certified Educators',
      description: 'Our teachers are Montessori-trained professionals dedicated to nurturing young minds.',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'We prepare students for a connected world while celebrating Nigerian culture and values.',
      color: 'from-orange-400 to-orange-600'
    },
    {
      icon: Heart,
      title: 'Caring Community',
      description: 'A warm, supportive environment where children, families, and educators grow together.',
      color: 'from-pink-400 to-pink-600'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            About The Quiverfull School
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Founded in 2020, we are Nigeria's premier Montessori institution, dedicated to 
            fostering independence, creativity, and academic excellence in children from 
            creche through Primary 6.
          </p>
        </div>

        {/* Montessori Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              The Montessori Method
            </h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Dr. Maria Montessori's revolutionary approach recognizes that children are 
              naturally eager to learn. Our prepared environments and specially trained 
              teachers guide students to discover their potential through hands-on exploration.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Mixed Age Classrooms</h4>
                  <p className="text-gray-600">Children learn from and teach each other in multi-age environments.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Self-Directed Learning</h4>
                  <p className="text-gray-600">Students choose activities that match their interests and developmental needs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Hands-On Materials</h4>
                  <p className="text-gray-600">Specially designed materials make abstract concepts concrete and understandable.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-100 to-green-100 rounded-3xl p-8 shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-6">🌱</div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4">
                  "Help me to do it myself"
                </h4>
                <p className="text-gray-600 italic">
                  - Dr. Maria Montessori
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full mb-4`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-xl leading-relaxed max-w-4xl mx-auto">
              To provide a nurturing Montessori environment that respects each child's natural 
              development, fosters independence and creativity, and prepares confident, 
              compassionate global citizens rooted in Nigerian values.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
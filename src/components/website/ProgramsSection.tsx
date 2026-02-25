import { Baby, Users, GraduationCap, Clock, MapPin, Star } from 'lucide-react';

export default function ProgramsSection() {
  const programs = [
    {
      id: 'toddler',
      title: 'Toddler Program',
      subtitle: 'Ages 18 months - 3 years',
      icon: Baby,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      description: 'A gentle introduction to learning through exploration and discovery.',
      features: [
        'Toilet training support',
        'Language development',
        'Practical life activities',
        'Sensory exploration',
        'Social skills development'
      ],
      schedule: 'Monday - Friday, 8:00 AM - 12:00 PM',
      classSize: 'Maximum 12 children with 2 teachers',
      highlights: [
        'Prepared environment for toddlers',
        'Parent-child separation support',
        'Individual attention and care'
      ]
    },
    {
      id: 'primary',
      title: 'Primary Program',
      subtitle: 'Ages 3 - 6 years (Creche - Basic 2)',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Foundation years focusing on independence, social skills, and academic readiness.',
      features: [
        'Mixed-age classrooms',
        'Practical life skills',
        'Mathematics with concrete materials',
        'Language and literacy',
        'Cultural studies and science'
      ],
      schedule: 'Monday - Friday, 8:00 AM - 2:00 PM',
      classSize: 'Maximum 25 children with 2 certified teachers',
      highlights: [
        'Three-year cycle program',
        'Leadership opportunities for older children',
        'Preparation for elementary education'
      ]
    },
    {
      id: 'elementary',
      title: 'Elementary Program',
      subtitle: 'Ages 6 - 12 years (Basic 3 - Basic 6)',
      icon: GraduationCap,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      description: 'Advanced learning with emphasis on research, collaboration, and critical thinking.',
      features: [
        'Cosmic education approach',
        'Research and project-based learning',
        'Advanced mathematics and geometry',
        'Nigerian history and culture',
        'Science experiments and exploration'
      ],
      schedule: 'Monday - Friday, 8:00 AM - 3:00 PM',
      classSize: 'Maximum 28 children with 2 certified teachers',
      highlights: [
        'Going out experiences',
        'Student-led conferences',
        'Preparation for secondary education'
      ]
    }
  ];

  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Our Programs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Each program is carefully designed to meet the developmental needs of children 
            at different stages, following authentic Montessori principles.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="space-y-12">
          {programs.map((program, index) => {
            const IconComponent = program.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={program.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  !isEven ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={isEven ? 'lg:pr-8' : 'lg:pl-8'}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${program.color} rounded-full`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        {program.title}
                      </h3>
                      <p className="text-lg text-gray-600 font-medium">
                        {program.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {program.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Key Features:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {program.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Program Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                      <div>
                        <span className="font-semibold text-gray-800">Schedule: </span>
                        <span className="text-gray-600">{program.schedule}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                      <div>
                        <span className="font-semibold text-gray-800">Class Size: </span>
                        <span className="text-gray-600">{program.classSize}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Card */}
                <div className={`${!isEven ? 'lg:col-start-1' : ''}`}>
                  <div className={`${program.bgColor} rounded-3xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300`}>
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">
                        {program.id === 'toddler' ? '🧸' : 
                         program.id === 'primary' ? '🎨' : '🔬'}
                      </div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-4">
                        Program Highlights
                      </h4>
                    </div>
                    
                    <div className="space-y-4">
                      {program.highlights.map((highlight, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 bg-gradient-to-r ${program.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-sm font-bold">{idx + 1}</span>
                            </div>
                            <p className="text-gray-700 font-medium">{highlight}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <button className={`bg-gradient-to-r ${program.color} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}>
                        Learn More About This Program
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              Ready to Begin Your Child's Montessori Journey?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Schedule a tour to see our prepared environments and meet our dedicated educators.
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              Schedule Your Visit Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
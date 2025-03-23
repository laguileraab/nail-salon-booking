import { Link } from 'react-router-dom';

const LandingPage = () => {
  const services = [
    {
      id: 1,
      name: 'Manicure',
      description: 'Professional nail care for your hands, including shaping, cuticle care, and polish.',
      price: 30,
      duration: 45,
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
      name: 'Pedicure',
      description: 'Comprehensive foot care including exfoliation, massage, and polish for beautiful feet.',
      price: 45,
      duration: 60,
      image: 'https://images.unsplash.com/photo-1610124380605-001d67377fbd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      name: 'Gel Nails',
      description: 'Long-lasting, chip-resistant gel polish application for vibrant, glossy nails.',
      price: 40,
      duration: 60,
      image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 4,
      name: 'Acrylic Extensions',
      description: 'Acrylic nail extensions for added length and durability, customized to your preferences.',
      price: 60,
      duration: 90,
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="sm:text-center lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Pamper yourself at</span>
              <span className="block text-accent-600">NailSalon Booking</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
              Experience premium nail care with our professional and dedicated team.
              Book your appointment today and enjoy our relaxing atmosphere and top-quality services.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 md:py-4 md:text-lg md:px-10">
                  Book Now
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link to="/#services" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-accent-700 bg-accent-100 hover:bg-accent-200 md:py-4 md:text-lg md:px-10">
                  View Services
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-accent-50 hidden lg:block">
          <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1867&q=80" alt="Nail salon" />
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-accent-600 font-semibold tracking-wide uppercase">Services</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Our Premium Nail Care Services
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Choose from our range of professional nail treatments performed by our expert technicians.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <div key={service.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                  <div className="flex-shrink-0">
                    <img className="h-48 w-full object-cover" src={service.image} alt={service.name} />
                  </div>
                  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-gray-900">{service.name}</p>
                      <p className="mt-3 text-base text-gray-500">{service.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-accent-600 font-bold">${service.price}</span>
                        <span className="text-gray-500 text-sm ml-1">/ {service.duration} min</span>
                      </div>
                      <Link to="/login" className="text-accent-600 hover:text-accent-800 font-medium">
                        Book Now →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-accent-600 font-semibold tracking-wide uppercase">About Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose NailSalon Booking?
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent-500 text-white mb-4">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Professional & Hygenic</h3>
                <p className="mt-2 text-base text-gray-500">
                  We maintain the highest standards of cleanliness and hygiene, ensuring a safe environment for all our clients.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent-500 text-white mb-4">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Premium Products</h3>
                <p className="mt-2 text-base text-gray-500">
                  We use only high-quality, professional-grade products for all our services to ensure the best results.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent-500 text-white mb-4">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Convenient Booking</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our online booking system makes it easy to schedule appointments at your convenience, 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-accent-600 font-semibold tracking-wide uppercase">Contact Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Get In Touch
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Have questions or need assistance? We're here to help!
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <form className="grid grid-cols-1 gap-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      className="py-3 px-4 block w-full shadow-sm focus:ring-accent-500 focus:border-accent-500 border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="py-3 px-4 block w-full shadow-sm focus:ring-accent-500 focus:border-accent-500 border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="py-3 px-4 block w-full shadow-sm focus:ring-accent-500 focus:border-accent-500 border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Our Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-base text-gray-500">
                    <p>123 Main Street</p>
                    <p>City, State 12345</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-base text-gray-500">
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-base text-gray-500">
                    <p>info@nailsalon.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-base text-gray-500">
                    <p className="font-medium">Business Hours:</p>
                    <p>Monday - Saturday: 9AM - 7PM</p>
                    <p>Sunday: 10AM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

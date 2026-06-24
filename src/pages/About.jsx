const About = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            About Fashion Basket
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Where fashion meets perfection. Discover curated collections for every style and occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Fashion Basket was born from a passion for style and quality. We curate the finest clothing 
              and accessories from around the world to bring you collections that celebrate individuality 
              and timeless elegance. Every piece tells a story, and we're excited to help you find yours.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
                <div className="text-gray-600">Products</div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-600">Brands</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Free shipping on orders over ₹999
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  30-day easy returns
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Authentic products guaranteed
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

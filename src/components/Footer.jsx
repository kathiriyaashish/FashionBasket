const Footer = () => {
  return (
    <footer className="bg-linear-to-r from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Fashion Basket
            </h3>
            <p className="text-gray-400 mb-6">
              Your one-stop shop for trendy clothing and accessories.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">📘</a>
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">🐦</a>
              <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">📷</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/products" className="text-gray-400 hover:text-white transition-colors">Shop</a></li>
              <li><a href="/categories" className="text-gray-400 hover:text-white transition-colors">Categories</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-lg font-bold mb-6">Customer Care</h4>
            <ul className="space-y-3">
              <li><a href="/track-order" className="text-gray-400 hover:text-white transition-colors">Track Order</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contact Info</h4>
            <p className="text-gray-400 mb-4">📧 support@fashionbasket.com</p>
            <p className="text-gray-400 mb-4">📱 +91 98765 43210</p>
            <p className="text-gray-400">📍 Surat, Gujarat</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Fashion Basket. All rights reserved. | Made with ❤️ in Surat</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

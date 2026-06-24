import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Star,
  Package,
  Zap,
  ShoppingCart,
  Eye,
} from "lucide-react";
import api from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products/featured?limit=12"),
        api.get("/categories/cat"),
      ]);

      setFeaturedProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load products & categories");
      setFeaturedProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const handleQuickAddToCart = async (product) => {
    try {
      await addToCart({
        _id: product._id,
        quantity: 1,
        size: "M",
        color: "Black",
      });
    } catch (error) {
      toast.error("Stock not available");
    }
  };

 if (loading) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-900/20 via-purple-900/20 to-slate-900/20 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
            <div className="lg:col-span-6 space-y-6 animate-pulse">
              <div className="h-10 w-48 bg-white/30 backdrop-blur-sm rounded-full"></div>
              <div className="space-y-4">
                <div className="h-16 bg-white/20 rounded-2xl w-4/5"></div>
                <div className="h-12 bg-white/20 rounded-xl w-3/5"></div>
                <div className="h-8 bg-white/20 rounded-lg w-2/5"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-14 w-44 bg-white/80 rounded-full"></div>
                <div className="h-14 w-40 bg-white/30 backdrop-blur-sm rounded-full"></div>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="h-80 lg:h-96 bg-linear-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center mb-8 animate-pulse">
            <div className="w-2 h-10 bg-linear-to-b from-orange-400 to-orange-500 rounded-full mr-4"></div>
            <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {Array(8).fill().map((_, i) => (
              <div key={i} className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg animate-pulse hover:shadow-xl transition-all">
                <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-slate-200 to-slate-300 rounded-2xl"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-r from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-200 animate-pulse">
            <div className="flex items-center">
              <div className="w-2 h-12 bg-linear-to-b from-orange-500 to-orange-600 rounded-full mr-5"></div>
              <div className="space-y-2">
                <div className="h-9 w-56 bg-slate-200 rounded-xl"></div>
                <div className="h-5 w-48 bg-slate-200/60 rounded-lg"></div>
              </div>
            </div>
            <div className="h-12 w-32 bg-white shadow-md rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {Array(12).fill().map((_, i) => (
              <div key={i} className="group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden animate-pulse">
                <div className="relative h-56 p-4 bg-linear-to-br from-slate-200 via-white to-blue-50 rounded-t-xl">
                  <div className="absolute top-4 left-4 w-16 h-5 bg-orange-400/80 rounded-full"></div>
                  <div className="w-full h-full bg-linear-to-br from-slate-300 via-white/50 to-slate-200 rounded-lg"></div>
                  
                  <div className="absolute top-4 right-4 space-y-2 opacity-75">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border"></div>
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border"></div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-6 w-20 bg-slate-200 rounded-l font-mono"></div>
                      <div className="h-5 w-12 bg-slate-200/50 rounded ml-2"></div>
                    </div>
                    <div className="flex items-center gap-1 -space-x-1">
                      {Array(5).fill().map((_, j) => (
                        <div key={j} className="w-5 h-5 bg-slate-300 rounded-full"></div>
                      ))}
                      <div className="h-4 w-8 bg-slate-200 rounded ml-2"></div>
                    </div>
                  </div>
                  
                  <div className="h-11 bg-linear-to-r from-blue-500/80 to-purple-600/80 rounded-lg shadow-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


  return (
    <div className="bg-white min-h-screen">

      <section className="relative bg-linear-to-br from-blue-900 via-purple-800  to-white/70 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Zap className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">One Basket, Endless Styles </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="block text-white/95 drop-shadow-2xl">Fashion Basket </span>
                <span className="block text-4xl lg:text-6xl bg-linear-to-r from-yellow-300 via-orange-200 to-yellow-100 bg-clip-text text-transparent drop-shadow-2xl">
                Shop the Look, Love the Style
                </span>
                <span className="block text-xl text-orange-100 font-light">
                  Style Simplified
                </span>
              </h1>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate("/products")}
                  className="px-10 py-4 bg-white text-yellow-950 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-10 py-4 border-2 border-white/50 text-white font-bold text-lg rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  VIEW ALL DEALS
                </button>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <img
                src="/Logo.png"
                alt="Flash Sale"
                className="w-full h-80 lg:h-96 object-cover rounded-3xl shadow-2xl drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🟡 CATEGORIES ROW - Flipkart Style */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="w-7 h-7 text-orange-500 mr-3" />
            Shop by Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {categories.slice(0, 8).map((category) => (
              <div
                key={category._id || category.slug || category.name}
                
                className="group cursor-pointer p-4 bg-gray-50 hover:bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-linear-to-br from-purple-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="font-black text-xl text-blue-800">
                    {category.name?.charAt(0) || "?"}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 line-clamp-1">
                  {category.name || category.slug || "Category"}
                </h4>
                {category.productCount && (
                  <p className="text-xs text-gray-500 mt-1">
                    {category.productCount}+ items
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔥 FEATURED PRODUCTS - EXACT FLIPKART LAYOUT */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-2 h-10 bg-linear-to-b from-orange-500 to-orange-600 rounded-full mr-4"></div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Featured Products
                </h2>
                <p className="text-lg text-gray-600 mt-1">
                  Fresh from our database - Limited stock!
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="text-purple-500 font-bold text-lg hover:text-purple-700 flex items-center space-x-1 bg-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-24">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Featured Products
              </h3>
              <p className="text-gray-500 text-lg">Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {featuredProducts.map((product, index) => (
                <div
                  key={product._id || index}
                  className="group bg-white border border-gray-200 hover:border-blue-400 hover:shadow-xl rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1"
                  onClick={() => handleCardClick(product)}
                >
                  {/* Image Container */}
                  <div className="relative h-48 lg:h-52 p-3 bg-gray-50 group-hover:bg-blue-50">
                    <img
                      src={product.images?.[0] || "/api/placeholder/300/300"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          {product.discount}% OFF
                        </div>
                      </div>
                    )}

                    {/* Quick Actions - Flipkart Style */}
                    <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAddToCart(product);
                        }}
                        className="w-11 h-11 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all border hover:border-orange-300"
                      >
                        <ShoppingCart className="w-5 h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product._id}`);
                        }}
                        className="w-11 h-11 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all border hover:border-orange-300"
                      >
                        <Eye className="w-5 h-5 text-gray-800" />
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-3 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-baseline">
                        <span className="text-lg font-bold text-gray-900 mr-2">
                          ₹{(product.discountedPrice || product.price).toFixed(0)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.price.toLocaleString(0)}
                          </span>
                        )}
                      </div>
                      {product.discount > 0 && (
                        <span className="text-green-600 text-xs font-medium">
                          Save ₹{Math.abs((product.discountedPrice || product.price) - product.price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex -space-x-1 mr-2">
                        {Array(5)
                          .fill()
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 transition-all ${
                                i < Math.floor(product.rating || 4.2) ? "fill-orange-400 text-orange-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {product.rating || 4.2}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAddToCart(product);
                      }}
                      className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;

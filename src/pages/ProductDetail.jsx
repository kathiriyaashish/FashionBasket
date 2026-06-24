import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import { toast } from "react-hot-toast";
import {
  Star,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        if (data.product.size?.[0]) setSelectedSize(data.product.size[0]);
        if (data.product.color?.[0]) setSelectedColor(data.product.color[0]);
      } catch (error) {
        toast.error("Product not found");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1,
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (product?.images?.length || 1) - 1 ? 0 : prev + 1,
    );
  };

  const handleImageClick = (index) => setCurrentImageIndex(index);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    try {
      await addToCart({
        _id: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor || product.color?.[0],
      });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    try {
      await addToCart({
        _id: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor || product.color?.[0],
      });
      navigate("/checkout");
    } catch (error) {
      toast.error("Failed to process order");
    }
  };

  const updateQuantity = (newQty) => {
    const qty = Math.max(1, newQty);
    if (product?.stock && qty > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }
    setQuantity(qty);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Product Not Found
        </h2>
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-amazon-orange text-white font-bold rounded-md hover:bg-orange-600 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const discountPrice =
    Number(product.discountPrice) ||
    price - (price * (product.discount || 0)) / 100;

  return (
    <div className="min-h-screen bg-white">
      {/* 🖥️ Amazon-style sticky top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/products")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="font-bold text-lg truncate flex-1 px-4">
            {product.name}
          </h1>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* 🖼️ Images - Amazon Style (3/12 cols mobile, 5/12 desktop) */}
          <div className="lg:col-span-6 space-y-0 mb-8 lg:mb-0">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-sm border">
              <img
                src={
                  product.images?.[currentImageIndex] ||
                  "/api/placeholder/600/600"
                }
                alt={product.name}
                className="w-full h-96 lg:h-125 object-contain"
              />
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow opacity-80 hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow opacity-80 hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
              {product.isFeatured && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  Sponsored
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2 lg:grid-cols-5 max-w-2xl mx-auto">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative cursor-pointer p-1 rounded-md hover:bg-gray-100 transition-colors border-2 ${
                      currentImageIndex === idx
                        ? "border-amazon-orange ring-2 ring-amazon-orange ring-opacity-40"
                        : "border-transparent"
                    }`}
                    onClick={() => handleImageClick(idx)}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-20 lg:h-24 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
            {product.description?.length > 0 && (
              <div className="space-y-6 mt-5">
                <label className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-2 h-10 bg-linear-to-b from-orange-500 to-orange-400 rounded-full" />
                  Details
                </label>

                <div className="p-8 lg:p-12 bg-linear-to-br from-slate-50 via-blue-50/50 to-indigo-50 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <pre className="whitespace-pre-wrap wrap-break-words font-poppins text-base leading-relaxed font-light text-gray-800 
                    bg-transparent p-0 m-0 border-none rounded-none shadow-none">
                      {product.description}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 📱 Product Info - Amazon Style (9/12 cols mobile, 7/12 desktop) */}
          <div className="lg:col-span-5 space-y-4 lg:pl-8">
            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight line-clamp-2">
              {product.name}
            </h1>

            {/* Brand & Category */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-900">Brand:</span>
              <span>{product.brand || "Fashion Basket"}</span> •
              <span className="hover:text-amazon-orange cursor-pointer">
                {product.category}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center -space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating || 4.5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900">
                ({product.reviews || 127})
              </span>
              <span className="text-sm text-gray-500">
                | 12K+ bought in past month
              </span>
            </div>

            {/* Price - AMAZON ORANGE HIGHLIGHT */}
            <div className="space-y-2">
              {product.discount > 0 ? (
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl lg:text-5xl font-extrabold text-amazon-orange">
                      ₹{discountPrice.toFixed(0)}
                    </span>
                    <span className="text-2xl text-gray-500 line-through font-medium">
                      ₹{price.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                      {product.discount}% off
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Save extra ₹{(price - discountPrice).toFixed(0)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {product.stock || 0} in stock
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-4xl lg:text-5xl font-extrabold text-gray-900">
                    ₹{price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {product.stock || 0} available
                  </span>
                </div>
              )}
            </div>

            {/* Size Selector */}
            {product.size?.length > 0 && (
              <div className="space-y-3">
                <label className="text-lg font-medium text-gray-900 block">
                  Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border font-medium rounded-md text-sm transition-all hover:shadow-md ${
                        selectedSize === size
                          ? "bg-orange-300 border-orange-900 text-amber-700 shadow-md"
                          : "border-gray-300 hover:border-amazon-orange text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-xs text-gray-500 mt-1">
                    Size: {selectedSize} •
                    <span className="text-amazon-orange font-medium ml-1 hover:underline cursor-pointer">
                      Size chart
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Color Selector */}
            {product.color?.length > 0 && (
              <div className="space-y-3">
                <label className="text-lg font-medium text-gray-900 block">
                  Color:
                </label>
                <div className="flex gap-3">
                  {product.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-lg border-2 shadow-sm hover:shadow-md transition-all flex items-center justify-center ${
                        selectedColor === color
                          ? "border-amazon-orange shadow-amazon-orange/25 ring-2 ring-amazon-orange/30"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-lg font-medium text-gray-900 block">
                Quantity:
              </label>
              <div className="flex items-center bg-gray-100 p-1 rounded-lg max-w-xs">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-white rounded hover:shadow-inner disabled:opacity-50"
                >
                  <Minus className="w-5 h-5 text-gray-700" />
                </button>
                <span className="px-8 py-4 text-xl font-bold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  disabled={product.stock && quantity >= product.stock}
                  className="p-3 hover:bg-white rounded hover:shadow-inner disabled:opacity-50"
                >
                  <Plus className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleBuyNow}
                disabled={!user || (product.stock && quantity > product.stock)}
                className="w-full bg-linear-to-r from-amazon-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6" />
                Buy Now
              </button>

              <button
                onClick={handleAddToCart}
                disabled={!user || (product.stock && quantity > product.stock)}
                className="w-full border border-gray-300 bg-white hover:bg-gray-50 py-4 px-6 rounded-lg font-bold text-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-6 h-6 text-gray-600" />
                Add to Cart
              </button>

              {/* Delivery Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    Deliver to {user?.name || "User"} -{" "}
                    {user?.address?.city || "CITY"}
                  </span>
                </div>
              </div>

              {/* Security */}
              <div className="flex items-center gap-2 text-xs text-gray-600 py-2">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  />
                </svg>
                <span>Secure transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind Config - Add to globals.css */}
      <style jsx>{`
        .amazon-orange {
          --tw-bg-opacity: 1;
          background-color: rgb(255 164 52 / var(--tw-bg-opacity));
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

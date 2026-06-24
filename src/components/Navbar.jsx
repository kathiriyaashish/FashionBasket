import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Crown,
  User as UserIcon,
  Heart,
} from "lucide-react";
import logo from "../assets/Logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAdmin, getProfile } = useAuthStore();
  const { totalItems } = useCartStore();
  const { wishlist } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) getProfile();
  }, []);

  const closeMobileMenu = () => setIsMenuOpen(false);

  const handleUserClick = () => {
    if (isAdmin()) {
      navigate("/admin/dashboard");
    } else {
      navigate("/profile");
    }
    closeMobileMenu();
  };

  const handleWishlistClick = () => {
    navigate("/wishlist");
    closeMobileMenu();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" onClick={closeMobileMenu}>
            <img
              src={logo}
              className="h-12 w-32 sm:h-16 sm:w-40 object-contain"
              alt="Fashion Basket"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <nav className="flex space-x-6">
              <Link
                to="/products"
                className="text-lg font-medium hover:text-purple-600"
              >
                Shop
              </Link>
              <Link
                to="/about"
                className="text-lg font-medium hover:text-purple-600"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleWishlistClick}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart className="w-6 h-6 text-gray-700 hover:text-purple-600" />
              {user && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-full"
              onClick={closeMobileMenu}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-purple-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin() && (
                  <div className="flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                    <Crown className="w-3 h-3" />
                    Admin
                  </div>
                )}
                <button
                  onClick={handleUserClick}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Profile"
                >
                  <UserIcon className="w-6 h-6 text-gray-700 hover:text-purple-600" />
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t bg-white absolute left-0 right-0 shadow-xl">
            <nav className="px-4 py-4 space-y-3">
              <Link
                to="/products"
                className="block py-3 px-4 rounded-lg hover:bg-purple-50 hover:text-purple-600 font-medium"
                onClick={closeMobileMenu}
              >
                Shop
              </Link>
              <Link
                to="/about"
                className="block py-3 px-4 rounded-lg hover:bg-purple-50 hover:text-purple-600 font-medium"
                onClick={closeMobileMenu}
              >
                About
              </Link>

              {/* Wishlist in Mobile Menu */}
              <button
                onClick={handleWishlistClick}
                className="flex items-center justify-between w-full py-3 px-4 rounded-lg hover:bg-purple-50 hover:text-purple-600 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  Wishlist
                </div>
                {user && wishlist.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md ring-2 ring-red-500/30 min-w-6 h-6 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart in Mobile Menu */}
              <Link
                to="/cart"
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-purple-50 hover:text-purple-600 font-medium"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                </div>
                {totalItems > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  {/* User Profile/Icon Section */}
                  <div
                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-purple-50 cursor-pointer"
                    onClick={handleUserClick}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        {isAdmin() ? (
                          <Crown className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isAdmin() ? "Admin" : "Customer"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t space-y-2">
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-center rounded-lg"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

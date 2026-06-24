import { useEffect, useState, useCallback } from 'react'
import { useCartStore } from '../store/useCartStore'
import ProductCard from '../components/ProductCard'
import { Search, Filter, Grid, List, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import api from '../services/api'

const Shop = () => {
  const { addToCart } = useCartStore()
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [catLoading, setCatLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    setCurrentPage(page)

    try {
      const minPrice = priceRange[0]
      const maxPrice = priceRange[1]

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchQuery.trim(),
        category: selectedCategories.join(','),
        sort: sortBy,
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString()
      })

      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products || [])
      setTotalPages(data.pages || 0)
    } catch (error) {
      console.error('Products error:', error)
      setProducts([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategories, sortBy, priceRange])

  const fetchCategories = async () => {
    try {
      setCatLoading(true)
      const { data } = await api.get('/categories')
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Categories error:', error)
    } finally {
      setCatLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCategorySelect = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    )
    setCurrentPage(1)
  }

  const handlePriceRange = (min, max) => {
    setPriceRange([min, max])
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 10000])
    setSearchQuery('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const renderCategories = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category._id} className={level > 0 ? 'ml-4 pl-4 border-l border-gray-200' : ''}>
        <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer w-full">
          <input
            type="checkbox"
            checked={selectedCategories.includes(category._id)}
            onChange={() => handleCategorySelect(category._id)}
            className="w-4 h-4 rounded mr-3 shrink-0"
          />
          <span className={`text-sm truncate ${level > 0 ? '' : 'font-medium'}`}>
            {category.name}
          </span>
        </label>

        {category.subCategories?.length > 0 && (
          <div className="ml-2 mt-1">
            {renderCategories(category.subCategories, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header - Flipkart Style */}
        <div className="border-b pb-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Fashion Hub</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {products.length} items
            </span>
          </div>
          <p className="text-sm text-gray-600">Explore latest collection</p>
        </div>

        {/* Search Bar - Flipkart Style */}
        <div className="relative mb-6">
          <div className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search for products, brands and more"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="ml-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap">
              Search
            </button>
          </div>
        </div>

        {/* Results with Active Filters - Flipkart Style */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-gray-50 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Category ({selectedCategories.length})
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
              Price: ₹{priceRange[0]} - ₹{priceRange[1]}
            </span>
            <button onClick={clearAllFilters} className="text-blue-600 text-sm font-medium hover:text-blue-800 ml-auto">
              Clear All
            </button>
          </div>
        )}

        {/* Controls Row - Flipkart Style */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-gray-900">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="popularity">Popularity</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 lg:hidden"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 hidden sm:block">View as:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm border border-gray-300' : 'text-gray-600 hover:bg-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm border border-gray-300' : 'text-gray-600 hover:bg-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Layout - Flipkart Style */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Flipkart Style */}
          <div className="lg:w-64 lg:fshrink-0 hidden lg:block">
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 pb-3 border-b">
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="font-semibold text-base mb-4 flex items-center justify-between">
                  Categories
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {catLoading ? (
                    <div className="text-sm text-gray-500 py-4">Loading categories...</div>
                  ) : (
                    renderCategories(categories)
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-base mb-4">Price</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="price" checked={priceRange[0] === 0 && priceRange[1] === 10000}
                      onChange={() => handlePriceRange(0, 10000)} className="w-4 h-4 rounded mr-3" />
                    All Prices
                  </label>
                  <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="price" checked={priceRange[0] === 0 && priceRange[1] === 500}
                      onChange={() => handlePriceRange(0, 500)} className="w-4 h-4 rounded mr-3" />
                    ₹0 - ₹500
                  </label>
                  <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="price" checked={priceRange[0] === 500 && priceRange[1] === 1500}
                      onChange={() => handlePriceRange(500, 1500)} className="w-4 h-4 rounded mr-3" />
                    ₹500 - ₹1,500
                  </label>
                  <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="price" checked={priceRange[0] === 1500 && priceRange[1] === 10000}
                      onChange={() => handlePriceRange(1500, 10000)} className="w-4 h-4 rounded mr-3" />
                    ₹1,500 & Above
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filters Modal */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-20">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden">
                  <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="text-xl font-bold">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                    <div className="mb-8">
                      <h4 className="font-semibold text-lg mb-4 pb-2 border-b">Categories</h4>
                      <div className="max-h-48 overflow-y-auto">
                        {catLoading ? (
                          <div className="text-sm text-gray-500 py-4">Loading...</div>
                        ) : (
                          renderCategories(categories)
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-4 pb-2 border-b">Price Range</h4>
                      <div className="space-y-3 text-sm">
                        <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="price" checked={priceRange[0] === 0 && priceRange[1] === 10000}
                            onChange={() => handlePriceRange(0, 10000)} className="w-4 h-4 rounded mr-3" />
                          All Prices
                        </label>
                        <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="price" checked={priceRange[0] === 0 && priceRange[1] === 500}
                            onChange={() => handlePriceRange(0, 500)} className="w-4 h-4 rounded mr-3" />
                          ₹0 - ₹500
                        </label>
                        <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="price" checked={priceRange[0] === 500 && priceRange[1] === 1500}
                            onChange={() => handlePriceRange(500, 1500)} className="w-4 h-4 rounded mr-3" />
                          ₹500 - ₹1,500
                        </label>
                        <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="price" checked={priceRange[0] === 1500 && priceRange[1] === 10000}
                            onChange={() => handlePriceRange(1500, 10000)} className="w-4 h-4 rounded mr-3" />
                          ₹1,500 & Above
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t bg-gray-50">
                    <button onClick={clearAllFilters} className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-100">
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="text-lg text-gray-600">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 border rounded-lg bg-gray-50">
                <div className="text-4xl text-gray-400 mb-4">No products found</div>
                <p className="text-gray-600 mb-6">Try different filters or search</p>
                <button onClick={clearAllFilters} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {products.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onAddToCart={() => addToCart(product)} 
                    />
                  ))}
                </div>

                {/* Flipkart-style Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center py-8 border-t">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <button
                        onClick={() => fetchProducts(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex items-center gap-1 px-2">
                        {currentPage > 2 && (
                          <>
                            <button onClick={() => fetchProducts(1)} className="px-3 py-2 text-sm font-medium rounded hover:bg-white">1</button>
                            {currentPage > 3 && <span className="px-2 text-sm text-gray-500">...</span>}
                          </>
                        )}
                        <button
                          onClick={() => fetchProducts(currentPage)}
                          className="px-4 py-2 text-sm font-bold bg-white border rounded-lg shadow-sm"
                        >
                          {currentPage}
                        </button>
                        {currentPage < totalPages && (
                          <button onClick={() => fetchProducts(currentPage + 1)} className="px-3 py-2 text-sm font-medium rounded hover:bg-white">
                            {currentPage + 1}
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => fetchProducts(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop

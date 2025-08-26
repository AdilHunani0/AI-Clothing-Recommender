"use client"
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useCart } from '../Shop/Createcart'; // Import useCart

export default function ImageUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [outfits, setOutfits] = useState([])
  const [features, setFeatures] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverStatus, setServerStatus] = useState("checking")
  const [serverInfo, setServerInfo] = useState(null)
  const [showSizeModal, setShowSizeModal] = useState(false); // State for size modal
  const [selectedSize, setSelectedSize] = useState(''); // State for selected size
  const [selectedOutfitForCart, setSelectedOutfitForCart] = useState(null); // To store outfit for cart

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus()
    // Check every 30 seconds if server is not connected
    const interval = setInterval(() => {
      if (serverStatus === "error") {
        checkServerStatus()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [serverStatus])

  const checkServerStatus = async () => {
    console.log("🔍 Checking server status...")
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      const response = await fetch("http://127.0.0.1:5001/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        mode: "cors", // Explicitly set CORS mode
      })
      clearTimeout(timeoutId)
      console.log("✅ Server response status:", response.status)
      console.log("✅ Server response headers:", [...response.headers.entries()])
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Server health data:", data)
        setServerStatus("connected")
        setServerInfo(data)
        setError(null)
      } else {
        console.error("❌ Server responded with error:", response.status)
        setServerStatus("error")
        setServerInfo(null)
      }
    } catch (err) {
      console.error("❌ Server check failed:", err)
      if (err.name === "AbortError") {
        setError("⏱️ Server connection timeout. Server might be slow to respond.")
      } else if (err.message.includes("CORS")) {
        setError("🔒 CORS error. Please check server CORS configuration.")
      } else if (err.message.includes("fetch")) {
        setError("🔌 Cannot reach server. Make sure Flask is running on port 5001.")
      } else {
        setError(`❌ Connection error: ${err.message}`)
      }
      setServerStatus("error")
      setServerInfo(null)
    }
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setError(null)
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image file")
      return
    }
    if (serverStatus !== "connected") {
      setError("Server is not running. Please start your Flask backend on port 5001")
      return
    }
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append("image", file)
    try {
      console.log("📤 Sending image to Flask backend...")
      const response = await fetch("http://127.0.0.1:5001/analyze_image", {
        method: "POST",
        body: formData,
        mode: "cors",
      })
      console.log("📥 Response status:", response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response error:", errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }
      const data = await response.json()
      console.log("✅ Response data:", data)
      if (data.error) {
        throw new Error(data.error)
      }
      setFeatures(data.features)
      setOutfits(data.outfits || [])
    } catch (err) {
      console.error("❌ Upload error:", err)
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("❌ Cannot connect to server. Please make sure your Flask backend is running on port 5001")
        setServerStatus("error")
      } else if (err.message.includes("CORS")) {
        setError("❌ CORS error. Please make sure flask-cors is installed and configured")
      } else {
        setError(`❌ ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const getBodyTypeIcon = (bodyType) => {
    switch (bodyType?.toLowerCase()) {
      case "athletic":
        return "💪"
      case "slim":
        return "🌿"
      case "average":
        return "👤"
      case "heavy":
        return "🫂"
      default:
        return "❓"
    }
  }

  const getSkinToneIcon = (skinTone) => {
    switch (skinTone?.toLowerCase()) {
      case "warm":
        return "☀️"
      case "cool":
        return "❄️"
      case "neutral":
        return "🌤️"
      default:
        return "🎨"
    }
  }

  const getFaceShapeIcon = (faceShape) => {
    switch (faceShape?.toLowerCase()) {
      case "round":
        return "⭕"
      case "square":
        return "⬜"
      case "oval":
        return "🥚"
      default:
        return "👤"
    }
  }

  const handleViewDetails = (outfit) => {
    // Construct a temporary outfit object that matches the expected structure for ProductDetail
    // Note: The backend for ProductDetail currently fetches outfits by ID.
    // If your backend doesn't have a direct endpoint for recommended outfits,
    // you might need to pass the full outfit object via state or adjust ProductDetail.
    const itemToNavigate = {
      _id: outfit.outfit_id, // Use outfit_id from the backend response
      type: 'outfit',
      name: `Recommended Outfit #${outfit.outfit_id}`, // A descriptive name
      description: `${outfit.occasion.replace("_", " ")} outfit with ${outfit.top} and ${outfit.bottom}`,
      total_price: outfit.total_price,
      review: outfit.review || 4.5, // Assuming a default review if not provided
      tags: outfit.tags || [], // Assuming tags if not provided
      top: {
        name: outfit.top,
        color: outfit.top_color,
        image_url: outfit.top_image_url,
        price: outfit.top_price || 0, // Assuming price if not provided
      },
      bottom: {
        name: outfit.bottom,
        color: outfit.bottom_color,
        image_url: outfit.bottom_image_url,
        price: outfit.bottom_price || 0, // Assuming price if not provided
      },
      occasion: outfit.occasion,
      image_url: outfit.top_image_url || outfit.bottom_image_url || "/placeholder.svg", // Primary image for detail page
    };
    navigate(`/product/outfit/${outfit.outfit_id}`, { state: { item: itemToNavigate } });
  };

  const handleAddToCartClick = (outfit) => {
    setSelectedOutfitForCart(outfit);
    setShowSizeModal(true);
  };

  const handleSizeSelect = (size) => {
    if (selectedOutfitForCart) {
      const itemToPass = {
        _id: selectedOutfitForCart.outfit_id,
        type: 'outfit',
        name: `Recommended Outfit #${selectedOutfitForCart.outfit_id}`,
        description: `${selectedOutfitForCart.occasion.replace("_", " ")} outfit`,
        price: selectedOutfitForCart.total_price,
        image_url: selectedOutfitForCart.top_image_url || selectedOutfitForCart.bottom_image_url || "/placeholder.svg",
        topColor: selectedOutfitForCart.top_color,
        bottomColor: selectedOutfitForCart.bottom_color,
        occasion: selectedOutfitForCart.occasion,
      };
      console.log('ImageUpload: Preparing to add outfit to cart:', itemToPass);
      addToCart(itemToPass, size, 1);
    }
    setShowSizeModal(false);
    setSelectedSize('');
    setSelectedOutfitForCart(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            ✨ Fashion Style Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your photo and get personalized outfit recommendations
          </p>
          {/* Server Status Indicator */}
          <div className="mt-4">
            {serverStatus === "checking" && (
              <div className="text-yellow-600 text-sm">🔄 Checking server connection...</div>
            )}
            {serverStatus === "connected" && serverInfo && (
              <div className="text-green-600 text-sm">
                ✅ Server connected (Port {serverInfo.port}) - MongoDB: {serverInfo.mongodb_connected ? "✅" : "❌"}
              </div>
            )}
            {serverStatus === "error" && (
              <div className="text-red-600 text-sm">
                ❌ Server not connected - Please start Flask backend
              </div>
            )}
          </div>
        </div>

        {/* Server Connection Instructions */}
        {serverStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="text-red-700 font-semibold mb-2">🚨 Server Connection Issue</h3>
            <p className="text-red-800 text-sm mb-2">
              Your Flask server should be running. Please check:
            </p>
            <ol className="text-red-800 text-sm pl-6 mb-4 list-disc">
              <li>Flask server is running on port 5001</li>
              <li>
                flask-cors is installed:{" "}
                <code className="bg-red-100 px-1 py-0.5 rounded">
                  pip install flask-cors
                </code>
              </li>
              <li>No firewall blocking port 5001</li>
              <li>Server is accessible at http://127.0.0.1:5001/health</li>
            </ol>
            {error && (
              <div className="bg-red-100 p-2 rounded mb-4 text-sm text-red-700 border border-red-200">
                <strong>Error Details:</strong> {error}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={checkServerStatus}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-red-700 transition"
              >
                🔄 Retry Connection
              </button>
              <button
                onClick={() => window.open("http://127.0.0.1:5001/health", "_blank")}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-gray-700 transition"
              >
                🔗 Test Health Endpoint
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className={`bg-white rounded-lg p-6 shadow-md mb-8 ${serverStatus === "error" ? 'opacity-60' : ''}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📷 Upload Your Photo
          </h2>
          {/* File Input */}
          <div className="mb-4">
            <label
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 transition-colors duration-200 ${serverStatus !== "connected" ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
            >
              <div className="flex flex-col items-center justify-center p-5">
                {preview ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-48 max-w-48 object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <div className="text-4xl mb-4">📤</div>
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-600">PNG, JPG or JPEG</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={serverStatus !== "connected"}
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) {
                    handleFileSelect(selectedFile)
                  }
                }}
              />
            </label>
          </div>
          {file && (
            <div className="text-sm text-green-700 bg-green-50 p-2 rounded mb-4">
              Selected: {file.name}
            </div>
          )}
          {error && !error.includes("Server Connection Issue") && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200 mb-4">
              {error}
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={loading || !file || serverStatus !== "connected"}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors duration-200 ${loading || !file || serverStatus !== "connected" ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                Analyzing Your Style...
              </>
            ) : serverStatus !== "connected" ? (
              <>🔌 Server Not Connected</>
            ) : (
              <>✨ Get My Outfit Recommendations</>
            )}
          </button>
        </div>

        {/* Features Section */}
        {features && (
          <div className="bg-white rounded-lg p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              👤 Your Style Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-4xl mb-2">{getBodyTypeIcon(features.body_type)}</div>
                <h3 className="font-semibold text-gray-900 mb-1">Body Type</h3>
                <p className="text-blue-700 capitalize">{features.body_type}</p>
              </div>
              <div className="text-center p-4 bg-orange-100 rounded-lg">
                <div className="text-4xl mb-2">{getSkinToneIcon(features.skin_tone)}</div>
                <h3 className="font-semibold text-gray-900 mb-1">Skin Tone</h3>
                <p className="text-orange-700 capitalize">{features.skin_tone}</p>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-4xl mb-2">{getFaceShapeIcon(features.face_shape)}</div>
                <h3 className="font-semibold text-gray-900 mb-1">Face Shape</h3>
                <p className="text-green-700 capitalize">{features.face_shape}</p>
              </div>
            </div>
          </div>
        )}

        {/* Outfits Section */}
        {outfits.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              👔 Recommended Outfits for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfits.map((outfit) => (
                <div
                  key={outfit.outfit_id}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 bg-white"
                >
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {/* Top Image */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Top</p>
                        {outfit.top_image_url ? (
                          <img
                            src={outfit.top_image_url || "/placeholder.svg"}
                            alt={`${outfit.top} ${outfit.top_color}`}
                            className="w-full h-32 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150x128?text=Top+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                            <span className="text-4xl">👕</span>
                          </div>
                        )}
                      </div>
                      {/* Bottom Image */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Bottom</p>
                        {outfit.bottom_image_url ? (
                          <img
                            src={outfit.bottom_image_url || "/placeholder.svg"}
                            alt={`${outfit.bottom} ${outfit.bottom_color}`}
                            className="w-full h-32 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/200x250?text=Bottom+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                            <span className="text-4xl">👖</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Outfit #{outfit.outfit_id}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Top:</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{outfit.top}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-300">
                            {outfit.top_color}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Bottom:</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{outfit.bottom}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-300">
                            {outfit.bottom_color}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Occasion:</span>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full capitalize">
                          {outfit.occasion.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Total Price:</span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{outfit.total_price}
                        </span>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          className="flex-1 bg-black text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 transition"
                          onClick={() => handleAddToCartClick(outfit)}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="flex-1 border border-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition"
                          onClick={() => handleViewDetails(outfit)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && outfits.length === 0 && features && (
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="text-5xl mb-4">🎨</div>
            <p className="text-gray-600">No outfit recommendations found. Try uploading a different image.</p>
          </div>
        )}
      </div>

      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg text-gray-900">
            <h3 className="text-lg font-semibold mb-4">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 border rounded ${selectedSize === size ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
              onClick={() => handleSizeSelect(selectedSize)}
              disabled={!selectedSize}
            >
              Add to Cart
            </button>
            <button
              className="mt-2 w-full text-red-500 hover:text-red-700"
              onClick={() => setShowSizeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

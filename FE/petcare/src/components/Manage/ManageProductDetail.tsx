import React, { useState, useEffect } from "react";
import ProductDetailService from "../../service/ProductDetailService";
import ProductService from "../../service/ProductService";
import ProductColorService from "../../service/ProductColorsService.js";
import ProductSizeService from "../../service/ProductSizesService.js";
import ProductWeightService from "../../service/ProductWeightsService.js"

const ProductDetailManager = () => {
  const [productDetails, setProductDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [weightsList, setWeights] = useState([]);  // Renamed for clarity
  const [sizes, setSizes] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 0,
    price: 0,
    productColorId: "",
    productSizeId: "",
    productWeightId: "",  // Make sure this is set correctly
    status: true, // Default status as true (Active)
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadProductDetails();
    loadProducts();
    loadColors();
    loadSizes();
    loadWeights();  // Ensure this function is called to load weights
  }, []);

  const loadProductDetails = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await ProductDetailService.getAllProductDetails();
      setProductDetails(response);
    } catch (error) {
      console.error("Error loading product details", error);
      setErrorMessage("Không thể tải thông tin chi tiết sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setErrorMessage("");
    try {
      const response = await ProductService.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products", error);
      setErrorMessage("Không thể tải danh sách sản phẩm.");
    }
  };

  const loadColors = async () => {
    setErrorMessage("");
    try {
      const response = await ProductColorService.getAllProductColors();
      const activeColors = response.filter((color) => color.status === true); // Filter active colors
      setColors(activeColors);
    } catch (error) {
      console.error("Error loading colors", error);
      setErrorMessage("Không thể tải danh sách màu.");
    }
  };

  const loadSizes = async () => {
    setErrorMessage("");
    try {
      const response = await ProductSizeService.getAllProductSizes();
      const activeSizes = response.filter((size) => size.status === true); // Filter active sizes
      setSizes(activeSizes);
    } catch (error) {
      console.error("Error loading sizes", error);
      setErrorMessage("Không thể tải danh sách size");
    }
  };

  const loadWeights = async () => {
    setErrorMessage("");
    try {
      const response = await ProductWeightService.getAllProductWeights();
      const activeWeight = response.filter((weight) => weight.status === true);  // Renamed for clarity
      setWeights(activeWeight);
    } catch (error) {
      console.error("Error loading weights", error);
      setErrorMessage("Không thể tải danh sách weight");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.checked }); // Toggle status
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      if (editMode) {
        await ProductDetailService.updateProductDetail(editId, {
          product: { productId: formData.productId },
          quantity: formData.quantity,
          price: formData.price,
          productColor: { productColorId: formData.productColorId },
          productSize: { productSizeId: formData.productSizeId },
          productWeight: { productWeightId: formData.productWeightId },
          status: formData.status, // Include status as boolean
        });
        setEditMode(false);
      } else {
        await ProductDetailService.createProductDetail({
          product: { productId: formData.productId },
          quantity: formData.quantity,
          price: formData.price,
          productColor: { productColorId: formData.productColorId },
          productSize: { productSizeId: formData.productSizeId },
          productWeight: { productWeightId: formData.productWeightId },
          status: formData.status, // Include status as boolean
        });
      }
      setFormData({
        productId: "",
        quantity: 0,
        price: 0,
        productColorId: "",
        productSizeId: "",
        productWeightId: "", // Reset productWeightId
        status: true, // Reset to default status
      });
      loadProductDetails();
    } catch (error) {
      console.error("Error saving product detail", error);
      setErrorMessage("Có lỗi khi lưu thông tin chi tiết sản phẩm.");
    }
    setLoading(false);
  };

  const handleEdit = (detail) => {
    setFormData({
      productId: detail.product?.productId || "",
      quantity: detail.quantity || 0,
      price: detail.price || 0,
      productColorId: detail.productColor?.productColorId || "",
      productSizeId: detail.productSize?.productSizeId || "",
      productWeightId: detail.productWeight?.productWeightId || "", // Ensure weight is correctly loaded
      status: detail.status || true, // Get status as boolean
    });
    setEditId(detail.productDetailId);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông tin chi tiết sản phẩm này không?")) {
      try {
        await ProductDetailService.deleteProductDetail(id);
        loadProductDetails();
      } catch (error) {
        console.error("Error deleting product detail", error);
        setErrorMessage("Có lỗi khi xóa thông tin chi tiết sản phẩm.");
      }
    }
  };

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Product Detail Manager</h1>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sản phẩm</label>
              <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                    <option key={product.productId} value={product.productId}>
                      {product.productName}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
              <select
                  name="productColorId"
                  value={formData.productColorId}
                  onChange={handleInputChange}
                  className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
              >
                <option value="">Chọn màu</option>
                {colors.map((color) => (
                    <option key={color.productColorId} value={color.productColorId}>
                      {color.color}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kích thước</label>
              <select
                  name="productSizeId"
                  value={formData.productSizeId}
                  onChange={handleInputChange}
                  className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
              >
                <option value="">Chọn kích thước</option>
                {sizes.map((size) => (
                    <option key={size.productSizeId} value={size.productSizeId}>
                      {size.productSize}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cân nặng</label>
              <select
                  name="productWeightId"
                  value={formData.productWeightId}
                  onChange={handleInputChange}
                  className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
              >
                <option value="">Chọn cân nặng</option>
                {weightsList.map((weight) => (
                    <option key={weight.productWeightId} value={weight.productWeightId}>
                      {weight.weightValue}
                    </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Số lượng</label>
              <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Giá</label>
              <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Trạng thái</label>
            <input
                type="checkbox"
                checked={formData.status}
                onChange={handleStatusChange}
                className="focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
            >
              {editMode ? "Cập nhật chi tiết sản phẩm" : "Thêm chi tiết sản phẩm"}
            </button>
          </div>
        </form>


        <h2 className="text-xl font-semibold mb-4">Danh sách các biếng thể</h2>
        {loading ? (
            <p>Loading...</p>
        ) : (
            <table className="min-w-full table-auto border-collapse rounded-lg shadow-lg">
              <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Color</th>
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wider">Actions</th>
              </tr>
              </thead>
              <tbody>
              {productDetails.map((detail) => (
                  <tr
                      key={detail.productDetailId}
                      className="border-b border-gray-300 hover:bg-gray-100 transition duration-300"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{detail.product?.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{detail.productColor?.color}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{detail.productSize?.productSize}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{detail.productWeight?.weightValue}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{detail.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{detail.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
          <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  detail.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
          >
            {detail.status ? "Active" : "Inactive"}
          </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex space-x-2">
                        <button
                            onClick={() => handleEdit(detail)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-400 transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                            onClick={() => handleDelete(detail.productDetailId)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-400 transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>

        )}
      </div>
  );
};

export default ProductDetailManager;

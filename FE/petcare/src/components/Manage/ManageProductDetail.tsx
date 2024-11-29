import React, { useState, useEffect } from "react";
import ProductDetailService from "../../service/ProductDetailService";
import ProductService from "../../service/ProductService";
import ProductColorService from "../../service/ProductColorsService.js";
import ProductSizeService from "../../service/ProductSizesService.js";
import ProductWeightService from "../../service/ProductWeightsService.js";

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
  const [modalOpen, setModalOpen] = useState(false); // Control modal visibility

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
      setModalOpen(false); // Close modal after submission
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
    setModalOpen(true); // Open modal for editing
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

        {/* Add Product Button */}
        <button
            onClick={() => setModalOpen(true)}  // Open modal when button is clicked
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-600"
        >
          Thêm chi tiết sản phẩm
        </button>

        {/* Modal */}
        {modalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-2/3">
                <h2 className="text-xl font-semibold mb-4">{editMode ? "Cập nhật chi tiết sản phẩm" : "Thêm chi tiết sản phẩm"}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Product */}
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

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                      <select
                          name="productColorId"
                          value={formData.productColorId}
                          onChange={handleInputChange}
                          className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                      >
                        <option value="">Chọn màu sắc</option>
                        {colors.map((color) => (
                            <option key={color.productColorId} value={color.productColorId}>
                              {color.color}
                            </option>
                        ))}
                      </select>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Size</label>
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

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trọng lượng</label>
                      <select
                          name="productWeightId"
                          value={formData.productWeightId}
                          onChange={handleInputChange}
                          className="block w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                      >
                        <option value="">Chọn trọng lượng</option>
                        {weightsList.map((weight) => (
                            <option key={weight.productWeightId} value={weight.productWeightId}>
                              {weight.weightValue}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity */}
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

                  {/* Price */}
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

                  {/* Status */}
                  <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="status"
                        checked={formData.status}
                        onChange={handleStatusChange}
                        className="mr-2"
                    />
                    <span className="text-sm">Active</span>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        onClick={() => setModalOpen(false)}  // Close modal
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                      {editMode ? "Cập nhật" : "Thêm"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Display Product Details */}
        <table className="min-w-full border-collapse mt-6 bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-3 px-6 text-left border-b">Sản phẩm</th>
            <th className="py-3 px-6 text-left border-b">Màu sắc</th>
            <th className="py-3 px-6 text-left border-b">Size</th>
            <th className="py-3 px-6 text-left border-b">Trọng lượng</th>
            <th className="py-3 px-6 text-left border-b">Số lượng</th>
            <th className="py-3 px-6 text-left border-b">Giá</th>
            <th className="py-3 px-6 text-left border-b">Trạng thái</th>
            <th className="py-3 px-6 text-left border-b">Hành động</th>
          </tr>
          </thead>
          <tbody>
          {productDetails.map((detail, index) => (
              <tr
                  key={detail.productDetailId}
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <td className="py-3 px-6 text-sm text-gray-800">{detail.product?.productName}</td>
                <td className="py-3 px-6 text-sm text-gray-800">{detail.productColor?.color}</td>
                <td className="py-3 px-6 text-sm text-gray-800">{detail.productSize?.productSize}</td>
                <td className="py-3 px-6 text-sm text-gray-800">{detail.productWeight?.weightValue}</td>
                <td className="py-3 px-6 text-sm text-gray-800">{detail.quantity}</td>
                <td className="py-3 px-6 text-sm text-gray-800">{detail.price}</td>
                <td className="py-3 px-6 text-sm text-gray-800">{detail.status ? "Active" : "Inactive"}</td>
                <td className="py-3 px-6 text-sm text-gray-800 flex gap-2">
                  <button
                      onClick={() => handleEdit(detail)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
                  >
                    Sửa
                  </button>
                  <button
                      onClick={() => handleDelete(detail.productDetailId)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>

      </div>
  );
};

export default ProductDetailManager;

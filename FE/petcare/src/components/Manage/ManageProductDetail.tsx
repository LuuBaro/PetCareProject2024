import React, { useState, useEffect } from "react";
import ProductDetailService from "../../service/ProductDetailService";
import ProductService from "../../service/ProductService";
import ProductColorService from "../../service/ProductColorsService.js";
import ProductSizeService from "../../service/ProductSizesService.js";
import ProductWeightService from "../../service/ProductWeightsService.js";
import DataTable from 'react-data-table-component';

const ProductDetailManager = () => {
  const [productDetails, setProductDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [weightsList, setWeights] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 0,
    price: 0,
    productColorId: "",
    productSizeId: "",
    productWeightId: "",
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Added searchTerm state

  useEffect(() => {
    loadProductDetails();
    loadProducts();
    loadColors();
    loadSizes();
    loadWeights();
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
      const activeColors = response.filter((color) => color.status === true);
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
      const activeSizes = response.filter((size) => size.status === true);
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
      const activeWeight = response.filter((weight) => weight.status === true);
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
    setFormData({ ...formData, status: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      if (editMode) {
        await ProductDetailService.createOrUpdateProductDetail(editId, {
          product: { productId: formData.productId },
          quantity: formData.quantity,
          price: formData.price,
          productColor: { productColorId: formData.productColorId },
          productSize: { productSizeId: formData.productSizeId },
          productWeight: { productWeightId: formData.productWeightId },
          status: formData.status,
        });
        setEditMode(false);
      } else {
        await ProductDetailService.createOrUpdateProductDetail({
          product: { productId: formData.productId },
          quantity: formData.quantity,
          price: formData.price,
          productColor: { productColorId: formData.productColorId },
          productSize: { productSizeId: formData.productSizeId },
          productWeight: { productWeightId: formData.productWeightId },
          status: formData.status,
        });
      }
      setFormData({
        productId: "",
        quantity: 0,
        price: 0,
        productColorId: "",
        productSizeId: "",
        productWeightId: "",
        status: true,
      });
      loadProductDetails();
      setModalOpen(false);
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
      productWeightId: detail.productWeight?.productWeightId || "",
      status: detail.status || true,
    });
    setEditId(detail.productDetailId);
    setEditMode(true);
    setModalOpen(true);
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

  const columns = [
    {
      name: "Sản phẩm",
      selector: row => row.product?.productName,
      sortable: true,
    },
    {
      name: "Màu sắc",
      selector: row => row.productColor?.color,
      sortable: true,
    },
    {
      name: "Size",
      selector: row => row.productSize?.productSize,
      sortable: true,
    },
    {
      name: "Trọng lượng",
      selector: row => row.productWeight?.weightValue,
      sortable: true,
    },
    {
      name: "Số lượng",
      selector: row => row.quantity,
      sortable: true,
    },
    {
      name: "Giá",
      selector: row => row.price,
      sortable: true,
    },
    {
      name: "Trạng thái",
      selector: row => (row.status ? "Active" : "Inactive"),
      sortable: true,
    },
    {
      name: "Hành động",
      cell: (row) => (
          <div className="flex gap-2">
            <button
                onClick={() => handleEdit(row)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
            >
              Sửa
            </button>
            <button
                onClick={() => handleDelete(row.productDetailId)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
            >
              Xóa
            </button>
          </div>
      ),
    },
  ];

  // Filtering logic for search
  const filteredProductDetails = productDetails.filter((detail) => {
    return (
        detail.product?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.productColor?.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.productSize?.productSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.productWeight?.weightValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.quantity.toString().includes(searchTerm) ||
        detail.price.toString().includes(searchTerm)
    );
  });

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Product Detail Manager</h1>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {/* Add Product Button */}
        <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-600"
        >
          Thêm chi tiết sản phẩm
        </button>
        {/* Search Input */}
        <div className="mb-4">
          <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, màu sắc, size, giá..."
              className="p-2 border border-gray-300 rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* DataTable */}
        <DataTable
            columns={columns}
            data={filteredProductDetails}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 15]}
            progressPending={loading}
        />
        {/* Modal for adding/editing product details */}
        {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-4">{editMode ? "Chỉnh sửa chi tiết sản phẩm" : "Thêm chi tiết sản phẩm"}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-2">Sản phẩm</label>
                    <select
                        name="productId"
                        value={formData.productId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn sản phẩm</option>
                      {products.map((product) => (
                          <option key={product.productId} value={product.productId}>
                            {product.productName}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Màu sắc</label>
                    <select
                        name="productColorId"
                        value={formData.productColorId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn màu sắc</option>
                      {colors.map((color) => (
                          <option key={color.productColorId} value={color.productColorId}>
                            {color.color}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Size</label>
                    <select
                        name="productSizeId"
                        value={formData.productSizeId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn size</option>
                      {sizes.map((size) => (
                          <option key={size.productSizeId} value={size.productSizeId}>
                            {size.productSize}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Trọng lượng</label>
                    <select
                        name="productWeightId"
                        value={formData.productWeightId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn trọng lượng</option>
                      {weightsList.map((weight) => (
                          <option key={weight.productWeightId} value={weight.productWeightId}>
                            {weight.weightValue}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Số lượng</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Giá</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                          type="checkbox"
                          checked={formData.status}
                          onChange={handleStatusChange}
                          className="mr-2"
                      />
                      Trạng thái (Active)
                    </label>
                  </div>
                  <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Đóng
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default ProductDetailManager;

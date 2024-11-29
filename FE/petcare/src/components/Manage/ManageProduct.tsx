import React, { useEffect, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebaseConfig";
import ProductService from '../../service/ProductService';
import BrandService from '../../service/BrandService';
import ProductCategoriesService from '../../service/ProductCategoriesService';
import DataTable from 'react-data-table-component';

const ProductForm = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productDetails, setProductDetails] = useState({
    productName: '',
    productQuantity: '',
    description: '',
    imageUrl: '',
    brand: { brandId: null },
    category: { productCategogyId: null },
  });
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);  // State for modal visibility

  useEffect(() => {
    const fetchData = async () => {
      await fetchBrands();
      await fetchCategories();
      await fetchProducts();
    };
    fetchData();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await BrandService.getAllBrands();
      setBrands(response.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await ProductCategoriesService.getAllProductCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getAllProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products.');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!productDetails.productName.trim()) {
      errors.productName = 'Tên sản phẩm là bắt buộc.';
    }
    if (!productDetails.productQuantity || isNaN(productDetails.productQuantity) || productDetails.productQuantity < 0) {
      errors.productQuantity = 'Số lượng sản phẩm là bắt buộc và phải là số hợp lệ.';
    }
    return errors;
  };

  const handleCreateOrUpdate = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setUploading(true);

    if (file) {
      try {
        await uploadFile(file);
      } catch (err) {
        setUploading(false);
        setError("Failed to upload image.");
        return;
      }
    } else {
      saveProductDetails(productDetails.imageUrl);
    }
  };

  const resetForm = () => {
    setProductDetails({
      productName: '',
      productQuantity: '',
      description: '',
      imageUrl: '',
      brand: { brandId: null },
      category: { productCategogyId: null },
    });
    setFormErrors({});
    setFile(null);
    setError(null);
    setEditMode(false);
    setCurrentProductId(null);
  };

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading file:", error);
            setError("Failed to upload image.");
            setUploading(false);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              saveProductDetails(url);
              resolve(url);
            } catch (err) {
              console.error("Error getting download URL:", err);
              setError("Failed to retrieve image URL.");
              setUploading(false);
              reject(err);
            }
          }
      );
    });
  };

  const saveProductDetails = async (imageUrl = '') => {
    try {
      const detailsToSend = {
        ...productDetails,
        imageUrl: imageUrl || productDetails.imageUrl,
        brand: { brandId: productDetails.brand.brandId },
        category: { productCategogyId: productDetails.category.productCategogyId },
      };

      if (editMode) {
        await ProductService.updateProduct(currentProductId, detailsToSend);
      } else {
        await ProductService.createProduct(detailsToSend);
      }

      fetchProducts();
      resetForm();
      closeModal();  // Close the modal after saving the product
    } catch (err) {
      setError('Failed to save product: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setCurrentProductId(product.productId);
    setProductDetails({
      productName: product.productName,
      productQuantity: product.productQuantity,
      description: product.description,
      imageUrl: product.imageUrl,
      brand: { brandId: product.brand.brandId },
      category: { productCategogyId: product.category.productCategogyId },
    });
    openModal();  // Open modal when editing a product
  };

  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  const openModal = () => {
    setIsModalOpen(true);  // Show modal
  };

  const closeModal = () => {
    setIsModalOpen(false);  // Hide modal
  };

  const columns = [
    {
      name: 'Tên sản phẩm',
      selector: row => row.productName,
      sortable: true,
      width: '200px', // Control column width for better compactness
    },
    {
      name: 'Số lượng',
      selector: row => row.productQuantity,
      sortable: true,
      width: '100px', // Control column width
    },
    {
      name: 'Mô tả',
      selector: row => row.description,
      sortable: true,
      width: '250px', // Adjust for better fitting
    },
    {
      name: 'Thương hiệu',
      selector: row => row.brand?.brandName,
      sortable: true,
      width: '150px', // Adjust column width
    },
    {
      name: 'Danh mục',
      selector: row => row.category?.categogyName,
      sortable: true,
      width: '150px', // Adjust column width
    },
    {
      name: 'Hình ảnh',
      cell: row => (
          row.imageUrl ? (
              <img
                  src={row.imageUrl}
                  alt={row.productName}
                  className="w-16 h-16 object-cover rounded-md" // Smaller image size
              />
          ) : null
      ),
      width: '100px', // Control image column width
    },
    {
      name: 'Hành động',
      cell: row => (
          <div className="flex justify-center gap-2">
            <button
                onClick={() => handleEdit(row)}
                className="bg-yellow-500 text-white p-1 rounded-md text-xs hover:bg-yellow-600"
            >
              Sửa
            </button>
            <button
                onClick={() => handleDelete(row.productId)}
                className="bg-red-500 text-white p-1 rounded-md text-xs hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
      ),
      width: '150px', // Adjust column width for actions
    },
  ];

// Additional CSS for compact design
  const tableStyles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem', // Smaller font size
    },
    th: {
      padding: '8px 12px',
      backgroundColor: '#f3f4f6',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '0.875rem', // Smaller font size
    },
    td: {
      padding: '8px 12px',
      textAlign: 'left',
      fontSize: '0.875rem', // Smaller font size
    },
    row: {
      borderBottom: '1px solid #e5e7eb', // Subtle row separation
    },
  };


  return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Quản lý sản phẩm</h1>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

        <button
            onClick={openModal}
            className="bg-blue-600 text-white p-2 rounded-md mb-6"
        >
          Thêm sản phẩm
        </button>

        {/* Product Form Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 lg:w-2/3 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
                <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">{editMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</h2>

                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Row 1: Tên sản phẩm and Số lượng */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="lg:w-1/2 p-2">
                      <label className="block text-gray-700 font-medium mb-3">Tên sản phẩm</label>
                      <input
                          type="text"
                          value={productDetails.productName}
                          onChange={(e) => setProductDetails({ ...productDetails, productName: e.target.value })}
                          placeholder="Tên sản phẩm"
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formErrors.productName && <p className="text-red-500 text-sm mt-1">{formErrors.productName}</p>}
                    </div>

                    <div className="lg:w-1/2 p-2">
                      <label className="block text-gray-700 font-medium mb-3">Số lượng</label>
                      <input
                          type="number"
                          value={productDetails.productQuantity}
                          onChange={(e) => setProductDetails({ ...productDetails, productQuantity: e.target.value })}
                          placeholder="Số lượng"
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formErrors.productQuantity && <p className="text-red-500 text-sm mt-1">{formErrors.productQuantity}</p>}
                    </div>
                  </div>

                  {/* Row 2: Thương hiệu and Danh mục */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="lg:w-1/2 p-2">
                      <label className="block text-gray-700 font-medium mb-3">Thương hiệu</label>
                      <select
                          value={productDetails.brand?.brandId}
                          onChange={(e) => setProductDetails({ ...productDetails, brand: { brandId: e.target.value } })}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map(brand => (
                            <option key={brand.brandId} value={brand.brandId}>
                              {brand.brandName}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:w-1/2 p-2">
                      <label className="block text-gray-700 font-medium mb-4">Danh mục</label>
                      <select
                          value={productDetails.category?.productCategogyId}
                          onChange={(e) => setProductDetails({ ...productDetails, category: { productCategogyId: e.target.value } })}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                            <option key={category.productCategogyId} value={category.productCategogyId}>
                              {category.categogyName}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Hình ảnh */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3">Hình ảnh</label>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Row 4: Mô tả */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3">Mô tả</label>
                    <textarea
                        value={productDetails.description}
                        onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
                        placeholder="Mô tả sản phẩm"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="bg-gray-600 text-white p-3 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Đóng
                    </button>
                    <button
                        type="button"
                        onClick={handleCreateOrUpdate}
                        className="bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition-colors"
                    >
                      {uploading ? 'Đang tải...' : 'Lưu'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}



        {/* DataTable to display products */}
        <DataTable
            columns={columns}
            data={products}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 20, 50, 100]}
        />
      </div>
  );
};

export default ProductForm;

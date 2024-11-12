import React, { useEffect, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebaseConfig";
import ProductService from '../../service/ProductService';
import BrandService from '../../service/BrandService';
import ProductCategoriesService from '../../service/ProductCategoriesService';

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
  const [editMode, setEditMode] = useState(false); // Track if editing an existing product
  const [currentProductId, setCurrentProductId] = useState(null); // Track the ID of the product being edited

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
    setEditMode(false); // Reset edit mode
    setCurrentProductId(null); // Reset current product ID
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
  };

  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
      <div className="container mx-auto p-8">
        {/* Your existing product form code */}
        <h1 className="text-3xl font-bold text-center mb-6">Quản lý sản phẩm</h1>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        {uploading && (
            <div className="text-blue-600 mb-4 text-center">
              Đang tải ảnh lên...
              <div className="w-full mt-2">
                <div className="bg-gray-300 rounded-full w-full h-2">
                  <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
                <div className="text-center text-sm mt-1">{Math.round(uploadProgress)}%</div>
              </div>
            </div>
        )}

        {/* Product Form */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-semibold">Tên sản phẩm</label>
            <input
                type="text"
                value={productDetails.productName}
                onChange={(e) => setProductDetails({...productDetails, productName: e.target.value})}
                className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            />
            {formErrors.productName && <span className="text-red-600 text-sm">{formErrors.productName}</span>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold">Số lượng</label>
            <input
                type="number"
                value={productDetails.productQuantity}
                onChange={(e) => setProductDetails({...productDetails, productQuantity: e.target.value})}
                className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            />
            {formErrors.productQuantity && <span className="text-red-600 text-sm">{formErrors.productQuantity}</span>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold">Mô tả</label>
            <textarea
                value={productDetails.description}
                onChange={(e) => setProductDetails({...productDetails, description: e.target.value})}
                className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold">Chọn hình ảnh</label>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="brand" className="block font-medium text-gray-700 mb-2">Thương hiệu</label>
            <select
                id="brand"
                value={productDetails.brand.brandId || ''}
                onChange={(e) => setProductDetails({...productDetails, brand: {brandId: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((brand) => (
                  <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block font-medium text-gray-700 mb-2">Danh mục</label>
            <select
                id="category"
                value={productDetails.category.productCategogyId || ''}
                onChange={(e) => setProductDetails({...productDetails, category: {productCategogyId: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                  <option key={category.productCategogyId}
                          value={category.productCategogyId}>{category.categogyName}</option>
              ))}
            </select>
          </div>


          <div className="col-span-2">
            <button
                type="button"
                onClick={handleCreateOrUpdate}
                className="bg-blue-600 text-white p-2 rounded-md w-full mt-4"
            >
              Lưu sản phẩm
            </button>
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-8">Danh sách sản phẩm</h2>
        <table className="table-auto w-full mt-4">
          <thead>
          <tr>
            <th className="px-4 py-2 border">Tên sản phẩm</th>
            <th className="px-4 py-2 border">Số lượng</th>
            <th className="px-4 py-2 border">Mô tả</th>
            <th className="px-4 py-2 border">Thương hiệu</th>
            <th className="px-4 py-2 border">Danh mục</th>
            <th className="px-4 py-2 border">Hình ảnh</th>
            <th className="px-4 py-2 border">Hành động</th>
          </tr>
          </thead>
          <tbody>
          {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">Chưa có sản phẩm nào</td>
              </tr>
          ) : (
              products.map((product) => (
                  <tr key={product.productId}>
                    <td className="px-4 py-2 border">{product.productName}</td>
                    <td className="px-4 py-2 border">{product.productQuantity}</td>
                    <td className="px-4 py-2 border">{product.description}</td>
                    <td className="px-4 py-2 border">{product.brand?.brandName}</td>
                    <td className="px-4 py-2 border">{product.category?.categogyName}</td>
                    <td className="px-4 py-2 border">
                      {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.productName} className="w-20 h-20 object-cover"/>
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                          onClick={() => handleEdit(product)}
                          className="bg-yellow-500 text-white p-1 rounded-md mx-1"
                      >
                        Sửa
                      </button>
                      <button
                          onClick={() => handleDelete(product.productId)}
                          className="bg-red-500 text-white p-1 rounded-md mx-1"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
              ))
          )}
          </tbody>
        </table>
      </div>
  );
};

export default ProductForm;

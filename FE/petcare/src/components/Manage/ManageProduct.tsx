import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebaseConfig";
import ProductService from '../../service/ProductService';
import BrandService from '../../service/BrandService';
import ProductCategoriesService from '../../service/ProductCategoriesService';
import DataTable from 'react-data-table-component';

const ProductForm = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = useForm();

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
    if (!file && !editMode) {
      errors.imageUrl = 'Hình ảnh là bắt buộc.';
    }
    return errors;
  };

  const handleCreateOrUpdate = async (data) => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(errors);
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
      saveProductDetails(data.imageUrl);
    }
  };

  const resetForm = () => {
    reset();
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
        productName: editMode ? productDetails.productName : productName,
        productQuantity: editMode ? productDetails.productQuantity : productQuantity,
        description: editMode ? productDetails.description : description,
        imageUrl: imageUrl || productDetails.imageUrl,
        brand: { brandId: brandId },
        category: { productCategogyId: categoryId },
        status,
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
    setValue('productName', product.productName);
    setValue('productQuantity', product.productQuantity);
    setValue('description', product.description);
    setValue('imageUrl', product.imageUrl);
    setValue('brand', product.brand.brandId);
    setValue('category', product.category.productCategogyId);
    setValue('status', product.status);
    openModal();  // Open modal when editing a product
  };

  const handleDelete = async (id) => {
    try {
      const productToUpdate = products.find(product => product.productId === id);

      if (productToUpdate) {
        const updatedProduct = { ...productToUpdate, status: !productToUpdate.status };
        await ProductService.updateProduct(id, updatedProduct);
        fetchProducts();
      }
    } catch (err) {
      setError('Failed to update product status: ' + (err.response?.data?.message || err.message));
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
      width: '200px',
    },
    {
      name: 'Số lượng',
      selector: row => row.productQuantity,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Mô tả',
      selector: row => row.description,
      sortable: true,
      width: '250px',
    },
    {
      name: 'Thương hiệu',
      selector: row => row.brand?.brandName,
      sortable: true,
      width: '150px',
    },
    {
      name: 'Danh mục',
      selector: row => row.category?.categogyName,
      sortable: true,
      width: '150px',
    },
    {
      name: 'Trạng thái',
      cell: row => (
          <span
              className={`px-2 py-1 rounded-md text-xs font-semibold ${row.status ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
          >
          {row.status ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
      sortable: true,
      width: '120px',
    },
    {
      name: 'Hình ảnh',
      cell: row => row.imageUrl ? (
          <img src={row.imageUrl} alt={row.productName} className="w-16 h-16 object-cover rounded-md" />
      ) : null,
      width: '100px',
    },
    {
      name: 'Hành động',
      cell: row => (
          <div className="flex justify-center gap-2">
            <button onClick={() => handleEdit(row)} className="bg-yellow-500 text-white p-1 rounded-md text-xs hover:bg-yellow-600">Sửa</button>
            <button onClick={() => handleDelete(row.productId)} className="bg-red-500 text-white p-1 rounded-md text-xs hover:bg-red-600">Xóa</button>
          </div>
      ),
      width: '150px',
    },
  ];

  return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Quản lý sản phẩm</h1>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

        <button onClick={openModal} className="bg-blue-600 text-white p-2 rounded-md mb-6">
          Thêm sản phẩm
        </button>

        {/* Product Form Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 lg:w-2/3 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
                <h2 className="text-3xl font-semibold mb-4">Thêm/Sửa sản phẩm</h2>
                <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="mb-2 font-medium">Tên sản phẩm</label>
                      <input
                          type="text"
                          className="px-4 py-2 border rounded-md"
                          {...register('productName', {required: 'Tên sản phẩm là bắt buộc'})}
                      />
                      {errors.productName && <span className="text-red-600">{errors.productName.message}</span>}
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-2 font-medium">Số lượng</label>
                      <input
                          type="number"
                          className="px-4 py-2 border rounded-md"
                          {...register('productQuantity', {required: 'Số lượng là bắt buộc'})}
                      />
                      {errors.productQuantity && <span className="text-red-600">{errors.productQuantity.message}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-2 font-medium">Mô tả</label>
                    <textarea
                        className="px-4 py-2 border rounded-md"
                        rows="4"
                        {...register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="mb-2 font-medium">Thương hiệu</label>
                      <Controller
                          control={control}
                          name="brand"
                          rules={{required: 'Chọn thương hiệu'}}
                          render={({field}) => (
                              <select
                                  className="px-4 py-2 border rounded-md"
                                  {...field}
                              >
                                <option value="">Chọn thương hiệu</option>
                                {brands.map((brand) => (
                                    <option key={brand.brandId} value={brand.brandId}>
                                      {brand.brandName}
                                    </option>
                                ))}
                              </select>
                          )}
                      />
                      {errors.brand && <span className="text-red-600">{errors.brand.message}</span>}
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-2 font-medium">Danh mục</label>
                      <Controller
                          control={control}
                          name="category"
                          rules={{required: 'Chọn danh mục'}}
                          render={({field}) => (
                              <select
                                  className="px-4 py-2 border rounded-md"
                                  {...field}
                              >
                                <option value="">Chọn danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.productCategogyId} value={category.productCategogyId}>
                                      {category.categogyName}
                                    </option>
                                ))}
                              </select>
                          )}
                      />
                      {errors.category && <span className="text-red-600">{errors.category.message}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-2 font-medium">Hình ảnh</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="px-4 py-2 border rounded-md"
                        {...register('imageUrl', {
                          required: 'Hình ảnh là bắt buộc.'
                        })}
                        onChange={e => setFile(e.target.files[0])}
                    />
                    {errors.imageUrl && <span className="text-red-600">{errors.imageUrl.message}</span>}
                  </div>


                  <div className="flex items-center space-x-2 mt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        disabled={uploading}
                    >
                      {uploading ? `Đang tải lên ${Math.round(uploadProgress)}%` : 'Lưu'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                          resetForm(); // Reset form
                          closeModal(); // Đóng modal
                        }}
                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Hủy
                    </button>

                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Product List */}
        <DataTable
            columns={columns}
            data={products}
            pagination
        />
      </div>
  );
};

export default ProductForm;

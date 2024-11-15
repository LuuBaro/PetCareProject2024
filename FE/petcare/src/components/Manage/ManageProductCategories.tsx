import React, { useEffect, useState } from 'react';
import ProductCategoriesService from '../../service/ProductCategoriesService';
import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // firebase methods for upload and retrieval

const ProductCategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState(null); // Image state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ProductCategoriesService.getAllProductCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Không thể lấy danh sách danh mục: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) return ''; // If no image selected, return empty string

    const storageRef = ref(storage, `category-images/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    return new Promise((resolve, reject) => {
      uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (err) => {
            reject('Không thể tải lên hình ảnh: ' + (err.message || err));
          },
          async () => {
            try {
              const imageURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(imageURL); // Resolve with image URL
            } catch (err) {
              reject('Không thể lấy URL hình ảnh: ' + (err.message || err));
            }
          }
      );
    });
  };

  const handleAddOrUpdate = async () => {
    try {
      let categoryData = { categogyName: categoryName };

      // Upload image and get URL
      const imageURL = await handleImageUpload();
      if (imageURL) {
        categoryData = { ...categoryData, image: imageURL };
      }

      if (categoryId) {
        await ProductCategoriesService.updateProductCategory(categoryId, categoryData);
      } else {
        await ProductCategoriesService.createProductCategory(categoryData);
      }

      fetchCategories();
      resetForm();
    } catch (err) {
      setError('Không thể lưu danh mục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (category) => {
    setCategoryId(category.productCategogyId);
    setCategoryName(category.categogyName);
    setImage(category.image); // Preload image for editing
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      try {
        await ProductCategoriesService.deleteProductCategory(id);
        fetchCategories();
      } catch (err) {
        setError('Không thể xóa danh mục: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetForm = () => {
    setCategoryId(null);
    setCategoryName('');
    setImage(null); // Clear image after reset
    setError(null);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  if (loading) {
    return <div>Đang tải danh mục...</div>;
  }

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Quản lý Danh mục Sản phẩm</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <input
              type="text"
              placeholder="Tên Danh mục"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="border rounded p-2 w-1/4"
          />
          <input
              type="file"
              onChange={handleImageChange}
              className="border rounded p-2 ml-2"
          />
          <button onClick={handleAddOrUpdate} className="bg-blue-500 text-white rounded px-4 py-2 ml-2">
            {categoryId ? 'Cập nhật Danh mục' : 'Thêm Danh mục'}
          </button>
          <button onClick={resetForm} className="bg-gray-500 text-white rounded px-4 py-2 ml-2">
            Đặt lại
          </button>
        </div>

        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
          <tr>
            <th className="border border-gray-200 p-2">ID</th>
            <th className="border border-gray-200 p-2">Tên Danh mục</th>
            <th className="border border-gray-200 p-2">Hình ảnh</th>
            <th className="border border-gray-200 p-2">Hành động</th>
          </tr>
          </thead>
          <tbody>
          {categories.length > 0 ? (
              categories.map((category) => (
                  <tr key={category.productCategogyId}>
                    <td className="border border-gray-200 p-2">{category.productCategogyId}</td>
                    <td className="border border-gray-200 p-2">{category.categogyName || 'Unknown Category'}</td>
                    <td className="border border-gray-200 p-2">
                      {category.image ? <img src={category.image} alt="category" className="w-16 h-16 object-cover" /> : 'No Image'}
                    </td>
                    <td className="border border-gray-200 p-2">
                      <button onClick={() => handleEdit(category)} className="bg-yellow-500 text-white rounded px-2 py-1">
                        Chỉnh sửa
                      </button>
                      <button onClick={() => handleDelete(category.productCategogyId)} className="bg-red-500 text-white rounded px-2 py-1 ml-2">
                        Xóa
                      </button>
                    </td>
                  </tr>
              ))
          ) : (
              <tr>
                <td colSpan="4" className="border border-gray-200 p-2 text-center">Không có danh mục nào</td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
};

export default ProductCategoriesTable;

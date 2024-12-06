import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import ProductCategoriesService from '../../service/ProductCategoriesService';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ProductCategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]); // Filtered data for display
  const [searchText, setSearchText] = useState(''); // Search query
  const [categoryId, setCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories when search text changes
    const filtered = categories.filter((category) =>
        category.categogyName?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchText, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ProductCategoriesService.getAllProductCategories();
      setCategories(response.data);
      setFilteredCategories(response.data); // Initialize filtered data
    } catch (err) {
      setError('Không thể lấy danh sách danh mục: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) return '';

    const storageRef = ref(storage, `category-images/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    return new Promise((resolve, reject) => {
      uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (err) => reject('Không thể tải lên hình ảnh: ' + err.message),
          async () => {
            try {
              const imageURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(imageURL);
            } catch (err) {
              reject('Không thể lấy URL hình ảnh: ' + err.message);
            }
          }
      );
    });
  };

  const handleAddOrUpdate = async () => {
    try {
      let categoryData = { categogyName: categoryName };

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
    setImage(category.image);
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
    setImage(null);
    setError(null);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.productCategogyId,
      sortable: true,
    },
    {
      name: 'Tên Danh mục',
      selector: (row) => row.categogyName || 'Unknown Category',
      sortable: true,
    },
    {
      name: 'Hình ảnh',
      cell: (row) =>
          row.image ? (
              <img src={row.image} alt="category" className="w-16 h-16 object-cover" />
          ) : (
              'No Image'
          ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: 'Hành động',
      cell: (row) => (
          <>
            <button onClick={() => handleEdit(row)} className="bg-yellow-500 text-white rounded px-2 py-1">
              Chỉnh sửa
            </button>
            <button
                onClick={() => handleDelete(row.productCategogyId)}
                className="bg-red-500 text-white rounded px-2 py-1 ml-2"
            >
              Xóa
            </button>
          </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (loading) {
    return <div>Đang tải danh mục...</div>;
  }

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Quản lý Danh mục Sản phẩm</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="mb-4">
              <div>
                  <input
                      type="text"
                      placeholder="Tên Danh mục"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="border rounded p-2 w-1/4 mb-4"
                  />
                  <input type="file" onChange={handleImageChange} className="border rounded p-2 ml-2"/>
                  <button onClick={handleAddOrUpdate} className="bg-blue-500 text-white rounded px-4 py-2 ml-2">
                      {categoryId ? 'Cập nhật Danh mục' : 'Thêm Danh mục'}
                  </button>
                  <button onClick={resetForm} className="bg-gray-500 text-white rounded px-4 py-2 ml-2">
                      Đặt lại
                  </button>
              </div>
              <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="border rounded p-2 w-1/4"
              />
          </div>

          <DataTable
              columns={columns}
              data={filteredCategories} // Use filtered data for the table
              pagination
              highlightOnHover
              selectableRows
              persistTableHead
          />
      </div>
  );
};

export default ProductCategoriesTable;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component'; // Import the DataTable component

const API_URL = 'http://localhost:8080/api/product-colors';

interface ProductColor {
  productColorId: number;
  color: string;
  status: boolean;
}

const ProductColorManager: React.FC = () => {
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [color, setColor] = useState<string>('');
  const [status, setStatus] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProductColors();
  }, []);

  const fetchProductColors = async () => {
    try {
      const response = await axios.get<ProductColor[]>(API_URL);
      setProductColors(response.data);
    } catch (error) {
      console.error("Error fetching product colors:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProductColor = { color, status };

    try {
      await axios.post(API_URL, newProductColor);
      fetchProductColors();
      resetForm();
    } catch (error) {
      console.error("Error creating product color:", error);
    }
  };

  const handleEdit = (id: number) => {
    const colorToEdit = productColors.find(color => color.productColorId === id);
    if (colorToEdit) {
      setColor(colorToEdit.color);
      setStatus(colorToEdit.status);
      setEditingId(id);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;

    const updatedProductColor = { color, status };

    try {
      await axios.put(`${API_URL}/${editingId}`, updatedProductColor);
      fetchProductColors();
      setEditingId(null); // Reset editing mode
      resetForm();
    } catch (error) {
      console.error("Error updating product color:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProductColors();
    } catch (error) {
      console.error("Error deleting product color:", error);
    }
  };

  const resetForm = () => {
    setColor('');
    setStatus(true);
    setEditingId(null);
  };

  // Define columns for DataTable
  const columns = [
    {
      name: 'Màu sắc',
      selector: (row: ProductColor) => row.color,
      sortable: true,
    },
    {
      name: 'Trạng thái',
      selector: (row: ProductColor) => (row.status ? 'Kích hoạt' : 'Hủy kích hoạt'),
      sortable: true,
      cell: (row: ProductColor) => (
          <span className={row.status ? 'text-green-500' : 'text-red-500'}>
          {row.status ? 'Kích hoạt' : 'Hủy kích hoạt'}
        </span>
      ),
    },
    {
      name: 'Hành động',
      cell: (row: ProductColor) => (
          <div className="flex space-x-2">
            <button
                onClick={() => handleEdit(row.productColorId)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Sửa
            </button>
            <button
                onClick={() => handleDelete(row.productColorId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
      ),
    },
  ];

  return (
      <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-6">Quản lý Màu Sản Phẩm</h2>

        <form onSubmit={editingId ? handleUpdate : handleCreate} className="mb-8 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                  type="text"
                  placeholder="Màu sắc"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full md:w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                  value={status.toString()}
                  onChange={(e) => setStatus(e.target.value === 'true')}
                  className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Kích hoạt</option>
                <option value="false">Hủy kích hoạt</option>
              </select>
            </div>

            <div className="flex justify-between gap-4">
              <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full md:w-1/2 shadow-md"
              >
                {editingId ? 'Cập nhật' : 'Tạo mới'} Màu Sản Phẩm
              </button>

              <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-full md:w-1/2 shadow-md"
              >
                Reset Form
              </button>
            </div>
          </div>
        </form>

        <h3 className="text-2xl font-semibold mb-4">Danh sách Màu Sản Phẩm</h3>
        <DataTable
            columns={columns}
            data={productColors}
            pagination
            highlightOnHover
            striped
            responsive
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: '#f4f4f4',
                },
              },
            }}
        />
      </div>
  );
};

export default ProductColorManager;

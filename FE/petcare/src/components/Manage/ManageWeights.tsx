import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const API_URL = 'http://localhost:8080/api/product-weights';

interface ProductWeight {
  productWeightId: number;
  weightValue: string;
  status: boolean;
}

const ManageWeights: React.FC = () => {
  const [productWeights, setProductWeights] = useState<ProductWeight[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newStatus, setNewStatus] = useState<boolean>(true); // Mặc định trạng thái là Active
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editWeightId, setEditWeightId] = useState<number | null>(null);
  const [editWeightValue, setEditWeightValue] = useState<string>('');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Trạng thái cho từ khóa tìm kiếm
  const [error, setError] = useState<string>(''); // Trạng thái lưu lỗi xác thực

  useEffect(() => {
    fetchProductWeights();
  }, []);

  // Lấy tất cả các trọng lượng sản phẩm
  const fetchProductWeights = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setProductWeights(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin trọng lượng sản phẩm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra trọng lượng mới trước khi thêm
  const validateNewWeight = (weight: string) => {
    if (!weight.trim()) {
      setError('Trọng lượng không được để trống.');
      return false;
    }

    // Biểu thức chính quy để kiểm tra ký tự đặc biệt
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharRegex.test(weight)) {
      setError('Trọng lượng không được chứa ký tự đặc biệt.');
      return false;
    }

    setError('');
    return true;
  };

  // Thêm trọng lượng sản phẩm mới
  const addProductWeight = async () => {
    if (!validateNewWeight(newWeight)) return; // Kiểm tra trước khi thêm

    const newProductWeight = { weightValue: newWeight, status: newStatus };
    try {
      const response = await axios.post(API_URL, newProductWeight);
      setProductWeights([...productWeights, response.data]);
      setNewWeight('');
      setNewStatus(true); // Đặt lại thành Active sau khi thêm
    } catch (error) {
      console.error('Lỗi khi tạo trọng lượng sản phẩm:', error);
    }
  };

  // Xóa trọng lượng sản phẩm
  const deleteProductWeight = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProductWeights(productWeights.filter(weight => weight.productWeightId !== id));
    } catch (error) {
      console.error('Lỗi khi xóa trọng lượng sản phẩm:', error);
    }
  };

  // Cập nhật trọng lượng sản phẩm hiện tại
  const updateProductWeight = async () => {
    if (editWeightId === null || !editWeightValue.trim()) return;

    try {
      const updatedProductWeight = { weightValue: editWeightValue, status: editStatus };
      await axios.put(`${API_URL}/${editWeightId}`, updatedProductWeight);
      setProductWeights(productWeights.map(weight =>
          weight.productWeightId === editWeightId
              ? { ...weight, weightValue: editWeightValue, status: editStatus }
              : weight
      ));
      setEditWeightId(null); // Đóng trình chỉnh sửa
    } catch (error) {
      console.error('Lỗi khi cập nhật trọng lượng sản phẩm:', error);
    }
  };

  // Lọc trọng lượng sản phẩm theo từ khóa tìm kiếm
  const filteredProductWeights = productWeights.filter((weight) =>
      weight.weightValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (weight.status ? 'active' : 'inactive').includes(searchTerm.toLowerCase())
  );

  // Cấu hình cột cho DataTable
  const columns = [
    {
      name: 'ID',
      selector: (row: ProductWeight) => row.productWeightId,
      sortable: true,
    },
    {
      name: 'Giá trị trọng lượng',
      selector: (row: ProductWeight) => row.weightValue,
      sortable: true,
      cell: (row: ProductWeight) => (
          editWeightId === row.productWeightId
              ? <input
                  type="text"
                  value={editWeightValue}
                  onChange={(e) => setEditWeightValue(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-60"
              />
              : row.weightValue
      ),
    },
    {
      name: 'Trạng thái',
      selector: (row: ProductWeight) => (row.status ? 'Active' : 'Inactive'),
      sortable: true,
      cell: (row: ProductWeight) => (
          editWeightId === row.productWeightId
              ? <select
                  value={editStatus ? 'Active' : 'Inactive'}
                  onChange={(e) => setEditStatus(e.target.value === 'Active')}
                  className="p-2 border border-gray-300 rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              : <span className={`inline-block px-2 py-1 rounded-md ${row.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} >
              {row.status ? 'Active' : 'Inactive'}
            </span>
      ),
    },
    {
      name: 'Hành động',
      cell: (row: ProductWeight) => (
          <div className="flex gap-2">
            {editWeightId === row.productWeightId ? (
                <button
                    onClick={updateProductWeight}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Lưu
                </button>
            ) : (
                <button
                    onClick={() => {
                      setEditWeightId(row.productWeightId);
                      setEditWeightValue(row.weightValue);
                      setEditStatus(row.status);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                >
                  Chỉnh sửa
                </button>
            )}
            <button
                onClick={() => deleteProductWeight(row.productWeightId)}
                className="text-red-500 hover:text-red-700"
            >
              Xóa
            </button>
          </div>
      ),
    },
  ];

  return (
      <div className="p-6 space-y-6 bg-gray-50 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-700">Quản lý Trọng Lượng Sản Phẩm</h2>

        {/* Thêm Trọng Lượng Mới */}
        <div className="flex justify-center gap-4">
          <input
              type="text"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Nhập trọng lượng sản phẩm mới"
              className="p-2 border border-gray-300 rounded-md w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
              value={newStatus ? 'Active' : 'Inactive'}
              onChange={(e) => setNewStatus(e.target.value === 'Active')}
              className="p-2 border border-gray-300 rounded-md w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
              onClick={addProductWeight}
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-32 hover:bg-blue-600"
          >
            Thêm Trọng Lượng
          </button>
        </div>

        {/* Lỗi xác thực */}
        {error && <div className="text-red-500 text-center">{error}</div>}

        {/* Tìm kiếm */}
        <div className="flex justify-center">
          <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo trọng lượng hoặc trạng thái"
              className="p-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DataTable */}
        {isLoading ? (
            <p className="text-center text-gray-600">Đang tải...</p>
        ) : (
            <DataTable
                title="Danh Sách Trọng Lượng Sản Phẩm"
                columns={columns}
                data={filteredProductWeights}
                pagination
                highlightOnHover
                responsive
                noDataComponent="Không có dữ liệu"
            />
        )}
      </div>
  );
};

export default ManageWeights;

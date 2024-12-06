import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const API_URL = 'http://localhost:8080/api/product-sizes';

interface ProductSize {
  productSizeId: number;
  productSize: string;
  status: boolean;
}

const ProductSizeManager: React.FC = () => {
  const [productSizes, setProductSizes] = useState<ProductSize[]>([]);
  const [newSize, setNewSize] = useState<string>('');
  const [newStatus, setNewStatus] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editSizeId, setEditSizeId] = useState<number | null>(null);
  const [editSize, setEditSize] = useState<string>('');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProductSizes();
  }, []);

  // Lấy danh sách kích thước sản phẩm
  const fetchProductSizes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setProductSizes(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu kích thước sản phẩm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra đầu vào
  const validateInput = (input: string): string | null => {
    if (!input.trim()) {
      return 'Kích thước không được để trống.';
    }
    if (/[^a-zA-Z0-9\s]/.test(input)) {
      return 'Kích thước chỉ được chứa chữ cái, số và khoảng trắng.';
    }
    return null;
  };

  // Thêm kích thước mới
  const addProductSize = async () => {
    const errorMessage = validateInput(newSize);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    const newProductSize = { productSize: newSize, status: newStatus };
    try {
      const response = await axios.post(API_URL, newProductSize);
      setProductSizes([...productSizes, response.data]);
      setNewSize('');
      setNewStatus(true);
      setFormError(null);
      setIsModalOpen(false); // Đóng modal sau khi thêm thành công
    } catch (error) {
      console.error('Lỗi khi thêm kích thước sản phẩm:', error);
    }
  };

  // Cập nhật kích thước
  const updateProductSize = async () => {
    if (editSizeId === null) return;

    const errorMessage = validateInput(editSize);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    try {
      const updatedProductSize = { productSize: editSize, status: editStatus };
      await axios.put(`${API_URL}/${editSizeId}`, updatedProductSize);
      setProductSizes(productSizes.map(size =>
          size.productSizeId === editSizeId
              ? { ...size, productSize: editSize, status: editStatus }
              : size
      ));
      setEditSizeId(null);
      setEditSize('');
      setEditStatus(true);
      setFormError(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật kích thước sản phẩm:', error);
    }
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredProductSizes = productSizes.filter((size) =>
      size.productSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (size.status ? 'hoạt động' : 'không hoạt động').includes(searchTerm.toLowerCase())
  );

  // Các cột trong bảng
  const columns = [
    {
      name: 'Mã ID',
      selector: (row: ProductSize) => row.productSizeId,
      sortable: true,
    },
    {
      name: 'Kích thước sản phẩm',
      selector: (row: ProductSize) => row.productSize,
      sortable: true,
      cell: (row: ProductSize) => (
          editSizeId === row.productSizeId
              ? <input
                  type="text"
                  value={editSize}
                  onChange={(e) => {
                    setEditSize(e.target.value);
                    setFormError(null);
                  }}
                  className="p-2 border border-gray-300 rounded-md w-60"
              />
              : row.productSize
      ),
    },
    {
      name: 'Trạng thái',
      selector: (row: ProductSize) => (row.status ? 'Hoạt động' : 'Không hoạt động'),
      sortable: true,
      cell: (row: ProductSize) => (
          editSizeId === row.productSizeId
              ? <select
                  value={editStatus ? 'Hoạt động' : 'Không hoạt động'}
                  onChange={(e) => setEditStatus(e.target.value === 'Hoạt động')}
                  className="p-2 border border-gray-300 rounded-md"
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </select>
              : <span className={`px-2 py-1 rounded-md ${row.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} >
                {row.status ? 'Hoạt động' : 'Không hoạt động'}
              </span>
      ),
    },
    {
      name: 'Hành động',
      cell: (row: ProductSize) => (
          <div className="flex gap-2">
            {editSizeId === row.productSizeId ? (
                <button
                    onClick={updateProductSize}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Lưu
                </button>
            ) : (
                <button
                    onClick={() => {
                      setEditSizeId(row.productSizeId);
                      setEditSize(row.productSize);
                      setEditStatus(row.status);
                      setFormError(null);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                >
                  Sửa
                </button>
            )}
          </div>
      ),
    },
  ];

  return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Quản lý kích thước sản phẩm</h2>

        {/* Nút thêm kích thước mới */}
        <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-md mb-4"
        >
          Thêm mới kích thước
        </button>

        {/* Modal thêm kích thước mới */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
              <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <h3 className="text-xl font-bold mb-4">Thêm kích thước mới</h3>
                <div className="mb-4">
                  <input
                      type="text"
                      value={newSize}
                      onChange={(e) => {
                        setNewSize(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="Nhập kích thước mới"
                      className="p-2 border border-gray-300 rounded-md w-full"
                  />
                  {formError && <span className="text-red-500">{formError}</span>}
                </div>
                <div className="mb-4">
                  <select
                      value={newStatus ? 'Hoạt động' : 'Không hoạt động'}
                      onChange={(e) => setNewStatus(e.target.value === 'Hoạt động')}
                      className="p-2 border border-gray-300 rounded-md w-full"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Không hoạt động">Không hoạt động</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <button
                      onClick={addProductSize}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Thêm mới
                  </button>
                  <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
        )}


        {/* Bảng dữ liệu */}
        {isLoading ? (
            <p className="text-center">Đang tải...</p>
        ) : (
            <>
              <div className="mb-4 flex justify-center">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm kích thước hoặc trạng thái"
                    className="p-2 border border-gray-300 rounded-md w-10/12"
                />
              </div>

              <DataTable
                  title="Danh sách kích thước sản phẩm"
                  columns={columns}
                  data={filteredProductSizes}
                  pagination
                  highlightOnHover
                  responsive
              />
            </>
        )}

      </div>
  );
};

export default ProductSizeManager;

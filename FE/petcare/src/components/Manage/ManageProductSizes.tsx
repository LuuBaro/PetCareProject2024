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
  const [newStatus, setNewStatus] = useState<boolean>(true); // Default status set to true (Active)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editSizeId, setEditSizeId] = useState<number | null>(null);
  const [editSize, setEditSize] = useState<string>('');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term

  useEffect(() => {
    fetchProductSizes();
  }, []);

  // Fetch all product sizes
  const fetchProductSizes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setProductSizes(response.data);
    } catch (error) {
      console.error('Error fetching product sizes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new product size
  const addProductSize = async () => {
    if (!newSize.trim()) return;
    const newProductSize = { productSize: newSize, status: newStatus };
    try {
      const response = await axios.post(API_URL, newProductSize);
      setProductSizes([...productSizes, response.data]);
      setNewSize('');
      setNewStatus(true); // Reset to Active after adding
    } catch (error) {
      console.error('Error creating product size:', error);
    }
  };

  // Delete a product size
  const deleteProductSize = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProductSizes(productSizes.filter(size => size.productSizeId !== id));
    } catch (error) {
      console.error('Error deleting product size:', error);
    }
  };

  // Update an existing product size
  const updateProductSize = async () => {
    if (editSizeId === null || !editSize.trim()) return;

    try {
      const updatedProductSize = { productSize: editSize, status: editStatus };
      await axios.put(`${API_URL}/${editSizeId}`, updatedProductSize);
      setProductSizes(productSizes.map(size =>
          size.productSizeId === editSizeId
              ? { ...size, productSize: editSize, status: editStatus }
              : size
      ));
      setEditSizeId(null); // Close the editor after saving
      setEditSize(''); // Clear the edit form fields
      setEditStatus(true); // Reset the status to Active
    } catch (error) {
      console.error('Error updating product size:', error);
    }
  };

  // Filtered data based on search term
  const filteredProductSizes = productSizes.filter((size) =>
      size.productSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (size.status ? 'active' : 'inactive').includes(searchTerm.toLowerCase())
  );

  // DataTable columns
  const columns = [
    {
      name: 'ID',
      selector: (row: ProductSize) => row.productSizeId,
      sortable: true,
    },
    {
      name: 'Product Size',
      selector: (row: ProductSize) => row.productSize,
      sortable: true,
      cell: (row: ProductSize) => (
          editSizeId === row.productSizeId
              ? <input
                  type="text"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-60"
              />
              : row.productSize
      ),
    },
    {
      name: 'Status',
      selector: (row: ProductSize) => (row.status ? 'Active' : 'Inactive'),
      sortable: true,
      cell: (row: ProductSize) => (
          editSizeId === row.productSizeId
              ? <select
                  value={editStatus ? 'Active' : 'Inactive'}
                  onChange={(e) => setEditStatus(e.target.value === 'Active')}
                  className="p-2 border border-gray-300 rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              : <span className={`px-2 py-1 rounded-md ${row.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {row.status ? 'Active' : 'Inactive'}
            </span>
      ),
    },
    {
      name: 'Actions',
      cell: (row: ProductSize) => (
          <div className="flex gap-2">
            {editSizeId === row.productSizeId ? (
                <button
                    onClick={updateProductSize}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
            ) : (
                <button
                    onClick={() => {
                      setEditSizeId(row.productSizeId);
                      setEditSize(row.productSize);
                      setEditStatus(row.status);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
            )}
            <button
                onClick={() => deleteProductSize(row.productSizeId)}
                className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
      ),
    },
  ];

  return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Product Size Manager</h2>

        {/* Add New Size */}
        <div className="mb-6 flex justify-center space-x-2">
          <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Enter new product size"
              className="p-2 border border-gray-300 rounded-md w-60"
          />
          <select
              value={newStatus ? 'Active' : 'Inactive'}
              onChange={(e) => setNewStatus(e.target.value === 'Active')}
              className="p-2 border border-gray-300 rounded-md"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
              onClick={addProductSize}
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-32"
          >
            Add Size
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4 flex justify-center">
          <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by size or status"
              className="p-2 border border-gray-300 rounded-md w-60"
          />
        </div>

        {/* DataTable */}
        {isLoading ? (
            <p className="text-center">Loading...</p>
        ) : (
            <DataTable
                title="Product Sizes"
                columns={columns}
                data={filteredProductSizes}
                pagination
                highlightOnHover
                responsive
            />
        )}
      </div>
  );
};

export default ProductSizeManager;

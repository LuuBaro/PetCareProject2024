import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      setEditSizeId(null); // Close the editor
    } catch (error) {
      console.error('Error updating product size:', error);
    }
  };

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

        {/* Display Product Sizes */}
        {isLoading ? (
            <p className="text-center">Loading...</p>
        ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">ID</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">Product Size</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">Status</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">Actions</th>
                </tr>
                </thead>
                <tbody>
                {productSizes.map((size) => (
                    <tr key={size.productSizeId} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b text-sm">{size.productSizeId}</td>
                      <td className="py-2 px-4 border-b text-sm">
                        {editSizeId === size.productSizeId ? (
                            <input
                                type="text"
                                value={editSize}
                                onChange={(e) => setEditSize(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md w-60"
                            />
                        ) : (
                            size.productSize
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {editSizeId === size.productSizeId ? (
                            <select
                                value={editStatus ? 'Active' : 'Inactive'}
                                onChange={(e) => setEditStatus(e.target.value === 'Active')}
                                className="p-2 border border-gray-300 rounded-md"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                        ) : (
                            <span className={`inline-block px-2 py-1 rounded-md ${size.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {size.status ? 'Active' : 'Inactive'}
                      </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {editSizeId === size.productSizeId ? (
                            <button
                                onClick={updateProductSize}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                              Save
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                  setEditSizeId(size.productSizeId);
                                  setEditSize(size.productSize);
                                  setEditStatus(size.status);
                                }}
                                className="text-blue-500 hover:text-blue-700 mr-2"
                            >
                              Edit
                            </button>
                        )}
                        <button
                            onClick={() => deleteProductSize(size.productSizeId)}
                            className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
};

export default ProductSizeManager;

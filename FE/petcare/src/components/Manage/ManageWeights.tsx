import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/product-weights';

interface ProductWeight {
  productWeightId: number;
  weightValue: string;
  status: boolean;
}

const ManageWeights: React.FC = () => {
  const [productWeights, setProductWeights] = useState<ProductWeight[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newStatus, setNewStatus] = useState<boolean>(true); // Default status set to Active
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editWeightId, setEditWeightId] = useState<number | null>(null);
  const [editWeightValue, setEditWeightValue] = useState<string>('');
  const [editStatus, setEditStatus] = useState<boolean>(true);

  useEffect(() => {
    fetchProductWeights();
  }, []);

  // Fetch all product weights
  const fetchProductWeights = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setProductWeights(response.data);
    } catch (error) {
      console.error('Error fetching product weights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new product weight
  const addProductWeight = async () => {
    if (!newWeight.trim()) return;
    const newProductWeight = { weightValue: newWeight, status: newStatus };
    try {
      const response = await axios.post(API_URL, newProductWeight);
      setProductWeights([...productWeights, response.data]);
      setNewWeight('');
      setNewStatus(true); // Reset to Active after adding
    } catch (error) {
      console.error('Error creating product weight:', error);
    }
  };

  // Delete a product weight
  const deleteProductWeight = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProductWeights(productWeights.filter(weight => weight.productWeightId !== id));
    } catch (error) {
      console.error('Error deleting product weight:', error);
    }
  };

  // Update an existing product weight
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
      setEditWeightId(null); // Close the editor
    } catch (error) {
      console.error('Error updating product weight:', error);
    }
  };

  return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Manage Product Weights</h2>

        {/* Add New Weight */}
        <div className="mb-6 flex justify-center space-x-2">
          <input
              type="text"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter new product weight"
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
              onClick={addProductWeight}
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-32"
          >
            Add Weight
          </button>
        </div>

        {/* Display Product Weights */}
        {isLoading ? (
            <p className="text-center">Loading...</p>
        ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">ID</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">Weight Value</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">Status</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-semibold">Actions</th>
                </tr>
                </thead>
                <tbody>
                {productWeights.map((weight) => (
                    <tr key={weight.productWeightId} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b text-sm">{weight.productWeightId}</td>
                      <td className="py-2 px-4 border-b text-sm">
                        {editWeightId === weight.productWeightId ? (
                            <input
                                type="text"
                                value={editWeightValue}
                                onChange={(e) => setEditWeightValue(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md w-60"
                            />
                        ) : (
                            weight.weightValue
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {editWeightId === weight.productWeightId ? (
                            <select
                                value={editStatus ? 'Active' : 'Inactive'}
                                onChange={(e) => setEditStatus(e.target.value === 'Active')}
                                className="p-2 border border-gray-300 rounded-md"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                        ) : (
                            <span className={`inline-block px-2 py-1 rounded-md ${weight.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {weight.status ? 'Active' : 'Inactive'}
                      </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {editWeightId === weight.productWeightId ? (
                            <button
                                onClick={updateProductWeight}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                              Save
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                  setEditWeightId(weight.productWeightId);
                                  setEditWeightValue(weight.weightValue);
                                  setEditStatus(weight.status);
                                }}
                                className="text-blue-500 hover:text-blue-700 mr-2"
                            >
                              Edit
                            </button>
                        )}
                        <button
                            onClick={() => deleteProductWeight(weight.productWeightId)}
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

export default ManageWeights;

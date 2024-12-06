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
  const [newStatus, setNewStatus] = useState<boolean>(true); // Default status set to Active
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editWeightId, setEditWeightId] = useState<number | null>(null);
  const [editWeightValue, setEditWeightValue] = useState<string>('');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term

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

  // Filter product weights based on the search term
  const filteredProductWeights = productWeights.filter((weight) =>
      weight.weightValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (weight.status ? 'active' : 'inactive').includes(searchTerm.toLowerCase())
  );

  // DataTable columns configuration
  const columns = [
    {
      name: 'ID',
      selector: (row: ProductWeight) => row.productWeightId,
      sortable: true,
    },
    {
      name: 'Weight Value',
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
      name: 'Status',
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
              : <span className={`inline-block px-2 py-1 rounded-md ${row.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {row.status ? 'Active' : 'Inactive'}
            </span>
      ),
    },
    {
      name: 'Actions',
      cell: (row: ProductWeight) => (
          <div className="flex gap-2">
            {editWeightId === row.productWeightId ? (
                <button
                    onClick={updateProductWeight}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save
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
                  Edit
                </button>
            )}
            <button
                onClick={() => deleteProductWeight(row.productWeightId)}
                className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
      ),
    },
  ];

  return (
      <div className="p-6 space-y-6 bg-gray-50 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-700">Manage Product Weights</h2>

        {/* Add New Weight */}
        <div className="flex justify-center gap-4">
          <input
              type="text"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter new product weight"
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
            Add Weight
          </button>
        </div>

        {/* Search */}
        <div className="flex justify-center">
          <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by weight or status"
              className="p-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DataTable */}
        {isLoading ? (
            <p className="text-center text-gray-600">Loading...</p>
        ) : (
            <DataTable
                title="Product Weights List"
                columns={columns}
                data={filteredProductWeights}
                pagination
                highlightOnHover
                responsive
                noDataComponent="No data available"
            />
        )}
      </div>
  );
};

export default ManageWeights;

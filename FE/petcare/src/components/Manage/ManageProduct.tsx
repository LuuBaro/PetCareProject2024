import React, {useEffect, useState} from 'react';
import {ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import {storage} from "../../config/firebaseConfig";
import ProductService from '../../service/ProductService';
import BrandService from '../../service/BrandService';
import ProductCategoriesService from '../../service/ProductCategoriesService';
import DataTable from 'react-data-table-component';


const ProductForm = () => {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productDetails, setProductDetails] = useState({
        productName: '',
        productQuantity: '',
        description: '',
        imageUrl: '',
        brand: {brandId: null},
        category: {productCategogyId: null},
    });
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [products, setProducts] = useState([]);
    const [editMode, setEditMode] = useState(false); // Track if editing an existing product
    const [currentProductId, setCurrentProductId] = useState(null); // Track the ID of the product being edited

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
        if (!productDetails.productName.trim()) {
            errors.productName = 'Tên sản phẩm là bắt buộc.';
        }
        if (!productDetails.productQuantity || isNaN(productDetails.productQuantity) || productDetails.productQuantity < 0) {
            errors.productQuantity = 'Số lượng sản phẩm là bắt buộc và phải là số hợp lệ.';
        }
        return errors;
    };

    const handleCreateOrUpdate = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
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
            saveProductDetails(productDetails.imageUrl);
        }
    };

    const resetForm = () => {
        setProductDetails({
            productName: '',
            productQuantity: '',
            description: '',
            imageUrl: '',
            brand: {brandId: null},
            category: {productCategogyId: null},
        });
        setFormErrors({});
        setFile(null);
        setError(null);
        setEditMode(false); // Reset edit mode
        setCurrentProductId(null); // Reset current product ID
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

    const columns = [
        {
            name: 'Tên sản phẩm',
            selector: row => row.productName,
            sortable: true,
        },
        {
            name: 'Số lượng',
            selector: row => row.productQuantity,
            sortable: true,
        },
        {
            name: 'Mô tả',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Thương hiệu',
            selector: row => row.brand?.brandName,
            sortable: true,
        },
        {
            name: 'Danh mục',
            selector: row => row.category?.categogyName,
            sortable: true,
        },
        {
            name: 'Hình ảnh',
            cell: row => (
                row.imageUrl ? (
                    <img src={row.imageUrl} alt={row.productName} className="w-20 h-20 object-cover"/>
                ) : null
            ),
        },
        {
            name: 'Hành động',
            cell: row => (
                <div>
                    <button
                        onClick={() => handleEdit(row)}
                        className="bg-yellow-500 text-white p-1 rounded-md mx-1"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => handleDelete(row.productId)}
                        className="bg-red-500 text-white p-1 rounded-md mx-1"
                    >
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    const saveProductDetails = async (imageUrl = '') => {
        try {
            const detailsToSend = {
                ...productDetails,
                imageUrl: imageUrl || productDetails.imageUrl,
                brand: {brandId: productDetails.brand.brandId},
                category: {productCategogyId: productDetails.category.productCategogyId},
            };

            if (editMode) {
                await ProductService.updateProduct(currentProductId, detailsToSend);
            } else {
                await ProductService.createProduct(detailsToSend);
            }

            fetchProducts();
            resetForm();
        } catch (err) {
            setError('Failed to save product: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (product) => {
        setEditMode(true);
        setCurrentProductId(product.productId);
        setProductDetails({
            productName: product.productName,
            productQuantity: product.productQuantity,
            description: product.description,
            imageUrl: product.imageUrl,
            brand: {brandId: product.brand.brandId},
            category: {productCategogyId: product.category.productCategogyId},
        });
    };

    const handleDelete = async (id) => {
        try {
            await ProductService.deleteProduct(id);
            fetchProducts();
        } catch (err) {
            setError('Failed to delete product: ' + (err.response?.data?.message || err.message));
        }
    };


    return (
        <div className="container mx-auto p-8">
            {/* Your existing product form code */}
            <h1 className="text-3xl font-bold text-center mb-6">Quản lý sản phẩm</h1>
            {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
            {uploading && (
                <div className="text-blue-600 mb-4 text-center">
                    Đang tải ảnh lên...
                    <div className="w-full mt-2">
                        <div className="bg-gray-300 rounded-full w-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{width: `${uploadProgress}%`}}
                            ></div>
                        </div>
                        <div className="text-center text-sm mt-1">{Math.round(uploadProgress)}%</div>
                    </div>
                </div>
            )}

            {/* Product Form */}
            <div className="mb-3 grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold">Tên sản phẩm</label>
                            <input
                                type="text"
                                value={productDetails.productName}
                                onChange={(e) => setProductDetails({...productDetails, productName: e.target.value})}
                                className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                            />
                            {formErrors.productName &&
                                <span className="text-red-600 text-sm">{formErrors.productName}</span>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold">Số lượng</label>
                            <input
                                type="number"
                                value={productDetails.productQuantity}
                                onChange={(e) => setProductDetails({
                                    ...productDetails,
                                    productQuantity: e.target.value
                                })}
                                className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                            />
                            {formErrors.productQuantity &&
                                <span className="text-red-600 text-sm">{formErrors.productQuantity}</span>}
                        </div>


                    </div>
                    o
                </div>
                <div>
                    <label htmlFor="brand" className="block font-medium text-gray-700 mb-2">Thương hiệu</label>
                    <select
                        id="brand"
                        value={productDetails.brand.brandId || ''}
                        onChange={(e) => setProductDetails({...productDetails, brand: {brandId: e.target.value}})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map((brand) => (
                            <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="category" className="block font-medium text-gray-700 mb-2">Danh mục</label>
                    <select
                        id="category"
                        value={productDetails.category.productCategogyId || ''}
                        onChange={(e) => setProductDetails({
                            ...productDetails,
                            category: {productCategogyId: e.target.value}
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                            <option key={category.productCategogyId}
                                    value={category.productCategogyId}>{category.categogyName}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Upload Section */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-900">Chọn hình ảnh</label>
                            <div
                                className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-indigo-600 px-6 py-10 hover:border-indigo-500 transition-colors duration-300">
                                <div className="text-center">
                                    <svg className="mx-auto text-gray-300 w-12 h-12 mb-4" viewBox="0 0 24 24"
                                         fill="currentColor"
                                         aria-hidden="true">
                                        <path fillRule="evenodd"
                                              d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <label htmlFor="file-upload"
                                               className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:text-indigo-500">
                                            <span>Chọn file</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={(e) => setFile(e.target.files[0])}
                                            />
                                        </label>
                                        <p className="mt-1">Hoặc kéo và thả</p>
                                    </div>
                                    <p className="text-xs text-gray-600">PNG, JPG, GIF tối đa 10MB</p>
                                </div>
                            </div>
                            {file && (
                                <div className="mt-2 text-sm text-gray-700">
                                    <span className="font-medium">File đã chọn:</span> {file.name}
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-900">Mô tả</label>
                            <textarea
                                value={productDetails.description}
                                onChange={(e) => setProductDetails({...productDetails, description: e.target.value})}
                                className="mt-2 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                rows="4"
                                placeholder="Nhập mô tả sản phẩm..."
                            />
                        </div>
                    </div>
                </div>


                <div className="col-span-2">
                    <div className="col-span-2 flex space-x-4">
                        <button
                            type="button"
                            onClick={handleCreateOrUpdate}
                            className="bg-blue-600 text-white p-2 rounded-md w-full sm:w-auto"
                        >
                            Lưu sản phẩm
                        </button>
                        <button
                            type="reset"
                            onClick={() => resetForm()} // Call resetForm function when the button is clicked
                            className="bg-neutral-500 text-white p-2 rounded-md w-full sm:w-auto hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-all duration-200"
                        >
                            Hủy
                        </button>
                    </div>

                </div>

            </div>

            <DataTable
                title="Danh sách sản phẩm"
                columns={columns}
                data={products}
                pagination
                highlightOnHover
                paginationPerPage={3} // Limit rows per page to 5
                paginationRowsPerPageOptions={[3, 5, 10, 20, 30, 50]} // Make 5 the only available option
                pointerOnHover
                noDataComponent="Chưa có sản phẩm nào"
            />

        </div>
    );
};

export default ProductForm;

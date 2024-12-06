import React, {useState, useEffect} from "react";
import ProductDetailService from "../../service/ProductDetailService";
import ProductService from "../../service/ProductService";
import ProductColorService from "../../service/ProductColorsService";
import ProductSizeService from "../../service/ProductSizesService";
import ProductWeightService from "../../service/ProductWeightsService";
import DataTable from "react-data-table-component";
import {MdEdit, MdLoop, MdAdd} from "react-icons/md";
import Swal from "sweetalert2";

const ProductDetailManager = () => {
    const [productDetails, setProductDetails] = useState([]);
    const [products, setProducts] = useState([]);
    const [colors, setColors] = useState([]);
    const [weightsList, setWeights] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [formData, setFormData] = useState({
        productId: "",
        quantity: 0,
        price: 0,
        productColorId: "",
        productSizeId: "",
        productWeightId: "",
        status: true,
    });
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadProductDetails();
        loadProducts();
        loadColors();
        loadSizes();
        loadWeights();
    }, []);

    const loadProductDetails = async () => {
        setLoading(true);
        try {
            const response = await ProductDetailService.getAllProductDetails();
            setProductDetails(response);
        } catch (error) {
            console.error("Error loading product details", error);
            Swal.fire("Lỗi", "Không thể tải thông tin chi tiết sản phẩm.", "error");
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await ProductService.getAllProducts();
            setProducts(response.data);
        } catch (error) {
            console.error("Error loading products", error);
        }
    };

    const loadColors = async () => {
        try {
            const response = await ProductColorService.getAllProductColors();
            setColors(response.filter((color) => color.status));
        } catch (error) {
            console.error("Error loading colors", error);
        }
    };

    const loadSizes = async () => {
        try {
            const response = await ProductSizeService.getAllProductSizes();
            setSizes(response.filter((size) => size.status));
        } catch (error) {
            console.error("Error loading sizes", error);
        }
    };

    const loadWeights = async () => {
        try {
            const response = await ProductWeightService.getAllProductWeights();
            setWeights(response.filter((weight) => weight.status));
        } catch (error) {
            console.error("Error loading weights", error);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleStatusChange = (e) => {
        setFormData({...formData, status: e.target.checked});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editMode) {
                await ProductDetailService.updateProductDetail(editId, {
                    product: {productId: formData.productId},
                    quantity: formData.quantity,
                    price: formData.price,
                    productColor: {productColorId: formData.productColorId},
                    productSize: {productSizeId: formData.productSizeId},
                    productWeight: {productWeightId: formData.productWeightId},
                    status: formData.status,
                });
                Swal.fire("Thành công", "Sản phẩm đã được cập nhật!", "success");
                setEditMode(false);
            } else {
                await ProductDetailService.createProductDetail({
                    product: {productId: formData.productId},
                    quantity: formData.quantity,
                    price: formData.price,
                    productColor: {productColorId: formData.productColorId},
                    productSize: {productSizeId: formData.productSizeId},
                    productWeight: {productWeightId: formData.productWeightId},
                    status: formData.status,
                });
                Swal.fire("Thành công", "Sản phẩm đã được thêm mới!", "success");
            }
            setFormData({
                productId: "",
                quantity: 0,
                price: 0,
                productColorId: "",
                productSizeId: "",
                productWeightId: "",
                status: true,
            });
            loadProductDetails();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving product detail", error);
            Swal.fire("Lỗi", "Có lỗi khi lưu thông tin chi tiết sản phẩm.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (detail) => {
        setFormData({
            productId: detail.product?.productId || "",
            quantity: detail.quantity || 0,
            price: detail.price || 0,
            productColorId: detail.productColor?.productColorId || "",
            productSizeId: detail.productSize?.productSizeId || "",
            productWeightId: detail.productWeight?.productWeightId || "",
            status: detail.status || true,
        });
        setEditId(detail.productDetailId);
        setEditMode(true);
        setModalOpen(true);
    };

    const handleCancel = () => {
        setFormData({
            productId: "",
            quantity: 0,
            price: 0,
            productColorId: "",
            productSizeId: "",
            productWeightId: "",
            status: true,
        });
        setEditMode(false);
        setEditId(null);
        setModalOpen(false);
    };

    const handleToggleStatus = async (productDetailId, currentStatus) => {
        try {
            const updatedProductDetail = {status: !currentStatus}; // Đảo trạng thái
            await ProductDetailService.updateProductDetail(productDetailId, updatedProductDetail);
            Swal.fire("Thành công", "Trạng thái sản phẩm đã được cập nhật!", "success");
            loadProductDetails(); // Tải lại danh sách sản phẩm
        } catch (error) {
            console.error("Error toggling status:", error);
            Swal.fire("Lỗi", "Không thể cập nhật trạng thái sản phẩm.", "error");
        }
    };

    const columns = [
        {name: "Sản phẩm", selector: (row) => row.product?.productName, sortable: true, grow: 3},
        {name: "Màu sắc", selector: (row) => row.productColor?.color, sortable: true, grow: 0.2, center: true},
        {name: "Size", selector: (row) => row.productSize?.productSize, sortable: true, grow: 0.2, center: true},
        {
            name: "Trọng lượng",
            selector: (row) => row.productWeight?.weightValue,
            sortable: true,
            grow: 0.9,
            center: true
        },
        {name: "Số lượng", selector: (row) => row.quantity, sortable: true, grow: 0.2, center: true},
        {name: "Giá", selector: (row) => row.price, sortable: true, grow: 0.2, center: true},
        {
            name: "Trạng thái",
            selector: (row) => (row.status ? "Hoạt động" : "Không hoạt động"),
            cell: (row) => (
                <div className="flex items-center justify-center">
                    <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                            row.status ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}
                    >
                {row.status ? "Hoạt động" : "Không hoạt động"}
            </span>
                    <button
                        onClick={() => handleToggleStatus(row.productDetailId, row.status)}
                        className="ml-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                        title="Chuyển đổi trạng thái"
                    >
                        <MdLoop size={20} className="text-blue-500 hover:text-blue-700 transition-transform transform hover:rotate-180" />
                    </button>
                </div>
            ),
            sortable: true,
            grow: 2,
            center: true,
        },
        {
            name: "Hành động",
            cell: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} title="Edit">
                        <MdEdit size={18} className="text-blue-600 hover:text-blue-800"/>
                    </button>
                </div>
            ), center: true
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý chi tiết sản phẩm</h1>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-1/3"
                />
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                    <MdAdd className="mr-2"/>
                    Thêm sản phẩm
                </button>
            </div>
            <DataTable
                columns={columns}
                data={productDetails.filter((detail) =>
                    detail.product?.productName.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                pagination
                highlightOnHover
                className="border rounded-lg"
            />
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg w-1/2">
                        <h2 className="text-xl font-bold mb-4">{editMode ? "Sửa chi tiết sản phẩm" : "Thêm chi tiết sản phẩm"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-2">Sản phẩm</label>
                                <select
                                    name="productId"
                                    value={formData.productId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                >
                                    <option value="">Chọn sản phẩm</option>
                                    {products.map((product) => (
                                        <option key={product.productId} value={product.productId}>
                                            {product.productName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Số lượng</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Giá</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Màu sắc</label>
                                <select
                                    name="productColorId"
                                    value={formData.productColorId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                >
                                    <option value="">Chọn màu sắc</option>
                                    {colors.map((color) => (
                                        <option key={color.productColorId} value={color.productColorId}>
                                            {color.color}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Size</label>
                                <select
                                    name="productSizeId"
                                    value={formData.productSizeId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                >
                                    <option value="">Chọn size</option>
                                    {sizes.map((size) => (
                                        <option key={size.productSizeId} value={size.productSizeId}>
                                            {size.productSize}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Trọng lượng</label>
                                <select
                                    name="productWeightId"
                                    value={formData.productWeightId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                >
                                    <option value="">Chọn trọng lượng</option>
                                    {weightsList.map((weight) => (
                                        <option key={weight.productWeightId} value={weight.productWeightId}>
                                            {weight.weightValue}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={formData.status}
                                    onChange={handleStatusChange}
                                    className="mr-2"
                                />
                                <label>Trạng thái (Active)</label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    {editMode ? "Lưu thay đổi" : "Thêm mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailManager;
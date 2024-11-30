import React, { useState, useEffect } from "react";
import ProductItem from "../product/ProductItem";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../header/Header";
import ProductService from "../../service/ProductService";
import { Link } from "react-router-dom";
import FavouriteService from "../../service/FavouriteService";
import Footer from "../footer/Footer";
import axios from 'axios';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [userId, setUserId] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [brands, setBrands] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [categories, setCategories] = useState([]); // Danh sách danh mục
    const [selectedCategories, setSelectedCategories] = useState('Tất cả'); // Danh mục được chọn, mặc định là 'Tất cả'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // Số sản phẩm mỗi trang

    // Tính toán sản phẩm hiển thị
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Fetch user ID and products
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }
    }, []);

    //Lấy giá và sản pẩm
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ProductService.getAllProducts();
                console.log('Product response:', response.data);  // Log dữ liệu sản phẩm

                const response2 = await axios.get('http://localhost:8080/api/product-details');
                console.log('Product details response:', response2.data);  // Log dữ liệu chi tiết sản phẩm

                if (!Array.isArray(response.data) || response.data.length === 0) {
                    console.error("No products found");
                    return;
                }

                if (!Array.isArray(response2.data) || response2.data.length === 0) {
                    console.error("No product details found");
                    return;
                }

                const productDetails = response2.data.map((productDetail) => ({
                    productDetailId: productDetail.productDetailId,
                    productId: productDetail.product.productId,  // Đảm bảo lấy đúng productId
                    price: productDetail.price,
                    color: productDetail.productColor?.color || 'Không có màu',
                    weight: productDetail.productWeight?.weightValue || 'Không có trọng lượng',
                    size: productDetail.productSize?.productSize || 'Không có kích cỡ',
                }));

                console.log('Mapped product details:', productDetails);  // Log chi tiết sau khi ánh xạ

                // Kết hợp sản phẩm và chi tiết sản phẩm
                const formattedProducts = response.data.map((product) => {
                    const detail = productDetails.find(detail => detail.productId === product.productId);

                    if (!detail) {
                        console.error(`No details found for product ID: ${product.productId}`);
                    }

                    return {
                        id: product.productId,
                        name: product.productName,
                        quantity: product.productQuantity,
                        image: product.imageUrl || 'default_image_url.jpg',
                        rating: product.rating || 0,
                        price: detail ? detail.price : 0,
                        brand: product.brand?.brandName || "Khác",
                        category: product.category?.categogyName || "Khác",
                    };
                });

                console.log('Formatted products:', formattedProducts);  // Log các sản phẩm đã định dạng

                setProducts(formattedProducts.reverse());
                setFilteredProducts(formattedProducts.reverse());
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        const fetchFavorites = async () => {
            if (!userId) return;
            try {
                const response = await FavouriteService.getFavouritesByUser(userId);
                const likedProductIds = response.filter((fav) => fav.liked).map((fav) => fav.product.productId);
                setFavorites(likedProductIds);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        fetchProducts();
        fetchFavorites();
    }, [userId]);

    // Lọc giá
    const applyFilters = () => {
        const filtered = products.filter(
            (product) =>
                product.price >= priceRange[0] &&
                product.price <= priceRange[1] &&
                (selectedBrand === "" || product.brand === selectedBrand) &&
                (selectedCategory === "" || product.category === selectedCategory)
        );
        setFilteredProducts(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [priceRange, selectedBrand, selectedCategory]);

    // Apply price filter
    useEffect(() => {
        const filtered = products.filter((product) =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );
        setFilteredProducts(filtered);
    }, [priceRange, products]);

    // Xử lý sự kiện thay đổi khoảng giá
    const handlePriceRangeChange = (range) => {
        setSelectedPriceRange(range); // Cập nhật selectedPriceRange

        // Lọc các sản phẩm dựa trên khoảng giá
        if (range === 'all') {
            setFilteredProducts(products); // Hiển thị tất cả sản phẩm nếu chọn "Tất cả"
        } else {
            let minPrice = 0;
            let maxPrice = 0;

            switch (range) {
                case 'under100k':
                    maxPrice = 100000;
                    break;
                case '100k-200k':
                    minPrice = 100000;
                    maxPrice = 200000;
                    break;
                case '200k-300k':
                    minPrice = 200000;
                    maxPrice = 300000;
                    break;
                case '300k-500k':
                    minPrice = 300000;
                    maxPrice = 500000;
                    break;
                case '500k-1M':
                    minPrice = 500000;
                    maxPrice = 1000000;
                    break;
                default:
                    break;
            }

            setFilteredProducts(products.filter(product =>
                product.price >= minPrice && product.price <= maxPrice
            ));
        }
    };

    // Muc yeu thich
    const toggleFavorite = async (productId) => {
        if (!userId) {
            console.error("User ID is not available.");
            return;
        }

        const isFavorite = favorites.includes(productId);
        const updatedFavorites = isFavorite
            ? favorites.filter((id) => id !== productId)
            : [...favorites, productId];

        setFavorites(updatedFavorites);

        try {
            const likeDate = new Date().toISOString();
            if (isFavorite) {
                await FavouriteService.removeFavouriteByUserAndProduct(userId, productId);
            } else {
                await FavouriteService.addFavourite({
                    user: { userId },
                    product: { productId },
                    likeDate,
                    liked: true,
                });
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setFavorites(favorites);
        }
    };

    // Lấy dữ liệu các thương hiệu từ API
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/brands');
                setBrands(response.data); // Cập nhật danh sách thương hiệu
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        fetchBrands(); // Gọi hàm lấy dữ liệu khi component mount
    }, []); // Chạy khi component được mount

    // Xử lý sự kiện thay đổi thương hiệu
    const handleBrandChange = (event) => {
        const selected = event.target.value;
        setSelectedBrand(event.target.value); // Cập nhật selectedBrand

        // Nếu chọn "Tất cả", reset lại bộ lọc
        if (selected === 'Tất cả') {
            setSelectedBrand(''); // Quay lại mặc định, không chọn thương hiệu nào
        }
    };

    // Gọi API để lấy danh mục sản phẩm
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/product-categories');
                setCategories(response.data); // Cập nhật danh sách danh mục
                console.log('Categories:', response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories(); // Gọi hàm lấy dữ liệu khi component mount
    }, []); // Chạy khi component được mount

    // Xử lý sự kiện chọn danh mục
    const handleCategories = (event) => {
        const selected = event.target.value;
        // Nếu chọn "Tất cả", reset lại bộ lọc
        if (selected === 'Tất cả') {
            setSelectedCategories('Tất cả'); // Chọn lại 'Tất cả'
        } else {
            setSelectedCategories(selected); // Cập nhật danh mục được chọn
        }
        console.log(selected);
    };

    return (
        <>
            <Header />
            <div className="flex flex-wrap mx-32">
                {/* Sidebar Filters */}
                <div className="w-full md:w-1/4 p-4">
                    {/* Categories */}
                    <div className="mb-8">
                        <div
                            className="bg-[#00b7c0] text-white ml-[3px] px-4 py-2 font-bold text-center w-[140px]"
                            style={{transform: "skewX(-10deg)"}}
                        >
                            <span style={{transform: "skewX(10deg)"}}>DANH MỤC</span>
                        </div>
                        <div className="flex-grow border-t border-[#00b7c0] mb-2 "></div>
                        <ul className="border-2 border-[#00b7c0] rounded-md p-4 space-y-2">
                            <li key="all" className="flex items-center custom-radio">
                                <input
                                    type="radio"
                                    name="category"
                                    value="Tất cả"
                                    checked={selectedCategories === 'Tất cả'} // Kiểm tra nếu lựa chọn là 'Tất cả'
                                    onChange={handleCategories} // Gọi hàm xử lý khi thay đổi
                                    className="mr-2"
                                />
                                Tất cả {/* Tùy chọn để quay lại mặc định */}
                            </li>
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <li key={category.productCategogyId} className="flex items-center custom-radio">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category.categogyName} // Dùng tên danh mục làm giá trị
                                            checked={selectedCategories === category.categogyName} // So sánh với selectedCategories
                                            onChange={handleCategories} // Gọi hàm xử lý khi chọn một danh mục
                                            className="mr-2"
                                        />
                                        {category.categogyName} {/* Hiển thị tên danh mục */}
                                    </li>
                                ))
                            ) : (
                                <li>Đang tải danh mục...</li>
                            )}
                        </ul>
                    </div>
                    {/* Brand Filter */}
                    <div className="mb-8">
                        <div
                            className="bg-[#00b7c0] text-white ml-[3px] px-4 py-2 font-bold w-[140px] text-center"
                            style={{transform: "skewX(-10deg)"}}
                        >
                            <span style={{transform: "skewX(10deg)"}}>THƯƠNG HIỆU</span>
                        </div>
                        <div className="flex-grow border-t border-[#00b7c0]  mb-2 w-full"></div>
                        <ul className="border-2 border-[#00b7c0] rounded-md p-4 space-y-2">
                            <li key="all" className="flex items-center custom-radio">
                                <input
                                    type="radio"
                                    name="brand"
                                    value="Tất cả"
                                    onChange={handleBrandChange}
                                    className="mr-2"
                                />
                                Tất cả {/* Tùy chọn để quay lại mặc định */}
                            </li>
                            {brands.length > 0 ? (
                                brands.map((brand) => (
                                    <li key={brand.brandId} className="flex items-center custom-radio">
                                        <input
                                            type="radio"
                                            name="brand"
                                            value={brand.brandName}
                                            checked={selectedBrand === brand.brandName}
                                            onChange={handleBrandChange}
                                            className="mr-2"
                                        />
                                        {brand.brandName} {/* Hiển thị tên thương hiệu */}
                                    </li>
                                ))
                            ) : (
                                <li>Đang tải thương hiệu...</li>
                            )}
                        </ul>
                    </div>
                    {/* Price Range Filter */}
                    <div className="mb-8">
                        <div
                            className="bg-[#00b7c0] text-white px-4 py-2 ml-[3px] font-bold w-[140px] text-center"
                            style={{ transform: "skewX(-10deg)" }}
                        >
                            <span style={{ transform: "skewX(10deg)" }}>KHOẢNG GIÁ</span>
                        </div>
                        <div className="flex-grow border-t border-[#00b7c0] mb-2 w-full"></div>
                        <ul className="border-2 border-[#00b7c0] rounded-md p-4 space-y-2">
                            {/* Tùy chọn "Tất cả" */}
                            <li key="allPriceRange" className="flex items-center custom-radio">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    value="all"
                                    checked={selectedPriceRange === "all"}
                                    onChange={() => handlePriceRangeChange("all")}
                                    className="mr-2"
                                />
                                Tất cả {/* Tùy chọn để reset bộ lọc */}
                            </li>

                            {/* Các khoảng giá khác */}
                            {["under100k", "100k-200k", "200k-300k", "300k-500k", "500k-1M"].map((range) => (
                                <li key={range} className="flex items-center custom-radio">
                                    <input
                                        type="radio"
                                        name="priceRange"
                                        value={range}
                                        onChange={() => handlePriceRangeChange(range)}
                                        className="mr-2"
                                    />
                                    {range === "under100k" ? "Giá dưới 100.000đ" :
                                        range === "100k-200k" ? "100.000đ - 200.000đ" :
                                            range === "200k-300k" ? "200.000đ - 300.000đ" :
                                                range === "300k-500k" ? "300.000đ - 500.000đ" :
                                                    "500.000đ - 1.000.000đ"
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Product List */}
                <div className="w-full md:w-3/4 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                        {currentProducts.map((product) => (
                            <div key={product.id} className="relative">
                                <Link to={`/ProductDetail/by-product/${product.id}`}>
                                    <ProductItem
                                        name={product.name}
                                        price={`${product.price.toLocaleString()} VND`}
                                        image={product.image}
                                        rating={product.rating}
                                        productId={product.id}
                                        toggleFavorite={toggleFavorite}
                                        isFavorite={favorites.includes(product.id)}
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>


                    {/* Load More / Show Less */}
                    <div className="flex justify-end mt-8 space-x-2">
                        {totalPages > 1 && (
                            <>
                                {/* Nút Trang Trước */}
                                {currentPage > 1 && (
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-400 text-black"
                                    >
                                        Trước
                                    </button>
                                )}

                                {/* Số Trang */}
                                {Array.from({length: totalPages}, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1 rounded-md ${
                                            currentPage === pageNumber ? "bg-[#00b7c0] text-white" : "bg-gray-300 text-black"
                                        } hover:bg-[#008a8f]`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                {/* Nút Trang Sau */}
                                {currentPage < totalPages && (
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-400 text-black"
                                    >
                                        Tiếp
                                    </button>
                                )}
                            </>
                        )}
                    </div>


                </div>
            </div>
            <Footer></Footer>
        </>

    );
}

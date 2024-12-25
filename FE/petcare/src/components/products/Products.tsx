import React, {useState, useEffect} from "react";
import ProductItem from "../product/ProductItem";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../header/Header";
import ProductService from "../../service/ProductService";
import {Link} from "react-router-dom";
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

    // Tính toán sản phẩm hiện tại và tổng số trang
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({top: 0, behavior: "smooth"});
    };




    // Lấy userId từ localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }
    }, []);

    // Lấy dữ liệu sản phẩm từ API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ProductService.getAllProducts();
                const response2 = await axios.get('http://localhost:8080/api/product-details');

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
                    productId: productDetail.product.productId, // Đảm bảo lấy đúng productId
                    price: productDetail.price,
                    color: productDetail.productColor?.color || 'Không có màu',
                    weight: productDetail.productWeight?.weightValue || 'Không có trọng lượng',
                    size: productDetail.productSize?.productSize || 'Không có kích cỡ',
                }));

                const activeProducts = response.data.filter(product => product.status === true);

                const formattedProducts = activeProducts.map((product) => {
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

        const fetchData = () => {
            fetchProducts();
            fetchFavorites();
        };

        fetchData();

        // Cleanup logic (nếu cần)
        return () => {};
    }, [userId]);




    // Lọc sản phẩm theo danh mục, thương hiệu và giá
    const applyFilters = () => {
        let filtered = products;

        // Lọc theo danh mục
        if (selectedCategories !== "Tất cả") {
            filtered = filtered.filter(product => product.category === selectedCategories);
        }

        // Lọc theo thương hiệu
        if (selectedBrand !== "") {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        // Lọc theo khoảng giá
        filtered = filtered.filter(
            product => product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        setFilteredProducts(filtered);
    };

    // Áp dụng bộ lọc khi có thay đổi
    useEffect(() => {
        applyFilters();
    }, [selectedCategories, selectedBrand, priceRange, products]);

    // Xử lý thay đổi khoảng giá
    const handlePriceRangeChange = (range) => {
        let minPrice = 0;
        let maxPrice = Infinity;

        switch (range) {
            case "under100k":
                maxPrice = 100000;
                break;
            case "100k-200k":
                minPrice = 100000;
                maxPrice = 200000;
                break;
            case "200k-300k":
                minPrice = 200000;
                maxPrice = 300000;
                break;
            case "300k-500k":
                minPrice = 300000;
                maxPrice = 500000;
                break;
            case "500k-1M":
                minPrice = 500000;
                maxPrice = 1000000;
                break;
            case "all": // Tất cả giá
                maxPrice = Infinity;
                break;
            default:
                break;
        }

        setPriceRange([minPrice, maxPrice]);
        setSelectedPriceRange(range); // Cập nhật khoảng giá được chọn
    };

    // Mục yêu thích
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
                    user: {userId},
                    product: {productId},
                    likeDate,
                    liked: true,
                });
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setFavorites(favorites);
        }
    };

    // Gọi API để lấy thương hiệu sản phẩm
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

    // Xử lý sự kiện chọn thương hiệu
    const handleBrandChange = (event) => {
        const selected = event.target.value;
        setSelectedBrand(selected === "Tất cả" ? "" : selected);
    };

    // Gọi API để lấy danh mục sản phẩm
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/product-categories');
                setCategories(response.data); // Cập nhật danh sách danh mục
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories(); // Gọi hàm lấy dữ liệu khi component mount
    }, []); // Chạy khi component được mount

    // Xử lý sự kiện chọn danh mục
    const handleCategories = (event) => {
        const selected = event.target.value;
        setSelectedCategories(selected === "Tất cả" ? "Tất cả" : selected);
    };

    return (
        <>
            <Header/>
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
                            style={{transform: "skewX(-10deg)"}}
                        >
                            <span style={{transform: "skewX(10deg)"}}>KHOẢNG GIÁ</span>
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
                    <div className="flex justify-center mt-8">
                        <button
                            className={`px-4 py-2 mx-1 rounded ${
                                currentPage === 1
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-[#00b7c0] text-white hover:bg-[#008a8f]"
                            }`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                        {Array.from({length: totalPages}, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                className={`px-4 py-2 mx-1 rounded ${
                                    currentPage === page
                                        ? "bg-[#00b7c0] text-white"
                                        : "bg-gray-300 text-black hover:bg-[#008a8f]"
                                }`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className={`px-4 py-2 mx-1 rounded ${
                                currentPage === totalPages
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-[#00b7c0] text-white hover:bg-[#008a8f]"
                            }`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>


                </div>
            </div>
            <Footer></Footer>
        </>

    );
}

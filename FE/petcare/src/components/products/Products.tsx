import React, { useState, useEffect } from "react";
import ProductItem from "../product/ProductItem";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../header/Header";
import ProductService from "../../service/ProductService";
import { Link } from "react-router-dom";
import FavouriteService from "../../service/FavouriteService";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState(12);
    const [userId, setUserId] = useState(null);

    // Filter states
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Fetch user ID and products
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ProductService.getAllProducts();
                const formattedProducts = response.data.map((product) => ({
                    id: product.productId,
                    name: product.productName,
                    quantity: product.productQuantity,
                    image: product.imageUrl || 'default_image_url.jpg',
                    rating: product.rating || 0,
                    price: Math.floor(Math.random() * (1000000 - 100000) + 100000),
                    brand: product.brand?.brandName || "Khác",
                    category: product.category?.categogyName || "Khác",
                }));
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

    // Apply filters
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

    const handleLoadMore = () => {
        setVisibleProducts((prev) => prev + 12);
    };

    const handleShowLess = () => {
        setVisibleProducts((prev) => Math.max(prev - 12, 12));
    };



    // Sidebar states and handlers
    const [showDogShop, setShowDogShop] = useState(false);
    const [showCatShop, setShowCatShop] = useState(false);

    const handleDogShopClick = () => {
        setShowDogShop((prev) => !prev);
        setSelectedCategory((prev) => (prev === "dog" ? null : "dog"));
    };

    const handleCatShopClick = () => {
        setShowCatShop((prev) => !prev);
        setSelectedCategory((prev) => (prev === "cat" ? null : "cat"));
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
                            <li
                                className={`cursor-pointer hover:text-[#00b7c0] transition flex justify-between items-center ${selectedCategory === "dog" ? "text-[#00b7c0]" : ""
                                }`}
                                onClick={handleDogShopClick}
                            >
                                SHOP CHO CÚN
                                <i className={`fa ${showDogShop ? "fa-angle-up" : "fa-angle-down"}`}></i>
                            </li>
                            {showDogShop && (
                                <ul className="pl-4 space-y-4">
                                    {[
                                        "Thức ăn & pate",
                                        "Bát ăn",
                                        "Vòng cổ dây dắt",
                                        "Thuốc và dinh dưỡng",
                                        "Sữa tắm & dụng cụ vệ sinh",
                                        "Chuồng, nệm và túi vận chuyển",
                                        "Đồ chơi thú cưng",
                                    ].map((item) => (
                                        <li key={item} className="cursor-pointer hover:text-[#00b7c0] transition">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <li
                                className={`cursor-pointer hover:text-[#00b7c0] transition flex justify-between items-center ${selectedCategory === "cat" ? "text-[#00b7c0]" : ""
                                }`}
                                onClick={handleCatShopClick}
                            >
                                SHOP CHO MÈO
                                <i className={`fa ${showCatShop ? "fa-angle-up" : "fa-angle-down"}`}></i>
                            </li>
                            {showCatShop && (
                                <ul className="pl-4 space-y-4">
                                    {[
                                        "Thức ăn & pate",
                                        "Bát ăn",
                                        "Vòng cổ dây dắt",
                                        "Thuốc và dinh dưỡng",
                                        "Sữa tắm & dụng cụ vệ sinh",
                                        "Chuồng, nệm và túi vận chuyển",
                                        "Đồ chơi thú cưng",
                                    ].map((item) => (
                                        <li key={item}
                                            className="cursor-pointer hover:text-[#00b7c0] transition space-y-4">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <li className="cursor-pointer hover:text-[#00b7c0] transition">KHUYẾN MÃI</li>
                            <li className="cursor-pointer hover:text-[#00b7c0] transition">TIN TỨC</li>
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
                            {["Khác", "ROYAL CANIN"].map((brand) => (
                                <li key={brand} className="flex items-center custom-radio">
                                    <input type="radio" name="brand" className="mr-2"/> {brand}
                                </li>
                            ))}
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
                        <div className="flex-grow border-t border-[#00b7c0]  mb-2 w-full"></div>
                        <ul className="border-2 border-[#00b7c0] rounded-md p-4 space-y-2">
                            {[
                                "Giá dưới 100.000đ",
                                "100.000đ - 200.000đ",
                                "200.000đ - 300.000đ",
                                "300.000đ - 500.000đ",
                                "500.000đ - 1.000.000đ",
                            ].map((priceRange) => (
                                <li key={priceRange} className="flex items-center custom-radio">
                                    <input type="radio" name="price" className="mr-2"/> {priceRange}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Product List */}
                <div className="w-full md:w-3/4 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                        {filteredProducts.slice(0, visibleProducts).map((product) => (
                            <div key={product.id} className="relative">
                                <Link to={`/ProductDetail/by-product/${product.id}`}>
                                    <ProductItem
                                        name={product.name}
                                        quantity={`Số lượng: ${product.quantity}`}
                                        image={product.image}
                                        rating={product.rating}
                                        price={product.price}
                                    />
                                </Link>
                                <button
                                    onClick={() => toggleFavorite(product.id)}
                                    className="absolute top-2 right-2"
                                >
                                    {favorites.includes(product.id) ? (
                                        <FavoriteIcon className="text-red-500"/>
                                    ) : (
                                        <FavoriteBorderOutlinedIcon className="text-red-500"/>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Load More / Show Less */}
                    <div className="flex justify-center mt-8 space-x-4">
                        {visibleProducts < filteredProducts.length && (
                            <button
                                onClick={handleLoadMore}
                                className="bg-[#00b7c0] text-white px-6 py-2 rounded-md"
                            >
                                Hiện thêm sản phẩm
                            </button>
                        )}
                        {visibleProducts > 12 && (
                            <button
                                onClick={handleShowLess}
                                className="bg-gray-400 text-white px-6 py-2 rounded-md"
                            >
                                Ẩn bớt sản phẩm
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import ProductService from "../../service/ProductService";
import FavouriteService from "../../service/FavouriteService";
import { Link } from "react-router-dom";
import axios from "axios";

export default function CatProduct() {
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10; // Number of products per page

    useEffect(() => {
        const handleScroll = () => {
            const element = document.getElementById('animatedElement');
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Retrieve userId from localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        } else {
            console.error("User ID not found in localStorage");
        }
    }, []);

    // Function to fetch products
    const fetchProducts = async () => {
        try {
            const response = await ProductService.getAllProducts();
            const response2 = await axios.get('http://localhost:8080/api/product-details');

            if (!Array.isArray(response.data) || response.data.length === 0) {
                return;
            }

            if (!Array.isArray(response2.data) || response2.data.length === 0) {
                return;
            }

            const productDetails = response2.data.map((productDetail) => ({
                productDetailId: productDetail.productDetailId,
                productId: productDetail.product.productId,
                price: productDetail.price,
                color: productDetail.productColor?.color || 'Không có màu',
                weight: productDetail.productWeight?.weightValue || 'Không có trọng lượng',
                size: productDetail.productSize?.productSize || 'Không có kích cỡ',
            }));

            // Combine products and product details
            const formattedProducts = response.data.map((product) => {
                const detail = productDetails.find(detail => detail.productId === product.productId);

                const status = product.status === true ? "Còn hàng" : "Ẩn sản phẩm";

                return {
                    id: product.productId,
                    name: product.productName,
                    quantity: product.productQuantity,
                    image: product.imageUrl || 'default_image_url.jpg',
                    rating: product.rating || 0,
                    price: detail ? detail.price : 0,
                    brand: product.brand?.brandName || "Khác",
                    category: product.category?.categogyName || "Khác",
                    status: status,
                };
            }).filter(product => product !== null && product.status !== "Ẩn sản phẩm");

            setProducts(formattedProducts.reverse());
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Fetch favorite products
    const fetchFavorites = async () => {
        if (!userId) return;

        try {
            const response = await FavouriteService.getFavouritesByUser(userId);
            const likedProductIds = response
                .filter((fav) => fav.liked)
                .map((fav) => fav.product.productId);
            FavouriteService.saveFavoritesToLocalStorage(likedProductIds);
            setFavorites(likedProductIds);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProducts();
            fetchFavorites();
        }
    }, [userId]);

    // Handle pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        FavouriteService.saveFavoritesToLocalStorage(updatedFavorites);

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

    const totalPages = Math.ceil(products.length / productsPerPage);

    return (
        <div className="mx-32 mb-5">
            <div
                id="animatedElement"
                style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
                    transition: 'all 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
            >
                <h2 className="text-3xl py-4 font-semibold">Gợi ý sản phẩm</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {currentProducts.map((product) => (
                        <div key={product.id} className="relative">
                            <Link to={`/ProductDetail/by-product/${product.id}`}>
                                <ProductItem
                                    name={product.name}
                                    price={`${product.price.toLocaleString()} VND`}
                                    status={product.status}
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

                {/* Pagination Buttons */}
                <div className="flex justify-center space-x-4 mt-4">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

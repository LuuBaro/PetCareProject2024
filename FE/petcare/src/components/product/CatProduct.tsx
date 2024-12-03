import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ProductService from "../../service/ProductService";
import FavouriteService from "../../service/FavouriteService";
import { Link } from "react-router-dom";
import axios from "axios";

export default function CatProduct() {
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
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

    // Hàm tạo giá ngẫu nhiên
    const getRandomPrice = () => Math.floor(Math.random() * (500000 - 50000 + 1)) + 50000;

    // Retrieve userId from localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        } else {
            console.error("User ID not found in localStorage");
        }
    }, []);

    // Fetch products and user favorites
    useEffect(() => {
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
                    productId: productDetail.product.productId,  // Đảm bảo lấy đúng productId
                    price: productDetail.price,
                    color: productDetail.productColor?.color || 'Không có màu',
                    weight: productDetail.productWeight?.weightValue || 'Không có trọng lượng',
                    size: productDetail.productSize?.productSize || 'Không có kích cỡ',
                }));


                // Kết hợp sản phẩm và chi tiết sản phẩm
                const formattedProducts = response.data.map((product) => {
                    const detail = productDetails.find(detail => detail.productId === product.productId);

                    if (!detail) {
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
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

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

        fetchProducts();
        fetchFavorites();
    }, [userId]);

    // Toggle favorite status
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

    return (
        <div className="mx-32 mb-5">
            <div
                id="animatedElement"
                style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(100px)', // Dịch chuyển mạnh hơn
                    transition: 'all 1s cubic-bezier(0.25, 0.8, 0.25, 1)', // Hiệu ứng mềm mại hơn
                }}

            >
            <h2 className="text-3xl py-4 font-semibold">Gợi ý sản phẩm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {products.map((product) => (
                    <div key={product.id} className="relative">
                        <Link to={`/ProductDetail/by-product/${product.id}`}>
                            <ProductItem
                                name={product.name}
                                price={`${product.price.toLocaleString()} VND`}
                                image={product.image}
                                rating={product.rating}
                                productId={product.id} // Truyền productId
                                toggleFavorite={toggleFavorite} // Truyền hàm toggleFavorite
                                isFavorite={favorites.includes(product.id)} // Truyền trạng thái yêu thích
                            />
                        </Link>
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
}

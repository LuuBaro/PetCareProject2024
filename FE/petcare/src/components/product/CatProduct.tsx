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
        <div className="mx-32">
            <h2 className="text-3xl py-4 font-semibold">Gợi ý sản phẩm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {products.map((product) => (
                    <div key={product.id} className="relative">
                        <Link to={`/ProductDetail/by-product/${product.id}`}>
                            <ProductItem
                                name={product.name}
                                quantity={`Số lượng: ${product.quantity}`}
                                image={product.image}
                                rating={product.rating}
                                price={`Giá: ${product.price.toLocaleString()} VND`} // Hiển thị giá với định dạng tiền tệ
                            />
                        </Link>
                        <a
                            onClick={() => toggleFavorite(product.id)}
                            className={`absolute top-2 right-2 ${
                                favorites.includes(product.id) ? "cursor-not-allowed" : ""
                            }`}
                            title={
                                favorites.includes(product.id)
                                    ? "Sản phẩm này đã có trong danh sách yêu thích của bạn"
                                    : "Thêm vào danh sách yêu thích"
                            }
                        >
                            {favorites.includes(product.id) ? (
                                <FavoriteIcon className="text-red-500" />
                            ) : (
                                <FavoriteBorderOutlinedIcon className="text-red-500" />
                            )}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

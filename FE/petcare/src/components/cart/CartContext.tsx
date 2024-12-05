import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Tạo Context và Provider
const CartContext = createContext<any>(null);

export const CartProvider: React.FC = ({ children }) => {
    const [cartCount, setCartCount] = useState<number>(0);
    const [cartItems, setCartItems] = useState<any[]>([]);  // Lưu trữ thông tin giỏ hàng

    // Lấy số lượng giỏ hàng khi ứng dụng tải
    const loadCart = async (userId: string) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/cart/user/${userId}`);
            const cartItems = response.data || [];
            setCartItems(cartItems);
            const totalQuantity = cartItems.reduce((acc: number, item: any) => acc + item.quantityItem, 0);
            setCartCount(totalQuantity);
        } catch (error) {
            console.error('Lỗi khi tải giỏ hàng:', error);
        }
    };

    // Cập nhật giỏ hàng khi có sự thay đổi
    const updateCartCount = (newCount: number) => {
        setCartCount(newCount);
    };

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = async (productId: string, quantity: number) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/cart/add`, {
                productId,
                quantity,
            });

            // Cập nhật lại giỏ hàng sau khi thêm sản phẩm
            const updatedCartItems = [...cartItems, response.data];
            setCartItems(updatedCartItems);

            // Cập nhật lại số lượng giỏ hàng
            const totalQuantity = updatedCartItems.reduce((acc: number, item: any) => acc + item.quantityItem, 0);
            setCartCount(totalQuantity);

        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, loadCart, updateCartCount, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
    
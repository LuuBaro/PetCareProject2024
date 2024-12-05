import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../header/Header";
import toastr from "toastr";
import { useCart } from "./CartContext"; // Import CartContext

interface Product {
  cartDetailId: number;
  productDetailId: number; // Thêm productDetailId
  productId: number;
  image: string;
  productName: string;
  price: number;
  quantity: number;
  color: string;  // Thêm màu sắc
  weight: number; // Thêm cân nặng
  size: string; // Thêm kích thước
}

const Cart: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState<number>(0);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login"); // Redirect to login if no userId
      return;
    }
    loadCart();
  }, [userId]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/cart/user/${userId}`);
      const cartItems = response.data || [];
      const productsData = cartItems.map((item: any) => ({
        cartDetailId: item.cartDetailId,
        productDetailId: item.productDetail.productDetailId,
        productId: item.productDetail.product.productId,
        image: item.productDetail.product.imageUrl,
        productName: item.productDetail.product.productName,
        price: item.productDetail.price,
        quantity: item.quantityItem,
        color: item.productDetail.productColor?.color || 'Màu không xác định',
        weight: item.productDetail.productWeight?.weightValue || 'Cân nặng không xác định',
        size: item.productDetail.productSize?.productSize || 'Kích thước không xác định',
      }));

      setProducts(productsData);

      // Cập nhật số lượng giỏ hàng
      const totalQuantity = cartItems.reduce((acc: number, item: any) => acc + item.quantityItem, 0);
      setCartCount(totalQuantity); // Cập nhật số lượng giỏ hàng
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };


  const handleRemoveItem = async (cartDetailId: number) => {
    try {
      await axios.delete(
          `http://localhost:8080/api/cart/remove/${cartDetailId}`,
          {
            data: { userId: userId },
          }
      );
      setProducts(
          products.filter((product) => product.cartDetailId !== cartDetailId)
      );

      // Cập nhật lại số lượng giỏ hàng
      const updatedCartCount = products.filter((product) => product.cartDetailId !== cartDetailId).reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(updatedCartCount); // Cập nhật lại số lượng trong CartContext
    } catch (error) {
      setError("Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng.");
      console.error("Error removing item:", error);
    }
  };

  const handleQuantityChange = async (cartDetailId: number, quantityItem: number) => {
    if (quantityItem < 1) return; // Không thực hiện nếu số lượng nhỏ hơn 1

    const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage

    if (!userId) {
      console.error("User is not logged in.");
      return;
    }

    // Tìm sản phẩm tương ứng trong giỏ hàng
    const cartProduct = products.find(product => product.cartDetailId === cartDetailId);
    const productDetailId = cartProduct ? cartProduct.productDetailId : null; // Lấy productDetailId từ sản phẩm

    if (!productDetailId) {
      console.error("ProductDetailId is missing!");
      return;
    }

    try {
      const productDetailResponse = await axios.get(`http://localhost:8080/api/product-details/${productDetailId}`);
      const productDetail = productDetailResponse.data;
      const stockAvailable = productDetail ? productDetail.quantity : 0; // Lấy số lượng sản phẩm có sẵn từ ProductDetail

      if (quantityItem > stockAvailable) {
        toastr.error(`Số lượng không được vượt quá ${stockAvailable}.`);
        return;
      }

      const response = await axios.put(
          `http://localhost:8080/api/cart/update`,
          {
            productDetailId: productDetailId,
            quantityItem: quantityItem, // Truyền số lượng mới
            userId: userId
          }
      );

      if (response.status === 200) {
        // Cập nhật trạng thái sản phẩm với số lượng mới
        setProducts(prevProducts =>
            prevProducts.map(product =>
                product.cartDetailId === cartDetailId
                    ? { ...product, quantity: quantityItem }
                    : product
            )
        );

        // Cập nhật lại số lượng giỏ hàng
        const updatedCartCount = products.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(updatedCartCount);
      }
    } catch (error) {
      console.error("Error updating quantity:", error.response ? error.response.data : error.message);
    }
  };



  // useEffect(() => {
  //   const updateCartItems = async () => {
  //     for (const product of products) {
  //       try {
  //         await axios.put(`http://localhost:8080/api/cart/update`, {
  //           productDetailId: productDetailId,
  //           quantityItem: quantityItem,
  //           userId: userId,
  //         });
  //       } catch (error) {
  //         console.error("Error updating quantity:", error);
  //       }
  //     }
  //   };

  //   updateCartItems();
  // }, [products, userId]); // Chạy effect mỗi khi products hoặc userId thay đổi

  const calculateTotal = () => {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCheckout = () => {
    if (products.length === 0) {
      setError(
        "Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm trước khi thanh toán."
      );
      return;
    }

    // Chuyển hướng sang trang thanh toán cùng với dữ liệu giỏ hàng
    navigate("/checkout", {
      state: {
        products, // Danh sách sản phẩm trong giỏ
        total: calculateTotal(), // Tổng số tiền
      },
    });
  };

  if (loading) return <div>Loading...</div>; // Thêm trạng thái tải

  return (
    <>
      <Header />
      <div className="p-6 mt-4 max-w-7xl mx-auto bg-gray-50 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Giỏ hàng của bạn</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {products.length === 0 ? (
          <div className="text-center">
            <img
              src="https://bizweb.dktcdn.net/100/373/627/themes/936292/assets/empty-cart.png?1719564212117"
              alt="Giỏ hàng trống"
              className="w-auto h-auto mx-auto mb-4"
            />
            <p className="text-gray-500">
              Không có sản phẩm nào trong giỏ hàng.{" "}
              <a
                href="/products"
                className="text-blue-500 font-bold underline hover:text-blue-700"
              >
                Quay lại cửa hàng để tiếp tục mua sắm.
              </a>
            </p>
          </div>
        ) : (
            <div className="space-y-4">
              <table className="min-w-full table-auto border-collapse border-2 border-[#F2BC27]">
                <thead>
                <tr className="border-b-2 border-[#F2BC27]">
                  <th className="px-6 py-4 text-left">Xóa</th>
                  <th className="px-6 py-4 text-left">Sản phẩm</th>
                  <th className="px-6 py-4 text-left">Màu sắc</th>
                  {/* Cột Màu sắc */}
                  <th className="px-6 py-4 text-left">Cân nặng (kg)</th>
                  {/* Cột Cân nặng */}
                  <th className="px-6 py-4 text-left">Giá</th>
                  <th className="px-6 py-4 text-left">Số lượng</th>
                  <th className="px-6 py-4 text-left">Kích thước</th>
                  {/* Thêm cột Kích thước */}
                  <th className="px-6 py-4 text-left">Thành tiền</th>
                </tr>
                </thead>
                <tbody>
                {products.map((product) => {
                  const totalPrice = product.price * product.quantity;
                  return (
                      <tr
                          key={product.cartDetailId}
                          className="border-b transition-opacity duration-300"
                      >
                        <td className="px-6 py-4">
                          <button
                              onClick={() => handleRemoveItem(product.cartDetailId)}
                              className="text-red-500 text-xl hover:text-red-700 transition duration-300 bg-white p-1 rounded-full"
                          >
                            &times;
                          </button>
                        </td>
                        <td className="px-6 py-4 flex items-center">
                          <img
                              src={product.image}
                              alt={product.productName}
                              className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                          {product.productName}
                        </td>
                        <td className="px-6 py-4">{product.color}</td>
                        {/* Hiển thị màu sắc */}
                        <td className="px-6 py-4">{product.weight} Kg</td>
                        {/* Hiển thị cân nặng */}
                        <td className="px-6 py-4">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4">
                          <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) =>
                                  handleQuantityChange(
                                      product.cartDetailId,
                                      parseInt(e.target.value)
                                  )
                              }
                              className="border border-gray-300 rounded-lg w-16 p-2 text-center"
                          />
                        </td>
                        <td className="px-6 py-4">{product.size}</td>
                        {/* Thêm cột Kích thước */}
                        <td className="px-6 py-4">{formatPrice(totalPrice)}</td>
                      </tr>
                  );
                })}
                </tbody>
              </table>

              <div className="mt-6 text-right">
                <h2 className="text-xl font-bold">
                  Tổng cộng: {formatPrice(calculateTotal())}
                </h2>
                <button
                    onClick={handleCheckout}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300 mt-4"
                >
                  Thanh toán
                </button>
              </div>
            </div>
        )}
      </div>
    </>
  );
};

export default Cart;

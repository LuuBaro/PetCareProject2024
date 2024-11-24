import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductDetailService from "../../service/ProductDetailService";
import ProductColorService from "../../service/ProductColorsService";
import ProductSizeService from "../../service/ProductSizesService";
import ProductWeightService from "../../service/ProductWeightsService";
import CartService from "../../service/CartDetailService";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import "../../css/ProductDetail.css";

toastr.options.timeOut = 2000;

const ProductDetail = () => {
  const { id: productId } = useParams();
  const [productDetails, setProductDetails] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [weights, setWeights] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [stockAvailable, setStockAvailable] = useState(0);
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await ProductDetailService.getAllProductDetailsByProductId(productId);
        console.log("Product details response:", response); // Kiểm tra toàn bộ response

        const colorsResponse = await ProductColorService.getAllProductColors();
        const sizesResponse = await ProductSizeService.getAllProductSizes();
        const weightsResponse = await ProductWeightService.getAllProductWeights();

        // Kiểm tra xem response có chứa bất kỳ phần tử nào hay không
        if (response && response.length > 0) {
          // Duyệt qua tất cả các phần tử trong response để lấy quantity
          const allQuantities = response.map((detail) => detail.quantity);
          console.log("All quantities:", allQuantities); // In ra tất cả các quantity

          // Lưu tất cả giá trị quantity vào state (nếu cần thiết)
          setStockAvailable(allQuantities);

          setProductDetails(response || []);
          setCurrentDetail(response[0]); // Giả sử response[0] có chứa stockAvailable
        } else {
          toastr.error("Không tìm thấy thông tin chi tiết sản phẩm.");
        }

        setColors(colorsResponse || []);
        setSizes(sizesResponse || []);
        setWeights(weightsResponse || []);
      } catch (error) {
        setError(error.message || "Error loading product details.");
        toastr.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);



  // Handle selection and update current detail
  const handleSelection = (type, value) => {
    if (type === "color") {
      setSelectedColor(value === selectedColor ? null : value); // Toggle selection
    } else if (type === "size") {
      setSelectedSize(value === selectedSize ? null : value); // Toggle selection
    } else if (type === "weight") {
      setSelectedWeight(value === selectedWeight ? null : value); // Toggle selection
    }
  };

  // Update current detail based on selected attributes
  useEffect(() => {
    const matchingDetail = productDetails.find(
        (detail) =>
            (!selectedColor || detail.productColor.color === selectedColor) &&
            (!selectedSize || detail.productSize.productSize === selectedSize) &&
            (!selectedWeight || detail.productWeight.weightValue === selectedWeight)
    );

    setCurrentDetail(matchingDetail || null);
  }, [selectedColor, selectedSize, selectedWeight, productDetails]);

  const getFilteredOptions = () => {
    const filteredDetails = productDetails.filter(
        (detail) =>
            (!selectedColor || detail.productColor.color === selectedColor) &&
            (!selectedSize || detail.productSize.productSize === selectedSize) &&
            (!selectedWeight || detail.productWeight.weightValue === selectedWeight)
    );

    const validColors = [...new Set(filteredDetails.map((detail) => detail.productColor.color))];
    const validSizes = [...new Set(filteredDetails.map((detail) => detail.productSize.productSize))];
    const validWeights = [...new Set(filteredDetails.map((detail) => detail.productWeight.weightValue))];

    return { validColors, validSizes, validWeights };
  };

  const { validColors, validSizes, validWeights } = getFilteredOptions();

  const updateQuantity = (action) => {
    setQuantity((prev) => (action === "increment" ? prev + 1 : Math.max(prev - 1, 1)));
  };

  // const getProductQuantityInCart = async (productDetailId) => {
  //   try {
  //     const cartItems = await CartService.getCartItems(localStorage.getItem("userId"));
  //     const item = cartItems.find((cartItem) => cartItem.productDetailId === productDetailId);
  //     return item ? item.quantity : 0; // Trả về số lượng hiện tại hoặc 0 nếu chưa có trong giỏ
  //   } catch (error) {
  //     console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
  //     return 0;
  //   }
  // };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    // Kiểm tra người dùng đã đăng nhập hay chưa
    if (!token) {
      toastr.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      window.location.href = "/login";
      return;
    }

    // Kiểm tra người dùng đã chọn đầy đủ các biến thể chưa
    if (!currentDetail) {
      toastr.error("Vui lòng chọn đầy đủ các biến thể sản phẩm.");
      return;
    }

    // Kiểm tra số lượng có hợp lệ không
    if (quantity <= 0) {
      toastr.error("Vui lòng chọn số lượng hợp lệ.");
      return;
    }

    try {
      // Lấy thông tin tồn kho từ biến thể được chọn
      const selectedStock = currentDetail?.quantity; // Lấy quantity từ currentDetail thay vì stockAvailable
      console.log("selectedStock:", selectedStock);

      // Kiểm tra xem stockAvailable có tồn tại không
      if (selectedStock === undefined) {
        toastr.error("Thông tin tồn kho không hợp lệ.");
        return;
      }

      console.log("Stock available in handleAddToCart:", selectedStock); // Log giá trị tồn kho

      // Gọi hàm addToCart với các tham số chi tiết hơn
      const cartDetail = await CartService.addToCart(
          currentDetail.productDetailId,         // productDetailId
          quantity,                              // Số lượng cần thêm
          localStorage.getItem("userId"),        // ID người dùng
          token,                                  // Token xác thực
          currentDetail.product.productName,     // Tên sản phẩm
          selectedStock,                          // Số lượng tồn kho
          selectedColor,                          // Màu sắc được chọn
          selectedSize,                           // Kích thước được chọn
          selectedWeight                          // Trọng lượng được chọn
      );

      // Nếu thành công, thông báo và cập nhật giỏ hàng
      // if (cartDetail) {
      //   toastr.success("Sản phẩm đã được thêm vào giỏ hàng!");
      // }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
      toastr.error("Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };







  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
      <>
        <Header />
        <div className="product-detail-container">
          <div className="product-card">
            {/* Image Section */}
            <div className="product-image-section">
              <img
                  src={currentDetail?.product?.imageUrl || "default_image.jpg"}
                  alt={currentDetail?.product?.productName || "Product"}
                  className="product-image"
              />
              <div className="image-thumbnails">
                <img src={currentDetail?.product?.imageUrl} alt="Thumbnail" />
              </div>
            </div>

            {/* Info Section */}
            <div className="product-info-section">
              <h1 className="product-title">{currentDetail?.product?.productName || "Product Name"}</h1>
              <p className="product-price">{currentDetail?.price ? `${currentDetail.price} ₫` : "Liên hệ"}</p>

              {/* Color Options */}
              <div className="product-options mb-3">
                <h3>Màu sắc:</h3>
                <div className="option-buttons">
                  {colors.map((color) => (
                      <button
                          key={color.id}
                          onClick={() => handleSelection("color", color.color)}
                          disabled={!validColors.includes(color.color)}
                          className={`option-button ${
                              selectedColor === color.color ? "active" : ""
                          } ${!validColors.includes(color.color) ? "disabled" : ""}`}
                      >
                        {color.color}
                      </button>
                  ))}
                </div>
              </div>

              {/* Size Options */}
              <div className="product-options mb-3">
                <h3>Kích thước:</h3>
                <div className="option-buttons">
                  {sizes.map((size) => (
                      <button
                          key={size.id}
                          onClick={() => handleSelection("size", size.productSize)}
                          disabled={!validSizes.includes(size.productSize)}
                          className={`option-button ${
                              selectedSize === size.productSize ? "active" : ""
                          } ${!validSizes.includes(size.productSize) ? "disabled" : ""}`}
                      >
                        {size.productSize}
                      </button>
                  ))}
                </div>
              </div>

              {/* Weight Options */}
              <div className="product-options">
                <h3>Trọng lượng:</h3>
                <div className="option-buttons">
                  {weights.map((weight) => (
                      <button
                          key={weight.id}
                          onClick={() => handleSelection("weight", weight.weightValue)}
                          disabled={!validWeights.includes(weight.weightValue)}
                          className={`option-button ${
                              selectedWeight === weight.weightValue ? "active" : ""
                          } ${!validWeights.includes(weight.weightValue) ? "disabled" : ""}`}
                      >
                        {weight.weightValue}
                      </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-selector">
                <h3 className="mb-4">Số lượng:</h3>
                <div className="quantity-buttons">
                  <button onClick={() => updateQuantity("decrement")}>-</button>
                  <input type="text" value={quantity} readOnly />
                  <button onClick={() => updateQuantity("increment")}>+</button>
                </div>
              </div>

              {/* Buttons */}
              <div className="action-buttons">
                <button className="buy-now-button">Mua ngay</button>
                <button className="add-to-cart-button" onClick={handleAddToCart}>
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
  );
};

export default ProductDetail;


import React, { useEffect, useState } from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
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
import ProductItem from "../product/ProductItem";
import FavouriteService from "../../service/FavouriteService";
import ProductService from "../../service/ProductService";
import axios from "axios";
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Số sản phẩm mỗi trang
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await ProductDetailService.getAllProductDetailsByProductId(productId);

        const colorsResponse = await ProductColorService.getAllProductColors();
        const sizesResponse = await ProductSizeService.getAllProductSizes();
        const weightsResponse = await ProductWeightService.getAllProductWeights();

        // Kiểm tra xem response có chứa bất kỳ phần tử nào hay không
        if (response && response.length > 0) {
          // Duyệt qua tất cả các phần tử trong response để lấy quantity
          const allQuantities = response.map((detail) => detail.quantity);

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
          productId: productDetail.product.productId,
          price: productDetail.price,
          color: productDetail.productColor?.color || 'Không có màu',
          weight: productDetail.productWeight?.weightValue || 'Không có trọng lượng',
          size: productDetail.productSize?.productSize || 'Không có kích cỡ',
        }));

        const formattedProducts = response.data.map((product) => {
          const detail = productDetails.find((detail) => detail.productId === product.productId);

          return {
            id: product.productId,
            name: product.productName,
            quantity: product.productQuantity,
            image: product.imageUrl || 'default_image_url.jpg',
            rating: product.rating || 0,
            price: detail ? detail.price : 0, // Chắc chắn giá tồn tại
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

    fetchProducts();
    fetchFavorites();
  }, [userId]);

  const randomizeArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!currentDetail?.product?.category?.productCategogyId) return;

      try {
        // Lấy sản phẩm cùng loại
        const response = await axios.get(
            `http://localhost:8080/api/products?categoryId=${currentDetail.product.category.productCategogyId}`
        );

        // Kiểm tra nếu không có sản phẩm cùng loại
        if (!Array.isArray(response.data) || response.data.length === 0) {
          console.error('No related products found.');
          setRelatedProducts([]); // Cập nhật state là mảng rỗng
          return;
        }

        // Lấy thông tin chi tiết sản phẩm (bao gồm giá)
        const response2 = await axios.get('http://localhost:8080/api/product-details');

        if (!Array.isArray(response2.data) || response2.data.length === 0) {
          console.error("No product details found");
          return;
        }

        const productDetails = response2.data.map((productDetail) => ({
          productId: productDetail.product.productId,
          price: productDetail.price,
        }));

        // Ghép thông tin chi tiết sản phẩm với sản phẩm cùng loại
        const relatedProductsWithDetails = response.data.map((product) => {
          const detail = productDetails.find((detail) => detail.productId === product.productId);
          return {
            ...product,
            price: detail ? detail.price : 0, // Nếu không tìm thấy, gán giá mặc định là 0
          };
        });

        // Random 4 sản phẩm
        const randomizedProducts = randomizeArray(relatedProductsWithDetails).slice(0, 4);

        setRelatedProducts(randomizedProducts);

      } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]); // Nếu có lỗi, cập nhật state là mảng rỗng
      }
    };

    fetchRelatedProducts(); // Gọi API khi currentDetail thay đổi
  }, [currentDetail]);

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

      // Kiểm tra xem stockAvailable có tồn tại không
      if (selectedStock === undefined) {
        toastr.error("Thông tin tồn kho không hợp lệ.");
        return;
      }

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

  const handleQuantityInput = (e) => {
    const input = parseInt(e.target.value, 10);
    if (isNaN(input) || input < 1) {
      setQuantity(1); // Giá trị tối thiểu
    } else {
      setQuantity(input);
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
      <>
        <Header/>
        {/* Background Section for Product Name */}
        <div
            className="product-name-bg w-full h-[280px] bg-cover bg-center flex flex-col justify-center items-center mb-3"
            style={{ backgroundImage: `url('https://theme.hstatic.net/200000521195/1000872898/14/bg_breadcrumb.jpg?v=236')` }} // Thêm URL của hình nền vào đây
        >
          {/* Product Name */}
          <h2 className="text-5xl text-white font-bold mb-2">
            {currentDetail?.product?.productName || "Tên sản phẩm"}
          </h2>

          {/* Link to Products Page */}
          <div className="text-lg font-bold">
            <a href="/products" className="text-white font-medium">
              <span>Sản phẩm</span> &nbsp;
            </a>
            <i className="fa fa-angle-right text-white"></i>
            <span className=" px-2 text-[#00b7c0]">
            {currentDetail?.product?.productName || "Tên sản phẩm"}
          </span>
          </div>
        </div>

        <div className="product-detail-container p-2 md:p-8 flex flex-wrap gap-6 bg-gray-50 rounded-lg ">
          {/* Image Section */}
          <div className="product-image-section w-full md:w-1/2 flex justify-center items-start flex-col">
            <div className="relative mb-4">
              <img
                  src={currentDetail?.product?.imageUrl || "default_image.jpg"}
                  alt={currentDetail?.product?.productName || "Product"}
                  className="w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div>

            {/* Section for Thumbnails */}
            {currentDetail?.product?.thumbnails?.length > 0 && (
                <div className="flex mt-4 gap-2 justify-center">
                  {currentDetail?.product?.thumbnails?.map((thumb, index) => (
                      <img
                          key={index}
                          src={thumb}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-16 h-16 object-cover border rounded-md cursor-pointer hover:scale-110 transition-transform"
                      />
                  ))}
                </div>
            )}

            {/* Additional Smaller Variants (Updated Size) */}
            <div className="flex mt-4 gap-2 justify-center">
              <img
                  src={currentDetail?.product?.imageUrl || "default_image.jpg"}
                  alt={`Variant 1`}
                  className="w-20 h-20 object-cover border rounded-md cursor-pointer hover:scale-110 transition-transform"
              />
              <img
                  src={currentDetail?.product?.imageUrl || "default_image.jpg"}
                  alt={`Variant 2`}
                  className="w-20 h-20 object-cover border rounded-md cursor-pointer hover:scale-110 transition-transform"
              />
              <img
                  src={currentDetail?.product?.imageUrl || "default_image.jpg"}
                  alt={`Variant 3`}
                  className="w-20 h-20 object-cover border rounded-md cursor-pointer hover:scale-110 transition-transform"
              />
            </div>
          </div>


          {/* Info Section */}
          <div
              className="product-info-section w-full md:w-1/2 bg-white rounded-lg p-6 shadow flex flex-col gap-6 h-full justify-between">
            {/* Product Name and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {currentDetail?.product?.productName || "Tên sản phẩm"}
              </h1>
              <p className="bg-[#00b7c0] text-white ml-[3px] px-4 py-2 font-bold text-center w-[140px]"
                 style={{transform: "skewX(-10deg)", fontSize: "1.5rem", fontWeight: "700"}}>
                {currentDetail?.price
                    ? `${currentDetail.price.toLocaleString()} ₫`
                    : "Liên hệ"}
              </p>


            </div>


            {/* Options */}
            <div className="options-section">
              {validColors.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 text-lg">Màu sắc</h3>
                    <div className="flex gap-2 mt-2">
                      {colors.map((color) =>
                          validColors.includes(color.color) ? (
                              <button
                                  key={color.id}
                                  onClick={() => handleSelection("color", color.color)}
                                  className={`py-3 px-3 rounded-md ${
                                      selectedColor === color.color
                                          ? "bg-[#00b7c0] text-white"
                                          : "bg-gray-200 text-gray-600"
                                  } hover:bg-[#008a8f] hover:text-white transition`}
                              >
                                {color.color}
                              </button>
                          ) : null
                      )}
                    </div>
                  </div>
              )}

              {validSizes.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 text-lg">Kích thước</h3>
                    <div className="flex gap-2 mt-2">
                      {sizes.map((size) =>
                          validSizes.includes(size.productSize) ? (
                              <button
                                  key={size.id}
                                  onClick={() => handleSelection("size", size.productSize)}
                                  className={`py-2 px-3 rounded-md ${
                                      selectedSize === size.productSize
                                          ? "bg-[#00b7c0] text-white"
                                          : "bg-gray-200 text-gray-600"
                                  } hover:bg-[#008a8f] hover:text-white transition`}
                              >
                                {size.productSize}
                              </button>
                          ) : null
                      )}
                    </div>
                  </div>
              )}

              {validWeights.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 text-lg">Trọng lượng</h3>
                    <div className="flex gap-2 mt-2">
                      {weights.map((weight) =>
                          validWeights.includes(weight.weightValue) ? (
                              <button
                                  key={weight.id}
                                  onClick={() => handleSelection("weight", weight.weightValue)}
                                  className={`py-2 px-3 rounded-md ${
                                      selectedWeight === weight.weightValue
                                          ? "bg-[#00b7c0] text-white"
                                          : "bg-gray-200 text-gray-600"
                                  } hover:bg-[#008a8f] hover:text-white transition`}
                              >
                                {weight.weightValue}
                              </button>
                          ) : null
                      )}
                    </div>
                  </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="font-medium text-gray-700 text-lg">Số lượng:</h3>
              <div className="flex items-center mt-2 overflow-hidden">
                {/* Giảm số lượng */}
                <button
                    onClick={() => updateQuantity("decrement")}
                    className="flex justify-center text-2xl text-white items-center w-10 h-8 bg-[#00b7c0] hover:bg-[#008a8f] rounded-l-md transition"
                >
                  -
                </button>

                {/* Input số lượng */}
                <input
                    value={quantity}
                    onChange={(e) => handleQuantityInput(e)}
                    min="1"
                    className="w-12 h-8 text-center bg-gray-200 border-0 text-xl font-semibold text-gray-800"
                />

                {/* Tăng số lượng */}
                <button
                    onClick={() => updateQuantity("increment")}
                    className="flex justify-center text-2xl text-white items-center w-10 h-8 bg-[#00b7c0] hover:bg-[#008a8f] rounded-r-md transition"
                >
                  +
                </button>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                  className="py-2 px-8  bg-[#f94f4f] text-white text-xl font-semibold rounded-md  hover:bg-[#d93e3e] transition transform hover:scale-105"
              >
                Mua ngay
              </button>
              <button
                  className="py-2 px-8 bg-[#00b7c0] text-white text-xl font-semibold rounded-md hover:bg-[#008a8f] transition transform hover:scale-105"
                  onClick={handleAddToCart}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
          {/* Product Description Section */}
          <div className="product-description w-full mt-8 bg-white rounded-lg p-6">
            <h3 className="text-2xl font-bold text-[#00b7c0] mb-4 text-center ">Mô tả</h3>
            <p className="text-gray-700 text-lg">{currentDetail?.product?.description || "Mô tả chi tiết sản phẩm sẽ được hiển thị ở đây."}</p>
          </div>

          {/* Related Products List */}
          <div className="w-full mt-8 bg-white rounded-lg p-6">
            <h3 className="text-2xl font-bold text-[#00b7c0] mb-4 text-center">
              Sản phẩm cùng loại
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
              {relatedProducts && relatedProducts.length > 0 ? (
                  relatedProducts.map((product) => (
                      <div key={product.productId} className="relative">
                        <Link to={`/ProductDetail/by-product/${product.productId}`}>
                          <ProductItem
                              name={product.productName || "Sản phẩm không rõ tên"}
                              price={`${
                                  product.price && !isNaN(product.price) && product.price !== 0
                                      ? Number(product.price).toLocaleString()
                                      : "Liên hệ"
                              } VND`}
                              image={product.imageUrl || "path/to/default-image.jpg"}
                              rating={product.rating || 0}
                              productId={product.productId}
                              toggleFavorite={toggleFavorite}
                              isFavorite={favorites.includes(product.productId)}
                          />
                        </Link>
                      </div>
                  ))
              ) : (
                  <p className="text-center text-gray-500">Không có sản phẩm liên quan.</p>
              )}
            </div>
          </div>


        </div>
        <Footer/>
      </>
  );
};

export default ProductDetail;


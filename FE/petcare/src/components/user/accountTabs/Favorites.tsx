import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick"; // Import thư viện slick

// Cấu hình cho Slick Carousel
const settings = {
    dots: true, // Hiển thị dot điều hướng
    infinite: true, // Lặp lại liên tục
    speed: 500, // Thời gian chuyển động
    slidesToShow: 3, // Số lượng sản phẩm hiển thị cùng lúc
    slidesToScroll: 1, // Số sản phẩm di chuyển mỗi lần
    autoplay: true, // Tự động chuyển động
    autoplaySpeed: 3000, // Thời gian giữa các lần chuyển động (3 giây)
    prevArrow: null, // Tạm thời ẩn các nút mũi tên mặc định
    nextArrow: null,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
            },
        },
    ],
};

function Favorites() {
    const [favourites, setFavourites] = useState([]);
    const userId = localStorage.getItem("userId");
    const sliderRef = React.createRef(); // Sử dụng ref để điều khiển slider

    useEffect(() => {
        axios
            .get(`/api/favourites/user/${userId}`)
            .then((response) => {
                setFavourites(response.data);
            })
            .catch((error) => {
                console.error("Có lỗi khi tải danh sách yêu thích:", error);
            });
    }, [userId]);

    // Hàm chuyển động qua trái
    const handlePrev = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPrev();
        }
    };

    // Hàm chuyển động qua phải
    const handleNext = () => {
        if (sliderRef.current) {
            sliderRef.current.slickNext();
        }
    };

    return (
        <div className="p-6 bg-gray-50  relative">
            <h2 className="text-2xl font-bold text-center text-[#00b7c0] mb-6">Sản Phẩm Yêu Thích</h2>
            {favourites.length === 0 ? (
                <p className="text-center text-xl text-gray-500">Không có sản phẩm yêu thích nào.</p>
            ) : (
                <>
                    <Slider {...settings} ref={sliderRef}>
                        {favourites.map((favourite) => (
                            <div
                                key={favourite.favouriteId}
                                className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl"
                            >
                                {/* Phần hiển thị chi tiết sản phẩm khi hover */}
                                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white p-6 space-y-3">
                                    <div className="text-center">
                                        <h4 className="text-xl font-semibold text-shadow">{favourite.product.productName}</h4>
                                        <p className="text-sm text-shadow">{favourite.product.description}</p>
                                        <p className="text-sm font-medium text-shadow"><strong>Category:</strong> {favourite.product.category.categogyName}</p>
                                        <p className="text-sm font-medium text-shadow"><strong>Brand:</strong> {favourite.product.brand.brandName}</p>
                                    </div>
                                </div>

                                <img
                                    src={favourite.product.imageUrl}
                                    alt={favourite.product.productName}
                                    className="w-full h-48 object-cover"
                                />

                                {/* Phần hiển thị thông tin cơ bản dưới hình ảnh */}
                                <div className="p-4">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{favourite.product.productName}</h3>
                                    <p className="text-sm text-gray-600 mb-2 truncate">{favourite.product.description}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>

                    {/* Nút trái */}
                    <button
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
                        onClick={handlePrev}
                    >
                        &#8249;
                    </button>

                    {/* Nút phải */}
                    <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
                        onClick={handleNext}
                    >
                        &#8250;
                    </button>
                    {/* Chữ chạy qua lại phía dưới */}
                    <div className="mt-4">
                        <marquee behavior="scroll" direction="left" className="text-xl font-semibold text-gray-800 mt-2">
                            Khám phá những sản phẩm yêu thích của bạn ngay hôm nay!
                        </marquee>
                    </div>
                </>
            )}
        </div>
    );
}

export default Favorites;

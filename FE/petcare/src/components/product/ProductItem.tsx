import React from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

export default function ProductItem({
                                        name,
                                        price,
                                        status,
                                        image,
                                        rating,
                                        isFavorite,
                                        toggleFavorite,
                                        productId,
                                    }) {
    return (
        <div className="flex flex-col justify-between bg-white rounded-md border border-gray-300 overflow-hidden">
            {/* Ảnh sản phẩm */}
            <img
                src={image}
                className="max-h-[150px] object-cover w-full"
                alt={name}
            />

            {/* Thông tin sản phẩm */}
            <div className="p-4 h-fit flex flex-col gap-2">
                <div>
                    {/* Tên sản phẩm */}
                    <span className="font-semibold text-base block w-full tracking-wide text-ellipsis whitespace-nowrap overflow-hidden">
            {name}
          </span>

                    {/* Đánh giá sản phẩm */}
                    <div className="text-yellow-500 select-none text-base">
                        {"★".repeat(rating) + "☆".repeat(5 - rating)}
                    </div>
                </div>

                {/* Giá và nút hành động */}
                <div className="flex items-center justify-between">
                    <div className="text-base font-medium">{price}</div>

                    {/* Nút yêu thích và giỏ hàng */}
                    <div className="flex items-center gap-3">
                        {/* Nút yêu thích */}
                        <button
                            onClick={(event) => {
                                event.preventDefault(); // Ngăn chặn hành vi mặc định của nút
                                event.stopPropagation(); // Ngăn sự kiện lan đến Link
                                toggleFavorite(productId);
                            }}
                        >
                            {isFavorite ? (
                                <FavoriteIcon
                                    className="text-red-500 hover:text-red transition-transform duration-500"/>
                            ) : (
                                <FavoriteBorderOutlinedIcon
                                    className="hover:text-red transition-transform duration-500"/>
                            )}
                        </button>


                        {/* Nút giỏ hàng */}
                        <a href="#">
                            <ShoppingCartOutlinedIcon
                                className="hover:text-[#00b7c0] transition-colors ease-in-out duration-500"/>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

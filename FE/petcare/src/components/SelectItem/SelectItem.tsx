import React, { useEffect, useState } from "react";
import SelectItemCard from "./SelectItemCard";

const items = [
  {
    title: "Đăng nhập",
    description: "Đăng nhập vào hệ thống để mua hàng",
    bgColor: "#FF6C7F",
    image: "/src/assets/pet.png",
  },
  {
    title: "Cửa hàng",
    description: "Khám phá các sản phẩm của chúng tôi",
    bgColor: "#feda46",
    image: "/src/assets/store.png",
  },
  {
    title: "Spa thú y",
    description: "Đặt lịch hẹn chăm sóc thú cưng của bạn",
    bgColor: "#00c274",
    image: "/src/assets/booking.png",
  },
  {
    title: "Thăm Khám",
    description: "Chăm sóc sức khỏe thú cưng của bạn",
    bgColor: "#6cd9f7",
    image: "/src/assets/heart.png",
  },
];

export default function SelectItem() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kích hoạt hiệu ứng hiển thị sau khi component được mount
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
      <div className="grid grid-cols-4 gap-6 mx-32 py-1 m-5 h-28">
        {items.map((item, index) => (
            <div
                key={index}
                className={`transition-all duration-700 ease-out transform ${
                    isVisible
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-10 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`, // Delay giữa các item
                }}
            >
              <SelectItemCard
                  title={item.title}
                  description={item.description}
                  bgColor={item.bgColor}
                  image={item.image}
              />
            </div>
        ))}
      </div>
  );
}

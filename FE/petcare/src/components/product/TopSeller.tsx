import React, { useEffect, useState } from "react";
import ItemSeller from "./ItemSeller";
import FlashSale from "../flashSale/FlashSale";

const items = [
  {
    name: "Dầu gội cho mèo",
    image: "/src/assets/product8.jpg",
    price: "199.000đ",
  },
  {
    name: "Bát ăn cho mèo",
    image: "/src/assets/product2.jpg",
    price: "150.000đ",
  },
  {
    name: "Bát ăn cho mèo",
    image: "/src/assets/product4.jpg",
    price: "100.000đ",
  },
  {
    name: "Sữa tắm cho chó",
    image: "/src/assets/product7.jpg",
    price: "250.000đ",
  },
];

export default function TopSeller() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false); // Để theo dõi đã kích hoạt animation

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("topSellerAnimated");
      if (!element) return;

      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0 && !hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true); // Đánh dấu đã kích hoạt
      }
    };

    // Thêm debouncing để giảm số lần gọi
    const debounceScroll = debounce(handleScroll, 100);

    window.addEventListener("scroll", debounceScroll);
    return () => window.removeEventListener("scroll", debounceScroll);
  }, [hasAnimated]);

  // Hàm debounce để tối ưu sự kiện cuộn
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  return (
      <div>
      <span className="block mx-32 text-3xl pt-10 font-semibold">
        Giảm giá mỗi ngày
      </span>
        <FlashSale />
        <div
            id="topSellerAnimated"
            className="grid grid-cols-4 gap-6 mx-32 mb-10 mt-3"
        >
          {items.map((item, index) => (
              <div
                  key={index}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                        ? "translateX(0)"
                        : index % 2 === 0
                            ? "translateX(-100px)" // Đổ từ trái với index chẵn
                            : "translateX(100px)", // Đổ từ phải với index lẻ
                    transition: `all 0.8s ease ${index * 0.2}s`, // Thời gian trễ theo index
                  }}
              >
                <ItemSeller
                    name={item.name}
                    image={item.image}
                    price={item.price}
                />
              </div>
          ))}
        </div>
      </div>
  );
}

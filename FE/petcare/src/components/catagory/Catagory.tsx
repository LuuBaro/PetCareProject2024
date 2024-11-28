import React, { useEffect, useState } from "react";
import Item from "./Item";
import "/src/App.css";
import ProductCategoriesService from "../../service/ProductCategoriesService.js";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    // Fetch product categories from the API
    ProductCategoriesService.getAllProductCategories()
        .then((response) => {
          setCategories(response.data);
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
        });
  }, []);

  const prevSlide = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const nextSlide = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prevIndex) =>
        Math.min(prevIndex + 1, categories.length - itemsPerPage)
    );
  };

  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === categories.length - itemsPerPage
                ? 0
                : prevIndex + 1
        );
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, categories.length, itemsPerPage]);

  useEffect(() => {
    if (!isAutoPlay) {
      const timeout = setTimeout(() => setIsAutoPlay(true), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isAutoPlay]);

  const visibleItems = categories.slice(currentIndex, currentIndex + itemsPerPage);

  return (
      <div className="relative mx-32 mt-8 bg-white shadow">
        <div className="slider-wrapper">
          <div
              className="slider-container"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
          >
            {visibleItems.map((item, index) => (
                <Item
                    key={index}
                    name={item.categogyName}
                    image={item.image}
                />
            ))}
          </div>
        </div>
        <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 p-2"
            onClick={prevSlide}
        >
          <ArrowBackIosNewOutlinedIcon
              sx={{ fontSize: 30 }}
              className="text-[#00B7C0]"
          />
        </button>
        <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2"
            onClick={nextSlide}
        >
          <ArrowForwardIosOutlinedIcon
              sx={{ fontSize: 30 }}
              className="text-[#00B7C0]"
          />
        </button>
      </div>
  );
}

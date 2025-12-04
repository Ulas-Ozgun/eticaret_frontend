import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomeSlider.css";

const API_URL = "https://localhost:7258/api";

function HomeSlider() {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const loadImages = async () => {
      const res = await axios.get(`${API_URL}/product/slider`);
      setImages(res.data);
    };

    loadImages();
  }, []);

  // Auto slide (3 saniyede bir)
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setIndex((current) => (current === images.length - 1 ? 0 : current + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [images]);

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="slider-container">
      {images.length > 0 && (
        <>
          <button className="arrow-btn left" onClick={prevSlide}>
            ❮
          </button>

          <div
            className="slider-bg"
            style={{
              backgroundImage: `url(https://localhost:7258/${images[index]})`,
            }}
          ></div>

          <button className="arrow-btn right" onClick={nextSlide}>
            ❯
          </button>
        </>
      )}
    </div>
  );
}

export default HomeSlider;

"use client";

import { useEffect, useState } from "react";

const Slideshow = ({ images, position, size, opacityLevels, fadeDuration, blankDuration }) => {
  if (!Array.isArray(images) || images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    const cycleImages = () => {
      setShowImage(false); 
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setShowImage(true); 
      }, blankDuration * 1000); 
    };

    const interval = setInterval(cycleImages, parseFloat(fadeDuration) * 1000 * 2 + blankDuration * 1000);

    return () => clearInterval(interval);
  }, [images.length, fadeDuration, blankDuration]);

  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: size.width,
        height: size.height,
        overflow: "hidden",
        borderRadius: "10px",
      }}
    >
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt="Slideshow"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: `opacity ${fadeDuration}s ease-in-out`,
            opacity: currentIndex === index && showImage ? opacityLevels.visible : opacityLevels.hidden,
          }}
        />
      ))}
    </div>
  );
};

export default Slideshow;




//
   // use kaise karna- 
   // pehle images ka array define karo aur index like below , top pe karna aur  ye add karlena import Slideshow from "./slideshow";


   // const images = [/image/xyz]
   // const [ImageIndex, ImageIndex] = useState(0);
   
   // phir slideshow ka component use karna jaha chahiye , jis element se peeche chahiye like prev layer to uss element se pehle iska code dalna aur jiske aage usse aage code dalna 
    ////<Slideshow
    //   images={Images} (jo bhi array use kara)
    //   position={{ top: "x%", left: "y%" }} (percent ke hisaab se , aspect ratio mai same rahega chahiye size of screen jo bhi ho )
    //   size={{ width: "xvh", height: "xvh" }} (vh se aspect ratio mai same rahega so better )
    //   opacityLevels={{ visible: x, hidden: y }}(visible opacity kitni hai aur jab hidden tab kitni)
    //   fadeDuration={x} (fade in hone mai kitna time and fade out hone mai kitna time in seconds )
    //   blankDuration={y} (fade out hone ke baad dusri image aane se pehle kitna time koi image display nahi hogi in seconds)
    // />



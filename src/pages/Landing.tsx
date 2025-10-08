import React from "react";
import Mascot from "../assets/mascot.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';



const features = [
    {
      icon: "🔐",
      title: "Bank-Level Encryption",
      description: "Encrypt files, folders, and apps with military-grade AES & RSA encryption. Your data, your keys."
    }, 
    {
    icon: "💬",
    title: "Private Conversations(xorachat)",
    description: "Message securely without phone numbers. End-to-end encrypted. Even we can't read your messages."
    },
    {
    icon: "🎭",
    title: "Hide in Plain Sight(disguise-mode)",
    description: "Transform Joyxora into a calculator, notes app, or game. Return with secret gestures."
    },
    {
    icon: "🐱",
    title: "Meet XoraCat",
    description: "Your friendly AI guide. Get help with encryption, privacy tips, and navigate Joyxora with ease."
    }
    ];

const Landing: React.FC = () => {
  return (
     <section className="w-full h-screen bg-gradient-to-r from-joyxora-darks to-joyxora-darker text-joyxora-textMuted flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-5 py-5">
        <div className="flex flex-col items-center">
          <h1 className="text-joyxora-green font-bold text-3xl mb-4 text-center">
            Welcome to Joyxora
          </h1>
          <img src={Mascot} alt="mascot" className="w-24 h-24 md:w-32 md:h-32 mb-4" />
          <p className="text-joyxora-green text-lg text-center">
	joyxora	lets you encrypt files and apps, hide them, and chat securely without using a phone number.
	 Fast, smart, and private  with strong encryption and stealth features.
          </p>
	<h1 className="text-joyxora-green font-bold text-3xl mb-4 text-center">
            Join Us Today!
          </h1>
          <h2 className="text-joyxora-green text-lg text-center mb-4">
            Your Toolkit for Security and Privacy.
          </h2>
          <button className="bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradient-To text-white py-2 px-4 rounded hover:bg-joyxora-green-dark transition duration-300">
            Get Started
          </button>
        </div>
        <div className="w-full lg:w-1/2  flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={50}
            slidesPerView={1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={false}  
            loop={true}
            speed={900}
            className="w-full"
          >
            {features.map((feature, index) => (
              <SwiperSlide key={index}>
                <div className="text-center py-8 lg:py-12 px-4">
                  {/* Feature Icon */}
                  <div className="text-7xl lg:text-8xl mb-6 lg:mb-8">
                    {feature.icon}
                  </div>
                  
                  {/* Feature Title */}
                  <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-joyxora-green">
                    {feature.title}
                  </h2>
                  
                  {/* Feature Description */}
                  <p className="text-joyxora-green text-base lg:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
      </div>
      </div>
      </div>
    </section>
  );
};

export default Landing;

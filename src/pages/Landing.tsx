import React from "react";
import Mascot from "../assets/mascot.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Single bundle import - includes all Swiper styles
import "swiper/css/bundle";

const features = [
  {
    icon: "🔐",
    title: "Bank-Level Encryption",
    description:
      "Encrypt files, folders, and apps with military-grade AES & RSA encryption. Your data, your keys.",
  },
  {
    icon: "💬",
    title: "Private Conversations (xorachat)",
    description:
      "Message securely without phone numbers. End-to-end encrypted. Even we can't read your messages.",
  },
  {
    icon: "🎭",
    title: "Hide in Plain Sight (disguise-mode)",
    description:
      "Transform Joyxora into a calculator, notes app, or game. Return with secret gestures.",
  },
  {
    icon: "🐱",
    title: "Meet XoraCat",
    description:
      "Your friendly AI guide. Get help with encryption, privacy tips, and navigate Joyxora with ease.",
  },
];

const Landing: React.FC = () => {
  return (
    <section className="w-full min-h-screen bg-gradient-to-r from-joyxora-darks to-joyxora-darker text-joyxora-textMuted flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center">
          
          {/* LEFT SIDE */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center space-y-4 lg:space-y-6">
            <h1 className="text-joyxora-green font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
              Welcome to Joyxora
            </h1>

            <img
              src={Mascot}
              alt="Joyxora Mascot"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-bounce"
            />

            <p className="text-joyxora-green text-sm sm:text-base lg:text-lg max-w-md leading-relaxed">
              Joyxora lets you encrypt files and apps, hide them, and chat
              securely without using a phone number. Fast, smart, and private
              with strong encryption and stealth features.
            </p>

            <h2 className="text-joyxora-green font-bold text-xl sm:text-2xl lg:text-3xl pt-2">
              Join Us Today!
            </h2>

            <p className="text-joyxora-green text-base sm:text-lg lg:text-xl">
              Your Toolkit for Security and Privacy.
            </p>

            <button className="bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradient-To text-white font-semibold py-3 px-6 sm:px-8 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300 mt-4">
              Get Started
            </button>

            <p className="text-joyxora-textMuted text-sm">
              Already have an account?{" "}
              <a
                href="/signin"
                className="text-joyxora-green underline hover:text-joyxora-green-dark transition"
              >
                Sign in
              </a>
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="w-full max-w-md">
              <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={30}
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
                    <div className="text-center py-6 sm:py-8 lg:py-12 px-4">
                      <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl mb-4 sm:mb-6 lg:mb-8">
                        {feature.icon}
                      </div>

                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-joyxora-green">
                        {feature.title}
                      </h2>

                      <p className="text-joyxora-green text-sm sm:text-base lg:text-lg leading-relaxed px-2">
                        {feature.description}
                      </p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;

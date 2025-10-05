import React from "react";
import LogoImage from "../assets/logo.png"
const Header: React.FC = () => {
  return (
    <header className="w-full bg-joyxora-dark py-6 px-4 flex flex-col items-center justify-center text-center">
      {/* Logo / Brand Name */}
      <img src={LogoImage} alt="logo"className= "w-24 h-24"></img>
      <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradientTo bg-clip-text text-transparent">
        Joyxora
      </h1>

      {/* Tagline */}
      <p className="mt-2 text-joyxora-green text-sm md:text-base">
        Secure your world, encrypt everything.
      </p>
    </header>
  );
};

export default Header;


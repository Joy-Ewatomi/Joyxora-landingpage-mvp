
import React from "react";
import {motion, easeOut} from "framer-motion";
const navigate = "react-router-dom";

const footerVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const Footer: React.FC = () => {
  return (
    <motion.footer
      className="w-full bg-joyxora-dark text-joyxora-textMuted py-10 px-6 md:px-16 lg:px-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: false }}
      variants={footerVariant}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left: Logo / Brand */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Joyxora<span className="text-joyxora-green">.</span>
          </h2>
          <p className="text-sm text-joyxora-textMuted">
            Privacy-first tools for the next generation.  
            Secure. Simple. Powerful.
          </p>
        </div>

        {/* Middle: Links */}
        <div className="flex flex-col gap-2 text-sm">
          <a
       href="#"
     onClick={(e) => {
      e.preventDefault(); // stop default link jump
    const section = document.getElementById("join-section");
    section?.scrollIntoView({ behavior: "smooth" });
    }}
    className="text-joyxora-textMuted  hover:text-joyxora-green"
   >
  Join Waitlist
 </a>

<a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    const section = document.getElementById("join-section");
    section?.scrollIntoView({ behavior: "smooth" });
  }}
  className="text-joyxora-textMuted hover:tex-joyxora-green"
>
  Become a Funder
</a>

           <a 
      href="#"
     className="hover:text-joyxora-green transition cursor-pointer"
      onClick={(e) => {
        e.preventDefault(); 
        navigate("/Landing");
      }}
    >
      Check MVP
    </a>
        </div>

        {/* Right: Socials */}
        <div className="flex gap-4">
          <a
            href="https://github.com/Joy-Ewatomi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-joyxora-green transition"
          >
            GitHub
          </a>
          <a
            href="mailto:joravytech@gmail.com"
            className="hover:text-joyxora-green transition"
          >
            Email
          </a>
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-10 text-center text-xs text-joyxora-textMuted border-t border-joyxora-gray pt-6">
        © {new Date().getFullYear()} Joyxora. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;

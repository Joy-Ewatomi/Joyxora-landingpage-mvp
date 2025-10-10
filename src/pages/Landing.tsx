import React, { useState, useEffect, useRef } from "react";
import Mascot from "../assets/mascot.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";

// ✅ Email validation helper
function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

// ✅ Modal Component
type ModalProps = { title?: string; onClose: () => void; children: React.ReactNode };

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div ref={backdropRef} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-w-md w-full mx-4 bg-joyxora-dark rounded-xl p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button className="text-joyxora-textMuted" onClick={onClose}>
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// ✅ Environment variable (with fallback)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ✅ Sign-in form
const SigninForm: React.FC<{ onDone: (ok: boolean, msg?: string) => void }> = ({ onDone }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!username.trim() || !password.trim())
      return onDone(false, "Please enter your username and password");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success)
        onDone(true, data.message || "Welcome back to Joyxora!");
      else onDone(false, data.error || "Server error");
    } catch {
      onDone(false, "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="p-3 rounded-lg bg-black/50 text-white"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="p-3 rounded-lg bg-black/50 text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="py-3 rounded-lg bg-joyxora-green text-black font-semibold"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

// ✅ Sign-up form
const SignupForm: React.FC<{ onDone: (ok: boolean, msg?: string) => void }> = ({ onDone }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!isValidEmail(email)) return onDone(false, "Please enter a valid email");
    if (!username.trim() || !password.trim())
      return onDone(false, "All fields are required");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success)
        onDone(true, data.message || "You are now a member of Joyxora!");
      else onDone(false, data.error || "Server error");
    } catch {
      onDone(false, "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="p-3 rounded-lg bg-black/50 text-white"
      />
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="p-3 rounded-lg bg-black/50 text-white"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="p-3 rounded-lg bg-black/50 text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="py-3 rounded-lg bg-joyxora-green text-black font-semibold"
      >
        {loading ? "Signing up..." : "Sign up"}
      </button>
    </form>
  );
};

// ✅ Feature slides data
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

// ✅ Landing page
const Landing: React.FC = () => {
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

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

            <button
              className="bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradient-To text-white font-semibold py-3 px-6 sm:px-8 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300 mt-4"
              onClick={() => setShowSignup(true)}
            >
              Get Started
            </button>

            <p className="text-joyxora-textMuted text-sm">
              Already have an account?{" "}
              <a
                href="#"
                className="text-joyxora-green underline hover:text-joyxora-green-dark transition"
                onClick={() => setShowSignin(true)}
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

      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg z-50 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {toast.text}
        </div>
      )}

      {/* ✅ Modals */}
      {showSignin && (
        <Modal title="Welcome back to Joyxora" onClose={() => setShowSignin(false)}>
          <SigninForm
            onDone={(ok, msg) => {
              if (ok) setShowSignin(false);
              showToast(ok ? "success" : "error", msg || (ok ? "Joined!" : "Failed"));
            }}
          />
        </Modal>
      )}

      {showSignup && (
        <Modal title="Become a member of Joyxora" onClose={() => setShowSignup(false)}>
          <SignupForm
            onDone={(ok, msg) => {
              if (ok) setShowSignup(false);
              showToast(ok ? "success" : "error", msg || (ok ? "Thanks!" : "Failed"));
            }}
          />
        </Modal>
      )}
    </section>
  );
};

export default Landing;

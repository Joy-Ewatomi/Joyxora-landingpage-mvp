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

// ✅ Backend base URL
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://joyxora-landingpage-mvp-backend-production.up.railway.app/";

// ==================== SIGNIN FORM ====================
const SigninForm: React.FC<{ onDone: (ok: boolean, msg?: string) => void; onForgot: () => void }> = ({
  onDone,
  onForgot,
}) => {
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
      if (res.ok && data.success) {
        localStorage.setItem("joyxora_token", data.token);
        onDone(true, `Welcome back, ${data.user.username}!`);
      } else onDone(false, data.error || "Sign-in failed");
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

      <button
        type="button"
        onClick={onForgot}
        className="text-sm text-joyxora-green underline mt-2 hover:text-joyxora-green-dark"
      >
        Forgot password?
      </button>
    </form>
  );
};

// ==================== SIGNUP FORM ====================
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
      if (res.ok && data.success) {
        localStorage.setItem("joyxora_token", data.token);
        onDone(true, "Welcome to Joyxora!");
      } else onDone(false, data.error || "Sign-up failed");
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

// ==================== FORGOT PASSWORD ====================
const ForgotPasswordForm: React.FC<{ onDone: (ok: boolean, msg?: string) => void }> = ({ onDone }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!isValidEmail(email)) return onDone(false, "Please enter a valid email");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success)
        onDone(true, "Check your email for reset instructions");
      else onDone(false, data.error || "Reset failed");
    } catch {
      onDone(false, "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your account email"
        className="p-3 rounded-lg bg-black/50 text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="py-3 rounded-lg bg-joyxora-green text-black font-semibold"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
};

// ==================== LANDING PAGE ====================
const features = [
  { icon: "🔐", title: "Bank-Level Encryption", description: "Encrypt files and folders with AES & RSA." },
  { icon: "💬", title: "Private Conversations", description: "Chat securely. End-to-end encrypted." },
  { icon: "🎭", title: "Hide in Plain Sight", description: "Disguise Joyxora as a calculator or notes app." },
  { icon: "🐱", title: "Meet XoraCat", description: "Your friendly AI guide for privacy and help." },
];

const Landing: React.FC = () => {
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
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
            <h1 className="text-joyxora-green font-bold text-3xl lg:text-4xl">
              Welcome to Joyxora
            </h1>
            <img src={Mascot} alt="Joyxora Mascot" className="w-28 h-28 animate-bounce" />
            <p className="text-joyxora-green text-base max-w-md leading-relaxed">
              joyxora lets you encrypt files and apps, hide them, and chat securely without using a phone number. Fast, smart, and private with strong encryption and stealth features.
            </p>
            <h1 className="text-joyxora-green font-bold text-3xl lg:text-4xl">join us today!</h1>
            <p className="text-joyxora-green font-semibold text-3xl lg:text-4xl">
              your toolkit for security and privacy
            </p>

            <button
              onClick={() => setShowSignup(true)}
              className="bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradientTo text-white font-semibold py-3 px-6 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300 mt-4"
            >
              Get Started
            </button>
            <p className="text-sm">
              Already have an account?{" "}
              <span
                className="text-joyxora-green underline cursor-pointer"
                onClick={() => setShowSignin(true)}
              >
                Sign in
              </span>
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-1/2">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              loop
              className="w-full"
            >
              {features.map((f, i) => (
                <SwiperSlide key={i}>
                  <div className="text-center py-8 px-4">
                    <div className="text-6xl mb-4">{f.icon}</div>
                    <h2 className="text-xl font-bold mb-2 text-joyxora-green">{f.title}</h2>
                    <p className="text-joyxora-green text-sm">{f.description}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg z-50 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {toast.text}
        </div>
      )}

      {/* Modals */}
      {showSignin && (
        <Modal title="Sign in to Joyxora" onClose={() => setShowSignin(false)}>
          <SigninForm
            onDone={(ok, msg) => {
              if (ok) setShowSignin(false);
              showToast(ok ? "success" : "error", msg || "");
            }}
            onForgot={() => {
              setShowSignin(false);
              setShowForgot(true);
            }}
          />
        </Modal>
      )}

      {showSignup && (
        <Modal title="Create your Joyxora account" onClose={() => setShowSignup(false)}>
          <SignupForm
            onDone={(ok, msg) => {
              if (ok) setShowSignup(false);
              showToast(ok ? "success" : "error", msg || "");
            }}
          />
        </Modal>
      )}

      {showForgot && (
        <Modal title="Reset your Joyxora password" onClose={() => setShowForgot(false)}>
          <ForgotPasswordForm
            onDone={(ok, msg) => {
              if (ok) setShowForgot(false);
              showToast(ok ? "success" : "error", msg || "");
            }}
          />
        </Modal>
      )}
    </section>
  );
};

export default Landing;

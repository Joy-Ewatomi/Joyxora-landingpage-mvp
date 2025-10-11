import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Mascot from "../assets/mascot.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/swiper-bundle.css";

// ==================== TYPES ====================
type ModalProps = { 
  title?: string; 
  onClose: () => void; 
  children: React.ReactNode 
};

type ToastType = "success" | "error";

// ==================== HELPERS ====================
function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

// ==================== CONFIGURATION ====================
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const features = [
  { 
    icon: "🔐", 
    title: "Bank-Level Encryption", 
    description: "Encrypt files, folders, and apps with military-grade AES & RSA encryption. Your data, your keys." 
  },
  { 
    icon: "💬", 
    title: "Private Conversations (xorachat)", 
    description: "Message securely without phone numbers. End-to-end encrypted. Even we can't read your messages." 
  },
  { 
    icon: "🎭", 
    title: "Hide in Plain Sight (disguise-mode)", 
    description: "Transform Joyxora into a calculator, notes app, or game. Return with secret gestures." 
  },
  { 
    icon: "🐱", 
    title: "Meet XoraCat", 
    description: "Your friendly AI guide. Get help with encryption, privacy tips, and navigate Joyxora with ease." 
  },
];

// ==================== MODAL COMPONENT ====================
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        ref={backdropRef} 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose} 
      />
      <div className="relative max-w-md w-full bg-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 z-10 shadow-2xl border border-green-500/20">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
          <button 
            className="text-gray-400 hover:text-white text-2xl transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
// ==================== SIGNIN FORM ====================
interface SigninFormProps {
  onDone: (ok: boolean, msg?: string) => void;
  onForgot: () => void;
}

const SigninForm: React.FC<SigninFormProps> = ({ onDone, onForgot }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return onDone(false, "Please enter your email and password");
    }

    if (!isValidEmail(email)) {
      return onDone(false, "Please enter a valid email");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}api/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem("joyxora_token", data.token);
        localStorage.setItem("joyxora_user", JSON.stringify(data.user));
        onDone(true, `Welcome back!`);
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        onDone(false, data.message || "Sign-in failed");
      }
    } catch (err) {
      console.error('Sign in error:', err);
      onDone(false, "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full p-3 sm:p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none transition"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full p-3 sm:p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 sm:py-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <button
        type="button"
        onClick={onForgot}
        className="text-sm text-green-500 hover:text-green-400 underline transition text-center"
      >
        Forgot password?
      </button>
    </form>
  );
};
// ==================== SIGNUP FORM ====================
interface SignupFormProps {
  onDone: (ok: boolean, msg?: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onDone }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    
    // Validation
    if (!isValidEmail(email)) {
      return onDone(false, "Please enter a valid email");
    }
    
    if (!password.trim()) {
      return onDone(false, "Password is required");
    }
    
    if (password.length < 8) {
      return onDone(false, "Password must be at least 8 characters");
    }
    
    if (password !== confirmPassword) {
      return onDone(false, "Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem("joyxora_token", data.token);
        localStorage.setItem("joyxora_user", JSON.stringify(data.user));
        onDone(true, "Welcome to Joyxora! Please check your email to verify your account.");
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        onDone(false, data.message || "Sign-up failed");
      }
    } catch (err) {
      console.error('Sign up error:', err);
      onDone(false, "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full p-3 sm:p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none transition"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          className="w-full p-3 sm:p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none transition"
          required
          minLength={8}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="w-full p-3 sm:p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 sm:py-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
};
// ==================== FORGOT PASSWORD FORM ====================
interface ForgotPasswordFormProps {
  onDone: (ok: boolean, msg?: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onDone }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    
    if (!isValidEmail(email)) {
      return onDone(false, "Please enter a valid email");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      
      if (res.ok) {
        onDone(true, data.message || "Check your email for reset instructions");
      } else {
        onDone(false, data.message || "Failed to send reset email");
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      onDone(false, "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-400 mb-2">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <div>
        <label className="block text-sm text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full p-3 sm:p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 sm:py-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
};
// ==================== LANDING PAGE ====================
const Landing: React.FC = () => {
  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; text: string } | null>(null);

  function showToast(type: ToastType, text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <>
      <section className="w-full min-h-screen bg-gradient-to-r from-gray-900 to-black text-gray-300 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

            {/* LEFT SIDE */}
            <div className="w-full lg:w-1/2 flex flex-col items-center text-center space-y-4 sm:space-y-6">
              <h1 className="text-green-500 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight max-w-2xl">
                Welcome to Joyxora
              </h1>

              <img
                src={Mascot}
                alt="Joyxora Mascot"
                className="w-24 sm:w-28 md:w-32 lg:w-40 h-auto animate-bounce"
              />

              <p className="text-green-500 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md px-4 sm:px-0">
                Joyxora lets you encrypt files and apps, hide them, and chat securely without using a phone number.
                Fast, smart, and private — with strong encryption and stealth features.
              </p>

              <h2 className="text-green-500 font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Join us today!
              </h2>

              <p className="text-green-500 font-medium text-base sm:text-lg lg:text-xl">
                Your toolkit for security and privacy
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 w-full sm:w-auto px-4 sm:px-0">
                <button
                  onClick={() => setShowSignup(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-4 px-8 text-base sm:text-lg rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </button>
              </div>

              <p className="text-xs sm:text-sm mt-2 text-gray-400 px-4 sm:px-0">
                Already have an account?{" "}
                <span
                  className="text-green-500 underline cursor-pointer hover:text-green-400 font-medium"
                  onClick={() => setShowSignin(true)}
                >
                  Sign in here
                </span>
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/2 flex justify-center px-4 sm:px-0">
              <div className="w-full max-w-md lg:max-w-lg">
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={20}
                  slidesPerView={1}
                  autoplay={{ 
                    delay: 4000, 
                    disableOnInteraction: false, 
                    pauseOnMouseEnter: true 
                  }}
                  pagination={{ 
                    clickable: true, 
                    dynamicBullets: true 
                  }}
                  loop
                  className="w-full"
                >
                  {features.map((f, i) => (
                    <SwiperSlide key={i}>
                      <div className="text-center py-8 sm:py-10 lg:py-12 px-4 sm:px-6">
                        <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
                          {f.icon}
                        </div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-green-500">
                          {f.title}
                        </h3>
                        <p className="text-green-500 text-sm sm:text-base lg:text-lg leading-relaxed">
                          {f.description}
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
    {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-xl z-50 max-w-[90vw] sm:max-w-md text-center ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white font-medium text-sm sm:text-base animate-fade-in`}
        >
          {toast.text}
        </div>
      )}

      {/* Sign In Modal */}
      {showSignin && (
        <Modal title="Sign in to Joyxora" onClose={() => setShowSignin(false)}>
          <SigninForm
            onDone={(ok, msg) => {
              showToast(ok ? "success" : "error", msg || "");
              if (ok) setShowSignin(false);
            }}
            onForgot={() => {
              setShowSignin(false);
              setShowForgot(true);
            }}
          />
        </Modal>
      )}

      {/* Sign Up Modal */}
      {showSignup && (
        <Modal title="Create your Joyxora account" onClose={() => setShowSignup(false)}>
          <SignupForm
            onDone={(ok, msg) => {
              showToast(ok ? "success" : "error", msg || "");
              if (ok) setShowSignup(false);
            }}
          />
        </Modal>
      )}

      {/* Forgot Password Modal */}
      {showForgot && (
        <Modal title="Reset your password" onClose={() => setShowForgot(false)}>
          <ForgotPasswordForm
            onDone={(ok, msg) => {
              showToast(ok ? "success" : "error", msg || "");
              if (ok) setShowForgot(false);
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default Landing;

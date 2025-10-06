import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

const features = {
  waitlist: {
    title: "🚀 Join the Waitlist",
    desc: "Be the first to experience Joyxora when we launch. Get early access, and influence the roadmap with feedback.",
    cta: "Join Waitlist",
  },
  funders: {
    title: "💰 Become a Funder",
    desc: "Support the mission to build privacy-first tools. Gain early-bird perks, roadmap influence, and 4 month premium free at full app lunch.",
    cta: "Support as Funder",
  },
};

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
          <button className="text-joyxora-textMuted" onClick={onClose}>✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};


const WaitlistForm: React.FC<{ onDone: (ok: boolean, msg?: string) => void }> = ({ onDone }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!isValidEmail(email)) return onDone(false, "Please enter a valid email");
    setLoading(true);
    try {
      const res = await fetch("https://joyxora-landingpage-mvp-backend-production.up.railway.app/api/Waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const j = await res.json();
      if (res.ok && j.success) onDone(true, j.message || "You joined the waitlist");
      else onDone(false, j.error || "Server error");
    } catch (err) {
      onDone(false, "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="p-3 rounded-lg bg-black/50 text-white" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="p-3 rounded-lg bg-black/50 text-white" />
      <div className="flex gap-2 mt-2">
        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-lg bg-joyxora-green text-black font-semibold">
          {loading ? "Joining..." : "Join Waitlist"}
        </button>
      </div>
    </form>
  );
};

const FunderForm: React.FC<{ onDone: (ok: boolean, msg?: string) => void }> = ({ onDone }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!isValidEmail(email)) return onDone(false, "Please enter a valid email");
    setLoading(true);
    try {
      const res = await fetch("https://joyxora-landingpage-mvp-backend-production.up.railway.app/api/Funder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), amount: amount.trim() }),
      });
      const f = await res.json();
      if (res.ok && f.success) onDone(true, f.message || "Funder interest recorded");
      else onDone(false, f.error || "Server error");
    } catch (err) {
      onDone(false, "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="p-3 rounded-lg bg-black/50 text-white" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="p-3 rounded-lg bg-black/50 text-white" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount(in word)" className="p-3 rounded-lg bg-black/50 text-white" />
      <div className="flex gap-2 mt-2">
        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-lg bg-joyxora-green text-black font-semibold">
          {loading ? "Submitting..." : "Send Interest"}
        </button>
      </div>
    </form>
  );
};


const Comparison: React.FC = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showFunder, setShowFunder] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const reduceMotion = useReducedMotion();


  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }


  return (
    <section className="w-full py-16 px-6 md:px-16 lg:px-24 bg-joyxora-dark text-white">
      <motion.h2 className="text-3xl md:text-4xl font-bold text-center mb-10" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Choose Your Role in <span className="text-joyxora-green">Joyxora</span>
      </motion.h2>

      <div id="join-section" className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <motion.div className="p-8 bg-joyxora-gray rounded-2xl flex flex-col justify-between" initial={reduceMotion ? undefined : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div>
            <h3 className="text-2xl font-semibold mb-3">{features.waitlist.title}</h3>
            <p className="text-joyxora-green mb-4">{features.waitlist.desc}</p>
          </div>
          <button onClick={() => setShowWaitlist(true)} className="w-full py-3 rounded-xl bg-joyxora-green text-black font-bold">
            {features.waitlist.cta}
          </button>
        </motion.div>

        <motion.div className="p-8 bg-joyxora-gray rounded-2xl flex flex-col justify-between" initial={reduceMotion ? undefined : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div>
            <h3 className="text-2xl font-semibold mb-3">{features.funders.title}</h3>
            <p className="text-joyxora-green mb-4">{features.funders.desc}</p>
          </div>
          <button onClick={() => setShowFunder(true)} className="w-full py-3 rounded-xl bg-joyxora-green text-black font-bold">
            {features.funders.cta}
          </button>
        </motion.div>
      </div>

     <div className="mt-12 text-center">
  <button
    onClick={() => alert("🚧 MVP not yet available #stay tuned!")}
    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradientTo text-black font-extrabold hover:scale-105 transition-transform"
  >
    🔐 Check Out the MVP
  </button>
</div>

      {/* toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg z-50 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"} text-white`}>
          {toast.text}
        </div>
      )}

      {/* modals */}
      {showWaitlist && (
        <Modal title="Join Waitlist" onClose={() => setShowWaitlist(false)}>
          <WaitlistForm onDone={(ok, msg) => { if (ok) setShowWaitlist(false); showToast(ok ? "success" : "error", msg || (ok ? "Joined!" : "Failed")); }} />
        </Modal>
      )}

      {showFunder && (
        <Modal title="Become a Funder" onClose={() => setShowFunder(false)}>
          <FunderForm onDone={(ok, msg) => { if (ok) setShowFunder(false); showToast(ok ? "success" : "error", msg || (ok ? "Thanks!" : "Failed")); }} />
        </Modal>
      )}
    </section>
  );
};



export default Comparison;

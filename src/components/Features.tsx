import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Universal File/Folder Encryption & Decryption",
    desc: "Encrypts any file/Folder with AES or RSA. Smart scanning, compression, preview, and seamless decryption,  even for files not encrypted by Joyxora."
  },
  {
    title: "Advanced App Locking & Encryption",
    desc: "Encrypt any app. Set auto-decrypt/re-encrypt times. Choose visible or hidden mode. Disguise Joyxora as a calculator, note, or game with secret gestures."
  },
  {
  title: "Secure Messaging Platform",
  desc: "Private messaging with RSA/AES encryption. No phone number, just a unique ID. One-time invite links, face scan or fingerprint authentication for extra security."
  },
  {
    title: "Security-First Architecture",
    desc: "Malware-scanned messages, zero-knowledge privacy, anti-snooping tools, and a built-in chatbot for support."
  },
  {
    title: "⚡ Cross-Platform",
    desc: "Works seamlessly across desktop, mobile, and other devices without limits."
  },
  {
    title: "Target Users",
    desc: "Security-conscious individuals, professionals handling sensitive data, and users seeking advanced privacy features beyond basic app lockers or cloud messaging platform."
  },
];

const Features: React.FC = () => {
  return (
    <section className="w-full bg-transparent py-12 px-6 md:px-16 lg:px-24 text-center">
      {/* Section Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-joyxora-green mb-6">
        Why Choose <span className="text-white">Joyxora?</span>
      </h2>

      {/* Description */}
      <p className="text-joyxora-green max-w-3xl mx-auto mb-10">
        Joyxora is a modern, cross-platform encryption platform designed to give
        you complete control over your digital privacy. From instant text, file/folder & Apps
        encryption to advanced automation, Joyxora ensures your data stays safe,
        simple, and accessible only to you.
      </p>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="p-6 rounded-2xl bg-joyxora-gray shadow-md hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-joyxora-green">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;


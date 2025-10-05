import React from "react";
import { motion } from "framer-motion";

const features = {
  waitlist: {
    title: "🚀 Join the Waitlist",
    desc:
      "Be the first to experience Joyxora when we launch. Get early access, private updates, and influence the roadmap with feedback.",
    cta: "Join Waitlist",
  },
  funders: {
    title: "💰 Become a Funder",
    desc:
      "Support the mission to build privacy-first tools. Gain early-bird perks, roadmap influence, and 4 month premium free at full app lunch.",
    cta: "Support as Funder",
  },
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const headingVariant = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const buttonVariant = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, delay: 0.35 } },
};

const Comparison: React.FC = () => {
  return (
    <section className="w-full py-16 px-6 md:px-16 lg:px-24 bg-joyxora-dark text-white">
      {/* Animated Title */}
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-10"
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        variants={headingVariant}
      >
        Choose Your Role in <span className="text-joyxora-green">Joyxora</span>
      </motion.h2>

      {/* Cards grid (staggered children) */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
      >
        {/* Waitlist */}
        <motion.div
          variants={cardVariant}
          className="p-8 bg-joyxora-gray rounded-2xl shadow-md flex flex-col justify-between hover:shadow-lg transition"
        >
          <div>
            <h3 className="text-2xl font-semibold mb-4">{features.waitlist.title}</h3>
            <p className="text-joyxora-green mb-6">{features.waitlist.desc}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 rounded-xl bg-joyxora-green text-black font-bold hover:bg-joyxora-greenSoft transition"
            // TODO: add onClick handler to open waitlist modal / route to /waitlist
          >
            {features.waitlist.cta}
          </motion.button>
        </motion.div>

        {/* Funders */}
        <motion.div
          variants={cardVariant}
          className="p-8 bg-joyxora-gray rounded-2xl shadow-md flex flex-col justify-between hover:shadow-lg transition"
        >
          <div>
            <h3 className="text-2xl font-semibold mb-4">{features.funders.title}</h3>
            <p className="text-joyxora-green mb-6">{features.funders.desc}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 rounded-xl bg-joyxora-green text-black font-bold hover:bg-joyxora-greenSoft transition"
            // TODO: add onClick handler to open funder form / route to /funders
          >
            {features.funders.cta}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Centered MVP CTA */}
      <motion.div
        className="mt-12 flex justify-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        variants={buttonVariant}
      >
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(0,255,136,0.12)" }}
          whileTap={{ scale: 0.98 }}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradientTo text-black font-extrabold text-lg shadow-md transition"
          // TODO: add onClick to route to /mvp or open MVP modal
        >
          🔐 Check Out the MVP
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Comparison;

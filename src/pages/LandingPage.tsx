import React, { useState } from 'react';
import PaymentModal from '../components/PaymentModal';
import { Shield, Lock, Zap, Check, ArrowRight, Globe, Smartphone, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
const navigate = useNavigate();
const [showPayment, setShowPayment] = useState(false);
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-joyxora-green/20 bg-black/50 backdrop-blur-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-joyxora-green" />
              <span className="text-xl font-bold text-joyxora-green">JOYXORA</span>
              <span className="text-xs text-green-400/60">v2.1</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-2 text-sm text-green-400/80">
                <span className="w-2 h-2 bg-joyxora-green rounded-full animate-pulse"></span>
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="px-3 py-1 text-xs font-bold border border-joyxora-green/30 bg-joyxora-green/10 text-joyxora-green rounded-full">
                ● LIVE NOW
              </span>
              <span className="px-3 py-1 text-xs font-bold border border-joyxora-green/30 bg-joyxora-green/10 text-joyxora-green rounded-full">
                AES-256
              </span>
              <span className="px-3 py-1 text-xs font-bold border border-joyxora-green/30 bg-joyxora-green/10 text-joyxora-green rounded-full">
                100MB+ FILES
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Military-Grade
              <br />
              <span className="text-joyxora-green">File Encryption</span>
            </h1>

            <p className="text-lg sm:text-xl text-green-400/70 mb-8 max-w-2xl mx-auto">
              Encrypt files up to 100MB with AES-256 encryption. Works flawlessly on mobile.
              Zero-knowledge architecture. Your data never leaves your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-joyxora-green/50 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Start Encrypting (Free)
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-gray-800 border-2 border-joyxora-green text-joyxora-green rounded-lg font-bold text-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                View Pricing
              </button>
            </div>
            <p className="text-sm text-green-400/60">
              No signup required • Encrypt your first file in 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-joyxora-green">
              Available RIGHT NOW
            </h2>
            <p className="text-green-400/70">
              Not a concept. Not coming soon. Working product you can use today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 border border-joyxora-green/20 rounded-xl p-6 hover:border-joyxora-green/50 transition-all">
              <div className="w-12 h-12 bg-joyxora-green/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-joyxora-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-joyxora-green">AES-256-GCM Encryption</h3>
              <p className="text-green-400/70 mb-4">
                Military-grade encryption standard. Same algorithm used by governments and banks worldwide.
              </p>
              <ul className="space-y-2 text-sm text-green-400/60">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  Zero-knowledge architecture
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  Client-side encryption
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  NIST approved standard
                </li>
              </ul>
            </div>
          {/* Feature 2 */}
            <div className="bg-gray-800/50 border border-joyxora-green/20 rounded-xl p-6 hover:border-joyxora-green/50 transition-all">
              <div className="w-12 h-12 bg-joyxora-green/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-joyxora-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-joyxora-green">Mobile-Optimized</h3>
              <p className="text-green-400/70 mb-4">
                Encrypt 100MB+ files on your phone without crashing. Binary format for maximum efficiency.
              </p>
              <ul className="space-y-2 text-sm text-green-400/60">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  Works on 2GB RAM phones
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  Progress indicators
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  No browser crashes
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 border border-joyxora-green/20 rounded-xl p-6 hover:border-joyxora-green/50 transition-all">
              <div className="w-12 h-12 bg-joyxora-green/10 rounded-lg flex items-center justify-center mb-4">
                <Server className="w-6 h-6 text-joyxora-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-joyxora-green">Zero Server Access</h3>
              <p className="text-green-400/70 mb-4">
                Your files never touch our servers. Everything happens in your browser locally.
              </p>
              <ul className="space-y-2 text-sm text-green-400/60">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  No file uploads
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  No data collection
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-joyxora-green" />
                  Complete privacy
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-joyxora-green">
              How It Works
            </h2>
            <p className="text-green-400/70">
              Encrypt your first file in 30 seconds
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-joyxora-green/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-joyxora-green">
                <span className="text-2xl font-bold text-joyxora-green">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-joyxora-green">Select File</h3>
              <p className="text-sm text-green-400/60">
                Choose any file up to 100MB. Works with all file types.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-joyxora-green/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-joyxora-green">
                <span className="text-2xl font-bold text-joyxora-green">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-joyxora-green">Choose Method</h3>
              <p className="text-sm text-green-400/60">
                Password-based or random key encryption. Your choice.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-joyxora-green/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-joyxora-green">
                <span className="text-2xl font-bold text-joyxora-green">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-joyxora-green">Encrypt</h3>
              <p className="text-sm text-green-400/60">
                Watch real-time progress. No freezing. No crashes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-joyxora-green/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-joyxora-green">
                <span className="text-2xl font-bold text-joyxora-green">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-joyxora-green">Download</h3>
              <p className="text-sm text-green-400/60">
                Get your encrypted file. Decrypt anytime with your key.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-joyxora-green">
              Simple Pricing
            </h2>
            <p className="text-green-400/70">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-gray-800/50 border-2 border-joyxora-green/20 rounded-xl p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-white">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-joyxora-green">₦0</span>
                  <span className="text-green-400/60">/forever</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">3 files per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">Up to 10MB per file</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">AES-256 encryption</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">All algorithms</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">Community support</span>
                </li>
              </ul>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-gray-700 border border-joyxora-green/30 text-joyxora-green rounded-lg font-bold hover:bg-gray-600 transition-all"
              >
                Start Free
              </button>
            </div>
          {/* Pro Tier */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-joyxora-green rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-joyxora-green text-gray-900 text-xs font-bold rounded-full">
                  BEST VALUE
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-joyxora-green">₦5,000</span>
                  <span className="text-green-400/60">/month</span>
                </div>
                <p className="text-xs text-green-400/60 mt-2">~$3 USD</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80"><strong className="text-joyxora-green">Unlimited</strong> files per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">Up to <strong className="text-joyxora-green">100MB</strong> per file</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-joyxora-green flex-shrink-0 mt-0.5" />
                  <span className="text-green-400/80">Early access to new features</span>
                </li>
              </ul>

            <button
  onClick={() => setShowPayment(true)}
  className="w-full px-6 py-3 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold hover:shadow-lg hover:shadow-joyxora-green/50 transition-all flex items-center justify-center gap-2"
>
  Upgrade to Pro
  <ArrowRight className="w-5 h-5" />
</button>
              <p className="text-xs text-center text-green-400/60 mt-4">
                Price increases to ₦8,000/month when messaging launches.
              </p>
                <PaymentModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  plan="pro"
  amount={5000}
/>
            </div>
          </div>
          {/* Enterprise */}
          <div className="mt-12 text-center">
            <p className="text-green-400/70 mb-4">
              Need enterprise features? Team accounts? Custom integrations?
            </p>
            <button className="px-6 py-3 border border-joyxora-green/30 text-joyxora-green rounded-lg font-semibold hover:bg-joyxora-green/10 transition-all">
              Contact for Enterprise Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-joyxora-green">
              Coming Next
            </h2>
            <p className="text-green-400/70">
              Pro users get early access to all new features
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-800/30 border border-joyxora-green/10 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-bold text-joyxora-green mb-2">Secure Chat</h3>
              <p className="text-sm text-green-400/60">E2E encrypted messaging</p>
            </div>

            <div className="bg-gray-800/30 border border-joyxora-green/10 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold text-joyxora-green mb-2">AI Assistant</h3>
              <p className="text-sm text-green-400/60">Security advisor</p>
            </div>

            <div className="bg-gray-800/30 border border-joyxora-green/10 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-joyxora-green mb-2">App Vault</h3>
              <p className="text-sm text-green-400/60">Hide & encrypt apps</p>
            </div>

            <div className="bg-gray-800/30 border border-joyxora-green/10 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-joyxora-green mb-2">Terminal</h3>
              <p className="text-sm text-green-400/60">Command interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-joyxora-green">
              Why JoyXora?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-joyxora-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-joyxora-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-joyxora-green">Zero-Knowledge</h3>
              <p className="text-green-400/70">
                Your files never touch our servers. Everything encrypted locally in your browser.
                We can't see your data even if we wanted to.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-joyxora-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-joyxora-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-joyxora-green">Mobile-First</h3>
              <p className="text-green-400/70">
                Works on 2GB RAM phones. Encrypt 100MB+ files without crashing.
                Binary format for maximum efficiency.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-joyxora-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-joyxora-green" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-joyxora-green">Made in Nigeria</h3>
              <p className="text-green-400/70">
               Pay in Naira. No hidden fees. No foreign exchange drama.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-joyxora-green">
            Ready to Secure Your Files?
          </h2>
          <p className="text-xl text-green-400/70 mb-8">
            Join security-conscious individuals protecting their data with military-grade encryption.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-joyxora-green/50 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 bg-gray-800 border-2 border-joyxora-green text-joyxora-green rounded-lg font-bold text-lg hover:bg-gray-700 transition-all"
            >
              View Pricing
            </button>
          </div>

          <p className="text-sm text-green-400/60 mt-6">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-joyxora-green/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-joyxora-green" />
              <span className="text-lg font-bold text-joyxora-green">JOYXORA</span>
              <span className="text-xs text-green-400/60">v2.1</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-green-400/60">
              <a href="#" className="hover:text-joyxora-green transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-joyxora-green transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-joyxora-green transition-colors">Contact</a>
            </div>

            <div className="text-sm text-green-400/60">
              © 2025 JoyXora. Built in Nigeria with 💚
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-joyxora-green/10 text-center text-xs text-green-400/40">
            <p>AES-256-GCM Encryption • Zero-Knowledge Architecture • NIST Approved</p>
            <p className="mt-2">Your data never leaves your device. We can't see it. Nobody can.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

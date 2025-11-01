import React, { useState } from 'react';
import { X, Mail, Shield} from 'lucide-react';
import PaymentButton from './PaymentButton';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'pro' | 'enterprise';
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, amount }) => {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && agreed;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-joyxora-green rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-joyxora-green/30">
          <h2 className="text-xl font-bold text-joyxora-green">Upgrade to Pro</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-green-400" /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-joyxora-green/10 border border-joyxora-green/30 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-joyxora-green">₦{amount.toLocaleString()}/mo</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-joyxora-green">
              <Mail className="w-4 h-4 inline mr-1" />Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-gray-800 border border-joyxora-green/30 text-joyxora-green px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joyxora-green"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-green-300">I agree to Terms & Privacy Policy</span>
          </label>

          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Secure payment via Paystack. We never see your card.</p>
          </div>

          {isValid ? (
            <PaymentButton email={email} amount={amount} plan={plan} onClose={onClose} />
          ) : (
            <button disabled className="w-full px-6 py-3 bg-gray-700 text-gray-500 rounded-lg font-bold">
              {!email ? 'Enter email' : 'Accept terms'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

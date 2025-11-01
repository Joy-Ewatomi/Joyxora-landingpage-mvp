import React, { useEffect, useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';

interface PaymentButtonProps {
  email: string;
  amount: number;
  plan: 'pro' | 'enterprise';
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  email,
  amount,
  plan,
  onSuccess,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    setIsLoading(true);
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxx';

    if (!window.PaystackPop) {
      alert('Loading payment system...');
      setIsLoading(false);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email,
      amount: amount * 100,
      currency: 'NGN',
      ref: 'JX_' + Math.floor(Math.random() * 1000000000 + 1),
      callback: function(response: any) {
        setIsLoading(false);
        const subscription = {
          plan,
          email,
          reference: response.reference,
          amount,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem('joyxora_subscription', JSON.stringify(subscription));
        if (onSuccess) onSuccess(response.reference);
        alert('Payment successful! 🎉');
        window.location.href = '/dashboard';
      },
      onClose: function() {
        setIsLoading(false);
        if (onClose) onClose();
      }
    });
    handler.openIframe();
  };
return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full px-6 py-3 bg-gradient-to-r from-joyxora-green to-emerald-400 text-gray-900 rounded-lg font-bold hover:shadow-lg hover:shadow-joyxora-green/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Pay ₦{amount.toLocaleString()}
        </>
      )}
    </button>
  );
};

export default PaymentButton;

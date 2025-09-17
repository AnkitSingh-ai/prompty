import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, CheckCircle, Loader } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, prompt, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    bankAccount: '',
    ifscCode: ''
  });

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'netbanking', label: 'Net Banking', icon: Building },
  ];

  const handleInputChange = (field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      handleInputChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) { // MM/YY
      handleInputChange('expiryDate', formatted);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentResult = {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: prompt.price,
        method: selectedMethod,
        timestamp: new Date().toISOString()
      };

      onPaymentSuccess(paymentResult);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !prompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Prompt Details */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <img
              src={prompt.image || 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg'}
              alt={prompt.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{prompt.title}</h3>
              <p className="text-gray-400 text-sm">{prompt.category}</p>
              <p className="text-2xl font-bold text-green-400">${prompt.price}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedMethod === method.id
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-4">
            {selectedMethod === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={paymentForm.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={paymentForm.expiryDate}
                      onChange={handleExpiryChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentForm.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {selectedMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={paymentForm.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder="yourname@paytm"
                  required
                />
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={paymentForm.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="1234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={paymentForm.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    placeholder="SBIN0001234"
                    required
                  />
                </div>
              </>
            )}

            {/* Payment Summary */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white">${prompt.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Processing Fee</span>
                <span className="text-white">$0.00</span>
              </div>
              <div className="border-t border-white/10 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-xl font-bold text-green-400">${prompt.price}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Pay ${prompt.price}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
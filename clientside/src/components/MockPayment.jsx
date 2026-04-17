import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MockPayment = ({ amount, appointmentId, token, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.cardNumber || !formData.cardHolder || !formData.expiryDate || !formData.cvv) {
      toast.error('Please fill all fields');
      return false;
    }
    if (formData.cardNumber.length < 13) {
      toast.error('Invalid card number');
      return false;
    }
    if (formData.cvv.length < 3) {
      toast.error('Invalid CVV');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save payment status to backend
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/payment-done`,
        { appointmentId },
        { headers: { token } }
      );

      if (!data.success) {
        toast.error(data.message || 'Failed to confirm payment');
        return;
      }

      toast.success('Payment successful! Appointment confirmed.');
      setShowPaymentForm(false);
      setFormData({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
      onSuccess();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  if (!showPaymentForm) {
    return (
      <button
        onClick={() => setShowPaymentForm(true)}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold transition-all"
      >
        Pay ₹{amount}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Payment Details</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="16"
            />
            <p className="text-xs text-gray-500 mt-1">Test Card: 4111111111111111</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Card Holder Name</label>
            <input
              type="text"
              name="cardHolder"
              value={formData.cardHolder}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expiry (MM/YY)</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="12/25"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="4"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">Amount to Pay</p>
          <p className="text-2xl font-bold text-gray-800">₹{amount}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowPaymentForm(false)}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold transition-all"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          ⚠️ This is a mock payment for testing purposes only
        </p>
      </div>
    </div>
  );
};

export default MockPayment;

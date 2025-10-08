import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Building2,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';

interface BillingsProps {
  isDarkMode: boolean;
}

interface BillingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  color: string;
  current: boolean;
}

export const Billings: React.FC<BillingsProps> = ({ isDarkMode }) => {
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Current user's billing information (mock data - in real app, this would come from API)
  const currentBilling = {
    plan: 'Professional',
    price: '$79',
    period: '/month',
    nextBillingDate: '2024-02-15',
    status: 'active',
    features: [
      'Up to 25 property listings',
      'Advanced analytics & insights',
      'Priority support',
      'Professional photo shoots',
      'Advanced SEO & marketing tools',
      'Lead management system',
      'Custom branding'
    ]
  };

  // Available billing plans
  const billingPlans: BillingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individual developers',
      features: [
        'Up to 5 property listings',
        'Basic analytics dashboard',
        'Email support',
        'Standard property photos',
        'Basic SEO optimization'
      ],
      popular: false,
      color: 'from-blue-500 to-blue-600',
      current: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Ideal for growing development teams',
      features: [
        'Up to 25 property listings',
        'Advanced analytics & insights',
        'Priority support',
        'Professional photo shoots',
        'Advanced SEO & marketing tools',
        'Lead management system',
        'Custom branding'
      ],
      popular: true,
      color: 'from-[#C7A667] to-yellow-600',
      current: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large development companies',
      features: [
        'Unlimited property listings',
        'Real-time analytics & reporting',
        '24/7 dedicated support',
        'Professional video tours',
        'AI-powered marketing tools',
        'Advanced lead scoring',
        'White-label solution',
        'API access',
        'Custom integrations'
      ],
      popular: false,
      color: 'from-purple-500 to-purple-600',
      current: false
    }
  ];

  const handleChangePlan = (planId: string) => {
    setSelectedPlan(planId);
    setIsChangingPlan(true);
  };

  const handleConfirmChange = () => {
    // In a real app, this would make an API call to change the billing plan
    console.log('Changing plan to:', selectedPlan);
    setIsChangingPlan(false);
    setSelectedPlan(null);
  };

  const handleCancelChange = () => {
    setIsChangingPlan(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Billing & Subscription</h2>
            <p className="text-gray-600">
              Manage your subscription and billing preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Current Plan</h3>
          <motion.button
            onClick={() => setIsChangingPlan(true)}
            className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Change Plan
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#C7A667] to-yellow-600 rounded-lg">
                <Crown className="w-6 h-6 text-black" />
              </div>
              <div>
                <h4 className="text-lg font-bold">{currentBilling.plan}</h4>
                <p className="text-gray-600">Current subscription</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{currentBilling.price}</span>
              <span className="text-gray-500">{currentBilling.period}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Next billing: {new Date(currentBilling.nextBillingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Payment method: •••• 4242</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h5 className="font-medium mb-3">Included Features</h5>
            <ul className="space-y-2">
              {currentBilling.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Billing History */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold mb-6">Billing History</h3>
        
        <div className="space-y-4">
          {[
            { date: '2024-01-15', amount: '$79.00', status: 'Paid', invoice: 'INV-001' },
            { date: '2023-12-15', amount: '$79.00', status: 'Paid', invoice: 'INV-002' },
            { date: '2023-11-15', amount: '$79.00', status: 'Paid', invoice: 'INV-003' }
          ].map((invoice, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{invoice.invoice}</p>
                  <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">{invoice.amount}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {invoice.status}
                </span>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Change Plan Modal */}
      {isChangingPlan && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancelChange}
        >
          <motion.div
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
            } rounded-2xl shadow-2xl`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Change Your Plan</h2>
                <button
                  onClick={handleCancelChange}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {billingPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      plan.current
                        ? 'border-[#C7A667] bg-[#C7A667]/5'
                        : selectedPlan === plan.id
                        ? 'border-[#C7A667] shadow-lg'
                        : isDarkMode
                        ? 'border-white/10 hover:border-white/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !plan.current && setSelectedPlan(plan.id)}
                  >
                    {plan.current && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#C7A667] text-black px-4 py-1 rounded-full text-sm font-bold">
                          Current Plan
                        </span>
                      </div>
                    )}

                    {selectedPlan === plan.id && !plan.current && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          Selected
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-500 ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.current ? (
                      <div className="w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 text-center font-medium">
                        Current Plan
                      </div>
                    ) : (
                      <motion.button
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                          selectedPlan === plan.id
                            ? 'bg-[#C7A667] text-black hover:shadow-lg'
                            : isDarkMode
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>

              {selectedPlan && (
                <div className="mt-8 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Plan Change Confirmation</p>
                      <p className="text-sm text-gray-600">
                        Your new plan will be activated immediately. You'll be charged the prorated amount.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelChange}
                      className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmChange}
                      className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors"
                    >
                      Confirm Change
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

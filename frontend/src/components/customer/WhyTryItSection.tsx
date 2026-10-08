import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, ShieldCheck, HeartHandshake, Zap } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../utils/animations';

export const WhyTryItSection: React.FC = () => {
  const highlights = [
    {
      icon: ChefHat,
      title: 'Artisanal Recipes',
      desc: 'Hand-crafted creamy Alfredo, spicy Arrabbiata, crunchy burgers, and homestyle specials.',
      color: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200',
    },
    {
      icon: ShieldCheck,
      title: 'Hygienic Kitchen',
      desc: 'Strict sanitization, fresh produce, and premium dairy ingredients used in every dish.',
      color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200',
    },
    {
      icon: HeartHandshake,
      title: 'Custom Craving Friendly',
      desc: 'Craving something unique not on the menu? Tell us in the cart and our chefs will craft it!',
      color: 'from-amber-500/10 to-amber-500/5 text-amber-700 border-amber-200',
    },
    {
      icon: Zap,
      title: 'Instant WhatsApp Dispatch',
      desc: 'Zero payment gateways or hidden fees. Send your cart straight to our kitchen on WhatsApp.',
      color: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#FDF6EE] border-y border-[#EEDDCC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FE8E2A]">
            Why Choose Tryit
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B1408] mt-1 font-display">
            The Tryit Cafe & Kitchen Experience
          </h2>
          <p className="text-sm sm:text-base text-[#7A5C4A] mt-2">
            Every bite is prepared with authentic passion, cozy hospitality, and fresh flavors.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-sm hover:shadow-lg hover:border-[#FE8E2A]/50 transition-all"
              >
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-12 h-12 rounded-2xl bg-[#FBEFE1] text-[#FE8E2A] flex items-center justify-center mb-4 shadow-sm"
                >
                  <Icon size={24} />
                </motion.div>
                <h3 className="text-lg font-bold text-[#2B1408] mb-2 font-display">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5C4A] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};


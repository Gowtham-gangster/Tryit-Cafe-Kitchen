import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, CheckCircle2, MapPin, MessageCircle, ExternalLink } from 'lucide-react';
import { cafeConfig } from '../config/business';

export const PrivacyPolicyPage: React.FC = () => {
  const supportEmail = cafeConfig.getEmail() || '';

  // Scroll to top and set document title on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Tryit Cafe & Kitchen — Privacy Policy';

    // Update meta description
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute(
      'content',
      'Privacy Policy for Tryit Cafe & Kitchen. Understand how we collect, use, and protect your information when using our digital cafe services.'
    );
  }, []);

  return (
    <main className="py-10 sm:py-16 bg-[#FDF6EE] min-h-screen text-[#2B1408]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FE8E2A] hover:text-[#E67616] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Block */}
        <header className="mb-8 sm:mb-12 text-center sm:text-left border-b border-[#EEDDCC] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20 text-[#FE8E2A] text-xs font-extrabold uppercase tracking-wider mb-4">
            <Shield size={14} />
            <span>Customer Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B1408] font-display tracking-tight leading-tight">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-[#7A5C4A] mt-2 font-medium">
            Your privacy matters to us. Learn how we handle your information with care and transparency.
          </p>

          <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-xs text-[#8A7162]">
            <span className="font-semibold">Last Updated:</span>
            <span>October 5, 2026</span>
          </div>
        </header>

        {/* Content Container */}
        <article className="rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] p-6 sm:p-10 lg:p-12 shadow-sm space-y-10 sm:space-y-12 leading-relaxed">
          {/* 1. Introduction */}
          <section id="introduction" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">1.</span> Introduction
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Tryit Cafe &amp; Kitchen ("we", "our", or "the Cafe") operates this website and digital ordering interface to provide customers in Gandi Maisamma, Hyderabad with an intuitive and seamless cafe experience. Through this application, customers can:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#7A5C4A] pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Browse our curated digital food and drink menu</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>View daily promotional offers and discounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Explore the cafe ambience gallery</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Read verified customer ratings and reviews</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Manage customer profile and saved delivery locations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Calculate delivery distances and applicable charges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Dispatch itemized orders directly via WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Find our location and connect directly with the cafe</span>
              </li>
            </ul>
          </section>

          {/* 2. Information We Collect */}
          <section id="information-collected" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">2.</span> Information We Collect
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              We collect information that you provide voluntarily when creating an account, saving delivery addresses, or placing an order:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-[#2B1408]">Account Information</h3>
                <p className="text-xs text-[#7A5C4A]">
                  When registering or logging in directly, we collect your <strong>full name</strong>, <strong>email address</strong>, <strong>mobile phone number</strong>, and secure authentication credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-[#2B1408]">Google Sign-In</h3>
                <p className="text-xs text-[#7A5C4A]">
                  If you choose to authenticate via Google Identity Services, Google shares standard profile details authorized by you, including your name, verified email address, Google account identifier, and profile picture avatar. We do not receive access to your Google account password or personal files.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Delivery Location Information */}
          <section id="delivery-location" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">3.</span> Delivery Location Information
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              For orders intended for delivery, customers may provide delivery destination details:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li>Detailed delivery street address, apartment, or landmark.</li>
              <li>Geographic latitude and longitude coordinates.</li>
              <li>Custom location label such as <em>Home</em>, <em>Work</em>, or <em>Other</em>.</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#7A5C4A] bg-[#FE8E2A]/5 p-3 rounded-xl border border-[#FE8E2A]/20">
              <strong>Device Permission:</strong> Browser and device location permissions (GPS) are requested <em>only</em> if and when you explicitly tap "Use Current Location". You are always free to manually provide and edit your delivery address without enabling device GPS.
            </p>
          </section>

          {/* 4. Why Location Is Used */}
          <section id="why-location-used" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">4.</span> Why Location Is Used
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Location information is used strictly to fulfill your order and facilitate navigation:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li>Confirming delivery destination and calculating straight-line distance from Tryit Cafe &amp; Kitchen in Gandi Maisamma.</li>
              <li>Calculating transparent delivery fees based on distance tiers.</li>
              <li>Embedding accurate delivery notes, address, and a Google Maps pin link inside your prepared WhatsApp order message so our delivery staff can navigate directly to you.</li>
            </ul>
          </section>

          {/* 5. Delivery Charge Calculation */}
          <section id="delivery-calculation" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">5.</span> Delivery Charge Calculation
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              We believe in honest and transparent delivery pricing. Delivery charges are calculated automatically using the cafe's active business configuration:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">0 to 3 Kilometers</span>
                <span className="text-lg font-black text-emerald-700 font-display block mt-1">FREE DELIVERY</span>
                <p className="text-[11px] text-emerald-800/80 mt-1">No delivery fee applies for orders within our 3 km neighborhood radius.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC]">
                <span className="text-xs font-bold text-[#FE8E2A] uppercase tracking-wider block">Above 3 Kilometers</span>
                <span className="text-lg font-black text-[#2B1408] font-display block mt-1">Distance × ₹5 / km</span>
                <p className="text-[11px] text-[#7A5C4A] mt-1">Example: A delivery distance of 5 km calculates to 5 × ₹5 = ₹25 delivery charge.</p>
              </div>
            </div>
          </section>

          {/* 6. WhatsApp Ordering */}
          <section id="whatsapp-ordering" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">6.</span> WhatsApp Ordering Workflow
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              To provide zero payment gateway friction and personal kitchen communication, orders are dispatched directly via WhatsApp. When you proceed to checkout, our application formats an itemized message containing:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1 pl-1">
              <li>Customer name, contact phone number, and email.</li>
              <li>Ordered dishes, customization choices, quantities, and order subtotal.</li>
              <li>Order type (Delivery vs. Takeaway).</li>
              <li>Delivery address, distance calculation, delivery fee, and a direct Google Maps pin link (for delivery orders).</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#7A5C4A] mt-2">
              <strong>Third-Party Platform Notice:</strong> When you click the WhatsApp ordering button, you are redirected to WhatsApp (operated by Meta Platforms, Inc.). Once you leave our website, WhatsApp's own Terms of Service and Privacy Policy govern your communications and data transmission. Tryit Cafe &amp; Kitchen does not control WhatsApp's internal infrastructure.
            </p>
          </section>

          {/* 7. Saved Locations */}
          <section id="saved-locations" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">7.</span> Saved Delivery Locations
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Authenticated customers can save frequent delivery addresses (such as Home, Work, or Hostel) to their profile for faster re-ordering. These locations are associated exclusively with your account. You can view, edit, or delete any of your saved locations at any time directly through your customer profile.
            </p>
          </section>

          {/* 8. Customer Reviews */}
          <section id="reviews" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">8.</span> Customer Reviews and Ratings
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              When you submit a review or rating through our website, your submitted review text, numerical rating, and display name are saved. Approved reviews are displayed publicly to help fellow customers discover popular items. We do not publish your private contact details or phone number with your review.
            </p>
          </section>

          {/* 9. Local Storage and Session Storage */}
          <section id="cookies-storage" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">9.</span> Browser Storage and Sessions
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Our application uses standard browser <code>localStorage</code> and session state to deliver core site features:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li><strong>Authentication Token:</strong> Storing your secure JSON Web Token (JWT) so you stay signed in across browser visits.</li>
              <li><strong>Local Shopping Cart:</strong> Remembering your selected dishes while you browse different menu categories.</li>
              <li><strong>Customer Profile Cache:</strong> Retaining your name and saved preferences for seamless ordering resumption.</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              We do not deploy invasive third-party cross-site behavioral tracking cookies.
            </p>
          </section>

          {/* 10. Data Security */}
          <section id="data-security" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">10.</span> Data Security
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              We implement reasonable technical, administrative, and organizational safeguards designed to protect your personal information against unauthorized access, loss, misuse, or alteration. These measures include encrypted HTTPS transport, salted BCrypt password hashing, and role-based API authorization. However, no internet transmission or electronic storage method can ever be guaranteed to be completely impervious to vulnerabilities.
            </p>
          </section>

          {/* 11. Third-Party Services */}
          <section id="third-parties" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">11.</span> Third-Party Services
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              To deliver our digital services, we interface with trusted external service providers:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li><strong>Google Identity Services:</strong> Facilitating rapid, secure single sign-on authentication.</li>
              <li><strong>Google Maps &amp; Embeds:</strong> Rendering our cafe location map and interactive navigation pins.</li>
              <li><strong>WhatsApp:</strong> Facilitating customer-to-kitchen order transmission and communication.</li>
              <li><strong>Cloudinary:</strong> Serving optimized media photos of dishes and cafe ambience.</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Each third-party service processes data in accordance with their respective independent privacy terms.
            </p>
          </section>

          {/* 12. Children's Privacy */}
          <section id="childrens-privacy" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">12.</span> Children's Privacy
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Our services are intended for a general dining audience. We do not knowingly collect personal information from children in violation of applicable laws. If a parent or guardian discovers that their child has provided personal information without consent, please contact us so we can take prompt steps to remove such data.
            </p>
          </section>

          {/* 13. Data Retention */}
          <section id="data-retention" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">13.</span> Data Retention
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              We retain personal information for the period necessary to fulfill the purposes described in this policy, including maintaining active customer accounts, supporting ongoing customer orders, managing accounting and business records, and complying with statutory legal obligations.
            </p>
          </section>

          {/* 14. Your Choices & Rights */}
          <section id="your-choices" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">14.</span> Your Choices &amp; Rights
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              You have full autonomy over your personal information:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li>You can view and update your profile details via the Customer Profile modal.</li>
              <li>You can add, edit, or delete saved delivery addresses at any time.</li>
              <li>You can choose whether to grant or revoke device GPS location permissions in your browser settings.</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#7A5C4A] pt-1">
              For account-related deletion requests or inquiries regarding your data, please contact our support team at <a href={`mailto:${supportEmail}`} className="font-bold text-[#FE8E2A] hover:underline">{supportEmail}</a>.
            </p>
          </section>

          {/* 15. Contact Us */}
          <section id="contact-us" className="space-y-4 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">15.</span> Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data handling practices, feel free to reach out to our team:
            </p>

            <div className="rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] p-6 sm:p-8 text-center space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-[#2B1408] font-display">
                Need Help or Have a Privacy Question?
              </h3>
              <p className="text-xs sm:text-sm text-[#7A5C4A] max-w-md mx-auto">
                We're happy to answer questions or assist with your account privacy requests.
              </p>
              <div className="pt-2">
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#FE8E2A]/20 transition-all cursor-pointer min-h-[44px]"
                  aria-label={`Email support at ${supportEmail}`}
                >
                  <Mail size={16} />
                  <span>Contact Support ({supportEmail})</span>
                </a>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
};

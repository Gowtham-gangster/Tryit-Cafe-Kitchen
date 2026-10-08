import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, CheckCircle2, AlertCircle, ShoppingBag, Clock } from 'lucide-react';
import { cafeConfig } from '../config/business';

export const TermsAndConditionsPage: React.FC = () => {
  const supportEmail = cafeConfig.getEmail() || '';

  // Scroll to top and set document title on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Tryit Cafe & Kitchen — Terms & Conditions';

    // Update meta description
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute(
      'content',
      'Terms and Conditions for Tryit Cafe & Kitchen. Review our service terms, ordering guidelines, delivery calculation rules, and customer policies.'
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
            <FileText size={14} />
            <span>Service Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B1408] font-display tracking-tight leading-tight">
            Terms &amp; Conditions
          </h1>

          <p className="text-sm sm:text-base text-[#7A5C4A] mt-2 font-medium">
            Please read these terms before using Tryit Cafe &amp; Kitchen online services.
          </p>

          <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-xs text-[#8A7162]">
            <span className="font-semibold">Last Updated:</span>
            <span>October 5, 2026</span>
          </div>
        </header>

        {/* Content Container */}
        <article className="rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] p-6 sm:p-10 lg:p-12 shadow-sm space-y-10 sm:space-y-12 leading-relaxed">
          {/* 1. Acceptance of Terms */}
          <section id="acceptance" className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">1.</span> Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              By accessing, browsing, or utilizing the website and digital ordering interface provided by Tryit Cafe &amp; Kitchen ("the Cafe", "we", "us", or "our"), you ("Customer", "User", or "you") agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, please refrain from using our online services.
            </p>
          </section>

          {/* 2. Website Usage */}
          <section id="usage" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">2.</span> Permitted Website Usage
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Our website is provided exclusively for personal and non-commercial dining purposes. Customers may use the website to:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#7A5C4A] pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Browse our food, snack, pasta, and beverage menu</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>View current promotions, deals, and daily discounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Explore the cafe ambience gallery</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Read and submit customer ratings and reviews</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Save and manage personal delivery locations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#FE8E2A] shrink-0 mt-0.5" />
                <span>Prepare and dispatch itemized orders to our WhatsApp kitchen chat</span>
              </li>
            </ul>
          </section>

          {/* 3. Customer Accounts */}
          <section id="accounts" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">3.</span> Customer Accounts &amp; Security
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              When registering an account or initiating an order, you agree to:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li>Provide accurate, current, and complete personal and contact details.</li>
              <li>Provide a legitimate mobile phone number reachable via WhatsApp and phone calls for order updates.</li>
              <li>Maintain the confidentiality of your account credentials and bear responsibility for all activities conducted through your account.</li>
              <li>Notify us promptly if you suspect any unauthorized access to your account.</li>
            </ul>
          </section>

          {/* 4. Google Sign-In */}
          <section id="google-auth" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">4.</span> Google Sign-In Authentication
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Customers may choose to authenticate via Google Identity Services for simplified access. By utilizing Google Sign-In, you acknowledge that authentication is also subject to Google's Terms of Service and Privacy Policy. Tryit Cafe &amp; Kitchen is not responsible for credential management or outages originating from Google services.
            </p>
          </section>

          {/* 5. Menu Items, Descriptions & Pricing */}
          <section id="menu-pricing" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">5.</span> Menu Items and Pricing
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              All dishes, ingredients, portion sizes, preparation times, and prices displayed on our website are subject to availability and may change without prior notice. While we strive to maintain accurate live descriptions and real-time inventory tags, specific ingredients or items may temporarily sell out during peak operating hours.
            </p>
          </section>

          {/* 6. Discounts and Promotional Offers */}
          <section id="discounts-offers" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">6.</span> Discounts and Offers
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Promotional deals, coupon banners, and percentage or flat discounts displayed on the website may carry specific eligibility rules, including minimum order values, expiration dates, or category limitations. Tryit Cafe &amp; Kitchen reserves the right to modify, pause, or withdraw any promotional deal at its sole discretion.
            </p>
          </section>

          {/* 7. Delivery Services & Charges */}
          <section id="delivery" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">7.</span> Delivery Services &amp; Fees
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Delivery availability is subject to cafe operating hours, kitchen capacity, weather conditions, and delivery radius. Delivery fees are applied according to our transparent distance tier rules:
            </p>
            <div className="p-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] space-y-2 text-xs sm:text-sm text-[#7A5C4A]">
              <div className="flex items-center justify-between border-b border-[#EEDDCC]/60 pb-2">
                <span className="font-bold text-[#2B1408]">0 to 3 km (Local Radius)</span>
                <span className="font-extrabold text-emerald-600 uppercase">FREE DELIVERY</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-[#2B1408]">Above 3 km</span>
                <span className="font-extrabold text-[#FE8E2A]">Distance × ₹5 per km</span>
              </div>
            </div>
            <p className="text-[11px] text-[#7A5C4A]/90">
              The final applicable delivery charge is calculated automatically by the application's configured delivery service and presented transparently prior to dispatching your order to WhatsApp.
            </p>
          </section>

          {/* 8. Distance Calculation */}
          <section id="distance-calculation" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">8.</span> Distance Calculation Methodology
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Delivery distances are calculated between the physical cafe coordinates in Gandi Maisamma and the customer's selected delivery pin. Our application computes an <strong>estimated geographic distance</strong> using the standard Haversine mathematical model. Because this represents straight-line geographic separation, actual road driving route distance may vary based on traffic diversions, turns, and real-time street conditions.
            </p>
          </section>

          {/* 9. Orders Through WhatsApp */}
          <section id="whatsapp-flow" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">9.</span> Orders Through WhatsApp Protocol
            </h2>
            <div className="p-4 rounded-2xl bg-[#FE8E2A]/5 border border-[#FE8E2A]/20 flex items-start gap-3">
              <AlertCircle size={20} className="text-[#FE8E2A] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-[#7A5C4A]">
                <strong className="text-[#2B1408] font-bold">Important Notice on Order Dispatch:</strong>
                <p>
                  Clicking the WhatsApp button in the checkout flow generates and opens an itemized message in WhatsApp. <strong>Opening WhatsApp does NOT automatically constitute order submission or acceptance.</strong> The customer must tap the Send button in WhatsApp to transmit the order to our kitchen team.
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Workflow summary: <em>Browse Menu → Add to Cart → Proceed to Checkout → Select Delivery or Takeaway → Review Items → Open WhatsApp → Send Order to Kitchen</em>.
            </p>
          </section>

          {/* 10. Order Acceptance & Kitchen Confirmation */}
          <section id="order-acceptance" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">10.</span> Order Acceptance &amp; Kitchen Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              An order is legally accepted only after our cafe kitchen staff receives your WhatsApp message, reviews kitchen queue capacity and item availability, and explicitly replies with an order confirmation and estimated preparation time. The Cafe reserves the right to accept, adjust, request clarification on, or decline orders if dishes are unavailable or delivery addresses are outside serviceable areas.
            </p>
          </section>

          {/* 11. Online Ordering Status */}
          <section id="ordering-status" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">11.</span> Online Ordering Status &amp; Cafe Hours
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Tryit Cafe &amp; Kitchen may temporarily toggle online ordering off outside operating hours, during kitchen deep-cleaning, private events, or high in-store rush. When ordering is disabled:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li>Customers can freely explore the menu, check pricing, view gallery photos, read reviews, and view cafe location.</li>
              <li>The checkout button displays the closure notice with the scheduled re-opening time.</li>
              <li>New digital orders cannot be submitted until ordering resumes.</li>
            </ul>
          </section>

          {/* 12. Takeaway Orders */}
          <section id="takeaway" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">12.</span> Takeaway Orders
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Customers may choose the <em>Takeaway</em> option at checkout to pick up food directly from the cafe counter in Gandi Maisamma. Takeaway orders incur zero delivery fees and do not require a delivery address. Customers are responsible for picking up food promptly upon kitchen notification to enjoy maximum freshness.
            </p>
          </section>

          {/* 13. Customer-Provided Information */}
          <section id="customer-info" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">13.</span> Accuracy of Customer-Provided Information
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Customers are solely responsible for ensuring that all information provided during checkout is accurate, including dish choices, special cravings/customization requests, phone numbers, and delivery pin landmarks. Tryit Cafe &amp; Kitchen is not liable for delayed deliveries caused by incorrect phone numbers, unreachable devices, or inaccurate map pins.
            </p>
          </section>

          {/* 14. Reviews and Customer Submissions */}
          <section id="review-rules" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">14.</span> User Reviews and Conduct
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              We welcome genuine customer reviews and constructive feedback. However, users agree not to post:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[#7A5C4A] space-y-1.5 pl-1">
              <li>Abusive, defamatory, profane, threatening, or unlawful content.</li>
              <li>Spam, promotional advertisements, or fake ratings.</li>
              <li>Content that infringes upon the intellectual property or privacy rights of any third party.</li>
              <li>Impersonation of any other individual or entity.</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#7A5C4A] pt-1">
              The Cafe reserves the right to review, moderate, and remove any review that violates these community standards.
            </p>
          </section>

          {/* 15. Intellectual Property */}
          <section id="intellectual-property" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">15.</span> Intellectual Property Rights
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              All original content on this website, including but not limited to the Tryit Cafe &amp; Kitchen brand name, logo, menu curation, photographs, graphics, UI layout, and copy, is the property of Tryit Cafe &amp; Kitchen or its licensors. Unauthorized copying, scraping, modification, or distribution is prohibited without prior written consent.
            </p>
          </section>

          {/* 16. External Links & Third-Party Platforms */}
          <section id="external-links" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">16.</span> External Links &amp; Third-Party Platforms
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              Our website provides links and integrations with third-party platforms such as WhatsApp, Google Maps, and Instagram. These external services are operated independently. We do not endorse and are not liable for the content, privacy policies, or terms of third-party websites or applications.
            </p>
          </section>

          {/* 17. Service Availability & Disclaimers */}
          <section id="availability-disclaimer" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">17.</span> Service Availability &amp; Disclaimers
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              While we aim to maintain high service availability, the website and ordering system are provided on an "as-is" and "as-available" basis. Technical maintenance, telecommunication issues, or server outages may occasionally impact availability. We do not warrant that our website will be uninterrupted or error-free at all times.
            </p>
          </section>

          {/* 18. Changes to These Terms */}
          <section id="changes-to-terms" className="space-y-3 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">18.</span> Changes to These Terms
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              We reserve the right to revise or update these Terms &amp; Conditions periodically. When changes are made, the revised version will be published on this page with an updated "Last Updated" date. Continued usage of our website following any update signifies your agreement to the modified terms.
            </p>
          </section>

          {/* 19. Contact & Inquiries */}
          <section id="contact" className="space-y-4 pt-6 border-t border-[#EEDDCC]/70">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B1408] font-display flex items-center gap-2.5">
              <span className="text-[#FE8E2A]">19.</span> Contact &amp; Legal Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-[#7A5C4A]">
              For any questions, legal inquiries, or clarifications concerning these Terms &amp; Conditions, please contact us:
            </p>

            <div className="rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] p-6 sm:p-8 text-center space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-[#2B1408] font-display">
                Questions Regarding Our Terms?
              </h3>
              <p className="text-xs sm:text-sm text-[#7A5C4A] max-w-md mx-auto">
                Reach out to our customer support team and we will respond promptly.
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

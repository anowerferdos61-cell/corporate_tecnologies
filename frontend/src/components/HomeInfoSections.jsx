import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Facebook, 
  MessageSquare, 
  ChevronDown, 
  Sparkles, 
  Truck, 
  Headphones,
  ExternalLink,
  QrCode
} from 'lucide-react';

export default function HomeInfoSections() {
  const [activeFaq, setActiveFaq] = useState(0);

  const faqs = [
    {
      q: "Are Splashjet Inks 100% safe for my printer warranty and printheads?",
      a: "Yes, absolutely. Splashjet Inks are engineered in state-of-the-art ISO 9001 and ISO 14001 certified facilities specifically calibrated for Epson (Micro Piezo & PrecisionCore), Canon (FINE), and HP printheads. Every batch undergoes 3-stage microfiltration down to < 0.2 microns to guarantee zero nozzle clogging, accurate droplet ejection, and up to 70% cost reduction without damaging internal print mechanisms."
    },
    {
      q: "How can I verify genuine Splashjet ink from counterfeit copies in Bangladesh?",
      a: "Every authentic bottle of Splashjet ink imported and distributed by Corporate Technologies BD features a specialized tamper-evident seal and an official verification QR Code. Simply scan the QR code with your smartphone camera to immediately confirm the product authenticity, batch certification, and official Bangladesh distributor guarantee."
    },
    {
      q: "What warranty and after-sales service do you provide for photocopiers and printers?",
      a: "All Toshiba digital photocopiers supplied by Corporate Technologies BD include a comprehensive 1-year or 70,000 to 100,000 copies parts warranty along with 1 full year of free on-site service support. Epson, Canon, and HP printers carry official brand warranties with complete technical assistance from our factory-trained engineers."
    },
    {
      q: "How fast is nationwide delivery and does Cash on Delivery (COD) apply?",
      a: "We provide nationwide express delivery across all 64 districts in Bangladesh. Inside Dhaka City, orders are delivered within 24 hours (delivery charge ৳60). Outside Dhaka, packages arrive via trusted courier within 48 to 72 hours (delivery charge ৳120). 100% Cash on Delivery (COD) is available so you can inspect your package safely before making payment."
    },
    {
      q: "Can I place wholesale dealer orders or request corporate quotation invoices?",
      a: "Yes, we regularly cater to corporate procurement tenders, commercial press houses, photo studios, universities, and IT resellers. We provide formal corporate quotation invoices with applicable VAT/Tax compliance, tiered volume discounts, and scheduled delivery contracts. Reach our Corporate Desk at 01777-277740 or email sales@corporatetechbd.com."
    }
  ];

  return (
    <div className="w-full bg-slate-50 border-t border-slate-200/90 text-slate-800 space-y-16 py-16">
      
      {/* ========================================================
          1. ABOUT US SECTION (SEO Optimized English Content)
          ======================================================== */}
      <section id="about-us" className="max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
          
          {/* Header Tag & Title */}
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#c92127]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Corporate Technologies BD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Empowering Bangladesh’s Printing & Office Automation Since 2012
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Corporate Technologies BD is Bangladesh’s premier authorized distributor, importer, and technology solution partner for digital printing inks, commercial photocopiers, high-performance office printers, and industrial machinery.
            </p>
          </div>

          {/* Core Story / Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-slate-100 pt-6">
            <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Established with a vision to deliver genuine, high-yield, and cost-effective printing solutions, <strong>Corporate Technologies BD</strong> serves over 50,000 corporate enterprises, digital printing presses, educational institutions, photo labs, and retail businesses nationwide.
              </p>
              <p>
                We take immense pride in being the <strong>Sole Authorized Distributor of Splashjet Inks</strong> in Bangladesh. Splashjet is globally recognized in 40+ countries for its printhead-friendly formulation, vibrant color gamut, and outstanding optical density. Through our official channel, Bangladeshi businesses achieve up to <strong>70% cost savings</strong> compared to OEM consumables without sacrificing printhead longevity.
              </p>
              <p>
                Beyond inks, we are recognized specialists in <strong>Toshiba Digital Multifunctional Copiers</strong>, <strong>Epson EcoTank & Large Format Printers</strong>, <strong>Canon PIXMA & imagePROGRAF Systems</strong>, <strong>HP Ink Tank & DesignJet Plotters</strong>, and cutting-edge <strong>Direct-To-Film (DTF) & Sublimation equipment</strong>.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-[#c92127]">12+</div>
                <div className="text-xs font-bold text-slate-800">Years of Trust</div>
                <div className="text-[11px] text-slate-500">Since 2012 in BD</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-[#c92127]">50K+</div>
                <div className="text-xs font-bold text-slate-800">Satisfied Clients</div>
                <div className="text-[11px] text-slate-500">Corporate & Retail</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
                <div className="text-xs font-bold text-slate-800">Authentic Inks</div>
                <div className="text-[11px] text-slate-500">QR Verified Genuine</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-sky-600">64</div>
                <div className="text-xs font-bold text-slate-800">Districts Delivery</div>
                <div className="text-[11px] text-slate-500">Cash on Delivery</div>
              </div>
            </div>
          </div>

          {/* 4 Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <Award className="w-5 h-5 text-[#c92127] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Official Distributor</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Direct partnership with Splashjet & top OEM manufacturers</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">1-Year Service Warranty</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Reliable hardware coverage and certified engineer support</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fast Nationwide COD</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">24h inside Dhaka, 48-72h across all 64 districts in Bangladesh</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <Headphones className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Expert Technical Desk</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Proactive print troubleshooting & profiling consultation</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. FAQ SECTION (Interactive Accordions - English)
          ======================================================== */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
          
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              <HelpCircle className="w-3.5 h-3.5 text-[#c92127]" />
              <span>Frequently Asked Questions (FAQ)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Got Questions? We Have Answers.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Find detailed information about product authenticity, warranty terms, printer compatibility, and order delivery across Bangladesh.
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div className="divide-y divide-slate-100 space-y-2 border-t border-slate-100 pt-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="pt-3">
                  <button
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between py-3 text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-[#c92127] transition-colors cursor-pointer gap-4"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-red-50 text-[#c92127] text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#c92127]' : ''
                    }`} />
                  </button>

                  {isOpen && (
                    <div className="pl-9 pr-4 pb-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed animate-fadeIn">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          3. CONTACT & BRANCHES SECTION (Dhaka, CTG, Emails, FB)
          ======================================================== */}
      <section id="contact-us" className="max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
          
          {/* Header */}
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#c92127]">
              <Building2 className="w-3.5 h-3.5" />
              <span>Contact & Branch Information</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Visit Our Branches or Connect Directly
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our sales executives, customer support representatives, and certified technical team are ready to assist you.
            </p>
          </div>

          {/* 2 Main Branch Cards (Dhaka & Chittagong) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Branch 1: Dhaka Head Office */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-[#c92127] flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Dhaka Corporate Head Office</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Main Showroom & Customer Care</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white bg-[#c92127] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Headquarters
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-[#c92127] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Noakhali Tower, 9th Floor (Lift 9)</p>
                  <p className="text-slate-600 text-xs mt-0.5">55/B Purana Paltan, Dhaka-1000, Bangladesh</p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2 text-xs sm:text-sm border-t border-slate-200/70 pt-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-xs">Hotline 1 (Sales):</span>
                  <a href="tel:01777177730" className="font-bold text-slate-900 hover:text-[#c92127] transition-colors">
                    01777-177730
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-xs">Hotline 2 (Inks & Parts):</span>
                  <a href="tel:01777277740" className="font-bold text-slate-900 hover:text-[#c92127] transition-colors">
                    01777-277740
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-xs">General Manager:</span>
                  <a href="tel:01793024085" className="font-bold text-slate-900 hover:text-[#c92127] transition-colors">
                    01793-024085
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Saturday – Thursday: <strong>9:30 AM – 7:30 PM</strong> (Friday Closed)</span>
              </div>
            </div>

            {/* Branch 2: Chittagong Regional Branch */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Chattogram Regional Branch</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Sales & Technical Service Hub</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Regional Office
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Chittagong Commercial Hub</p>
                  <p className="text-slate-600 text-xs mt-0.5">Agrabad / GEC Circle, Chattogram, Bangladesh</p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2 text-xs sm:text-sm border-t border-slate-200/70 pt-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-xs">Branch Manager:</span>
                  <a href="tel:01897779010" className="font-bold text-slate-900 hover:text-[#c92127] transition-colors">
                    01897-779010
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-xs">Sales Department:</span>
                  <a href="tel:01897779009" className="font-bold text-slate-900 hover:text-[#c92127] transition-colors">
                    01897-779009
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-xs">Support & Complain:</span>
                  <a href="tel:01897779001" className="font-bold text-slate-900 hover:text-[#c92127] transition-colors">
                    01897-779001
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Saturday – Thursday: <strong>9:30 AM – 7:30 PM</strong> (Friday Closed)</span>
              </div>
            </div>

          </div>

          {/* Emails & Official Facebook Social Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            
            {/* General Email */}
            <a 
              href="mailto:info@corporatetechbd.com"
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-red-50/50 border border-slate-200/80 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#c92127] flex items-center justify-center border border-slate-200 group-hover:border-[#c92127] transition-colors shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 font-semibold">General Enquiries</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#c92127] transition-colors">
                  info@corporatetechbd.com
                </div>
              </div>
            </a>

            {/* Sales Email */}
            <a 
              href="mailto:sales@corporatetechbd.com"
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-red-50/50 border border-slate-200/80 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-slate-200 group-hover:border-emerald-600 transition-colors shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 font-semibold">Corporate & Sales</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#c92127] transition-colors">
                  sales@corporatetechbd.com
                </div>
              </div>
            </a>

            {/* Official Facebook Page */}
            <a 
              href="https://www.facebook.com/corporatetechnologiesbd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#1877F2]/5 hover:bg-[#1877F2]/10 border border-[#1877F2]/20 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-[#1877F2] font-bold flex items-center gap-1">
                    <span>Official Facebook Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#1877F2] transition-colors">
                    @corporatetechnologiesbd
                  </div>
                </div>
              </div>
            </a>

          </div>

        </div>
      </section>

    </div>
  );
}

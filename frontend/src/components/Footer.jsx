import React from 'react';
import { Phone, MapPin, Mail, Facebook, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CorporateLogo from './CorporateLogo';

/**
 * Corporate Technologies Authentic Footer
 * - Linked Useful Links (Scroll to on-page #faq, #about-us, #contact-us for maximum SEO, no popups)
 * - Popular Category Fast Links
 * - Complete Dhaka & Chittagong branches, official hotlines, emails, and Facebook page
 */
export default function Footer({ onNavigate, onOpenAdmin }) {
  const { setSelectedCategory, setSearchQuery, setPriceRange } = useCart();

  const handleCategoryClick = (categoryName, slug = null) => {
    if (onNavigate && slug) {
      onNavigate(`/product-category/${slug}/`, categoryName);
      return;
    }
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setPriceRange([0, 500000]);
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigate) {
      onNavigate('/');
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  };

  return (
    <footer className="bg-[#ededed] text-slate-700 text-sm mt-16 border-t border-slate-200">
      
      {/* Main 4-Column Footer Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <CorporateLogo variant="dark" className="h-9 sm:h-10" />
            </div>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed max-w-xs">
              Bangladesh's premier authorized distributor for Splashjet Digital Printing Inks, Toshiba Copiers, Epson, Canon & HP Printers. Trusted ICT partner since 2012.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-[#c92127]/10 text-[#c92127] text-xs font-bold px-3 py-1 rounded-full border border-[#c92127]/20">
                Authorized Distributor
              </span>
            </div>
          </div>

          {/* Column 2: Useful Links (Smooth Scroll for SEO) */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Useful Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
              <li>
                <button 
                  onClick={() => handleScrollToSection('faq')}
                  className="hover:text-[#c92127] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>FAQ (Frequently Asked Questions)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection('about-us')}
                  className="hover:text-[#c92127] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>About Us (Corporate Overview)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection('contact-us')}
                  className="hover:text-[#c92127] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Contact & Branches (Dhaka & CTG)</span>
                </button>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/corporatetechnologiesbd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1877F2] transition-colors cursor-pointer text-left flex items-center gap-1.5 font-medium"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Facebook Official Page</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Now */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Popular Now
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
              <li>
                <button 
                  onClick={() => handleCategoryClick('Splashjet Ink', 'splashjet-ink')}
                  className="hover:text-[#c92127] transition-colors cursor-pointer text-left hover:underline flex items-center justify-between w-full pr-4"
                >
                  <span>Splashjet Ink</span>
                  <span className="text-[11px] text-slate-400">→</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('Photocopy Machine', 'photocopy-machine')}
                  className="hover:text-[#c92127] transition-colors cursor-pointer text-left hover:underline flex items-center justify-between w-full pr-4"
                >
                  <span>Photocopy Machine</span>
                  <span className="text-[11px] text-slate-400">→</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('Printers', 'printers')}
                  className="hover:text-[#c92127] transition-colors cursor-pointer text-left hover:underline flex items-center justify-between w-full pr-4"
                >
                  <span>Printers</span>
                  <span className="text-[11px] text-slate-400">→</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('Ready Business Setup', 'ready-business-setup')}
                  className="hover:text-[#c92127] transition-colors cursor-pointer text-left hover:underline flex items-center justify-between w-full pr-4"
                >
                  <span>Ready Business Setup</span>
                  <span className="text-[11px] text-slate-400">→</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Branches */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Get in Touch
            </h4>
            
            <div className="space-y-3 text-xs sm:text-[13px] text-slate-600">
              {/* Dhaka Branch Phone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c92127] flex-shrink-0" />
                <div>
                  <a href="tel:01777177730" className="hover:text-[#c92127] font-semibold transition-colors">
                    01777-177730
                  </a>
                  <span className="text-slate-400 mx-1">/</span>
                  <a href="tel:01777277740" className="hover:text-[#c92127] font-semibold transition-colors">
                    01777-277740
                  </a>
                </div>
              </div>

              {/* Chattogram Branch Phone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">CTG: </span>
                  <a href="tel:01897779010" className="hover:text-[#c92127] font-semibold transition-colors">
                    01897-779010
                  </a>
                  <span className="text-slate-400 mx-1">/</span>
                  <a href="tel:01897779009" className="hover:text-[#c92127] font-semibold transition-colors">
                    01897-779009
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-800 flex-shrink-0" />
                <a href="mailto:info@corporatetechbd.com" className="hover:text-[#c92127] font-medium transition-colors">
                  info@corporatetechbd.com
                </a>
              </div>

              {/* Head Office Address */}
              <div className="flex items-start gap-2.5 pt-0.5">
                <MapPin className="w-4 h-4 text-[#c92127] flex-shrink-0 mt-0.5" />
                <a 
                  href="https://maps.google.com/?q=Noakhali+Tower+Purana+Paltan+Dhaka" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#c92127] leading-relaxed transition-colors"
                >
                  55/B Purana Paltan, Noakhali Tower (Lift 9), Dhaka-1000
                </a>
              </div>

              {/* Facebook Page Button */}
              <div className="pt-1">
                <a 
                  href="https://www.facebook.com/corporatetechnologiesbd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-semibold text-xs transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Follow us on Facebook</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Line */}
      <div className="border-t border-slate-300/80 py-5 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-center gap-2">
        <p>© {new Date().getFullYear()} Corporate Technologies BD. All rights reserved.</p>
        <span className="hidden sm:inline">|</span>
        <p>100% Genuine Products Guarantee with Official Service Support across Bangladesh</p>
        {onOpenAdmin && (
          <>
            <span className="hidden sm:inline">|</span>
            <button
              onClick={onOpenAdmin}
              className="text-slate-400 hover:text-[#c92127] text-xs transition-colors cursor-pointer"
            >
              {/* Admin Dashboard */}
            </button>
          </>
        )}
      </div>

    </footer>
  );
}

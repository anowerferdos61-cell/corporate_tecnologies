import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  X, 
  MessageSquare
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState('call'); // 'call' | 'whatsapp'
  const widgetRef = useRef(null);
  const { isCartOpen, isCheckoutOpen } = useCart();

  // Close widget when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Hide floating widget when user has opened cart drawer or checkout modal to avoid any obstruction
  if (isCartOpen || isCheckoutOpen) return null;

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  // Contact list data matching corporatetechbd.com screenshots
  const contacts = {
    dhaka: [
      { role: 'GENERAL', number: '01777-177730', clean: '8801777177730' },
      { role: 'GENERAL', number: '01777-277740', clean: '8801777277740' },
      { role: 'GENERAL MANAGER', number: '01793-024085', clean: '8801793024085' }
    ],
    chittagong: [
      { role: 'BRANCH MANAGER', number: '01897-779010', clean: '8801897779010', highlight: true },
      { role: 'SALES', number: '01897-779009', clean: '8801897779009' },
      { role: 'COMPLAIN', number: '01897-779001', clean: '8801897779001' }
    ]
  };

  return (
    <div ref={widgetRef} className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end">
      
      {/* Contact Popup Box matching corporatetechbd.com */}
      {isOpen && (
        <div className="mb-3 w-[310px] sm:w-[330px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale origin-bottom-right transition-all">
          
          {/* 1. Header (Red with title & Corporate Technologies) */}
          <div className="bg-[#c92127] text-white p-4 px-5 flex items-start justify-between">
            <div>
              <h3 className="text-base font-extrabold tracking-tight leading-tight">
                যোগাযোগ করুন
              </h3>
              <p className="text-xs text-red-100 font-medium mt-0.5">
                Corporate Technologies
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Body with Accordion Options */}
          <div className="p-3 space-y-2.5 max-h-[72vh] overflow-y-auto">
            
            {/* ACCORDION 1: সরাসরি কল করুন (DIRECT CALL) */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('call')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#c92127] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#c92127]" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                    সরাসরি কল করুন
                  </span>
                </div>
                {openSection === 'call' ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Call Content */}
              {openSection === 'call' && (
                <div className="p-3 pt-1 space-y-3 bg-white border-t border-slate-100">
                  {/* Dhaka Section */}
                  <div>
                    <div className="bg-red-50/70 text-[#c92127] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-1.5">
                      DHAKA
                    </div>
                    <div className="space-y-1.5">
                      {contacts.dhaka.map((c, i) => (
                        <a
                          key={i}
                          href={`tel:${c.clean}`}
                          className="flex items-center justify-between p-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group cursor-pointer"
                        >
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {c.role}
                            </div>
                            <div className="text-xs sm:text-[13px] font-extrabold text-slate-800 group-hover:text-[#c92127] transition-colors">
                              {c.number}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#c92127] transition-transform group-hover:translate-x-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Chittagong Section */}
                  <div>
                    <div className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-1.5">
                      CHITTAGONG
                    </div>
                    <div className="space-y-1.5">
                      {contacts.chittagong.map((c, i) => (
                        <a
                          key={i}
                          href={`tel:${c.clean}`}
                          className="flex items-center justify-between p-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group cursor-pointer"
                        >
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {c.role}
                            </div>
                            <div className="text-xs sm:text-[13px] font-extrabold text-slate-800 group-hover:text-[#c92127] transition-colors">
                              {c.number}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#c92127] transition-transform group-hover:translate-x-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 2: WhatsApp করুন (WHATSAPP CHAT) */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('whatsapp')}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                    WhatsApp করুন
                  </span>
                </div>
                {openSection === 'whatsapp' ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* WhatsApp Content */}
              {openSection === 'whatsapp' && (
                <div className="p-3 pt-1 space-y-3 bg-white border-t border-slate-100">
                  {/* Dhaka Section */}
                  <div>
                    <div className="bg-red-50/70 text-[#c92127] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-1.5">
                      DHAKA
                    </div>
                    <div className="space-y-1.5">
                      {contacts.dhaka.map((c, i) => (
                        <a
                          key={i}
                          href={`https://wa.me/${c.clean}?text=Hello%20Corporate%20Technologies`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 px-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all group cursor-pointer"
                        >
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {c.role}
                            </div>
                            <div className="text-xs sm:text-[13px] font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors">
                              {c.number}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Chittagong Section */}
                  <div>
                    <div className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-1.5">
                      CHITTAGONG
                    </div>
                    <div className="space-y-1.5">
                      {contacts.chittagong.map((c, i) => (
                        <a
                          key={i}
                          href={`https://wa.me/${c.clean}?text=Hello%20Corporate%20Technologies`}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center justify-between p-2.5 px-3 rounded-xl border transition-all group cursor-pointer ${
                            c.highlight 
                              ? 'bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100/80' 
                              : 'bg-slate-50 hover:bg-emerald-50/60 border-slate-100 hover:border-emerald-200'
                          }`}
                        >
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {c.role}
                            </div>
                            <div className={`text-xs sm:text-[13px] font-extrabold transition-colors ${
                              c.highlight ? 'text-emerald-900' : 'text-slate-800 group-hover:text-emerald-700'
                            }`}>
                              {c.number}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 3. Floating Red Trigger Button (sleek and compact) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Corporate Technologies"
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#c92127] hover:bg-[#b91c1c] text-white flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-3 ring-red-100/90"
        title="যোগাযোগ করুন"
      >
        {isOpen ? (
          <X className="w-5 h-5 stroke-[2.5]" />
        ) : (
          <div className="relative">
            {/* Chat Bubble Icon with 3 Dots matching screenshot */}
            <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-white" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-12 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-1.5 ring-white animate-pulse" />
          </div>
        )}
      </button>

    </div>
  );
}

import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const STACKED_INK_CARDS = [
  {
    id: 'large-format',
    number: '01',
    tag: 'Large Format & Plotters',
    title: 'Large Format Printer Ink',
    subtitle: 'Wide-Format Inks For Banners, Posters, CAD & Photo Albums',
    desc: 'Engineered specifically for high-volume large format plotters including Canon imagePROGRAF, Epson SureColor, and HP DesignJet. Delivers vivid wide color gamut, razor-sharp line precision, and exceptional fade resistance for professional print shops.',
    highlights: [
      'Rich optical density & deep black reproduction for CAD/GIS drawings',
      'Instant dry formulation on vinyl, canvas, photo paper & banner media',
      'Ultra-micro filtered pigment & dye inks preventing printhead clogging'
    ],
    slug: 'splashjet-ink/large-format-printer-ink',
    image: '/splashjet_images/ink-cat-large-format.png',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    accentBorder: 'border-slate-200 hover:border-amber-400',
    glowColor: 'bg-amber-400/10'
  },
  {
    id: 'desktop-printer',
    number: '02',
    tag: 'Desktop & Office Refill',
    title: 'Desktop Printer Ink',
    subtitle: 'Reliable High-Yield Refill Inks for Epson, Canon, HP & Brother',
    desc: 'Cost-effective OEM-quality refill inks designed for Epson EcoTank (003, 664, 673), Canon MegaTank, and HP Smart Tank printers. Achieve sharp, professional document prints and brilliant photo reproduction with up to 70% cost savings.',
    highlights: [
      'Save up to 70% printing cost compared to OEM cartridges',
      'Specialized color-matched formulas for accurate photo & text prints',
      'Printhead-friendly pH balanced composition ensuring long head life'
    ],
    slug: 'splashjet-ink/desktop-printer-ink',
    image: '/splashjet_images/ink-cat-desktop-printer.png',
    badgeColor: 'bg-red-100 text-[#c92127] border-red-200',
    accentBorder: 'border-slate-200 hover:border-red-400',
    glowColor: 'bg-red-500/10'
  },
  {
    id: 'digital-textile',
    number: '03',
    tag: 'Textile & Apparel Printing',
    title: 'Digital Textile Printing Ink',
    subtitle: 'Sublimation, DTF & DTG Inks For Fabrics & Garment Customization',
    desc: 'Advanced digital textile inks formulated for direct-to-film (DTF), dye sublimation, and direct-to-garment (DTG) printing. Provides intense color depth, superior wash fastness, and a soft, breathable hand feel on cotton, polyester, and blends.',
    highlights: [
      'Grade 4+ wash & rub fastness with zero peeling or cracking',
      'Ultra-vibrant fluorescent transfers with exceptional edge sharpness',
      'Optimized for Epson i3200, XP600, TX800 & DX5 industrial heads'
    ],
    slug: 'splashjet-ink/digital-textile-printing-ink',
    image: '/splashjet_images/ink-cat-digital-textile.png',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    accentBorder: 'border-slate-200 hover:border-purple-400',
    glowColor: 'bg-purple-500/10'
  },
  {
    id: 'industrial-inkjet',
    number: '04',
    tag: 'Industrial & Packaging Inks',
    title: 'Industrial Inkjet Ink',
    subtitle: 'Coding, Marking & Packaging Inks for High-Speed Systems',
    desc: 'Heavy-duty industrial inkjet inks and TIJ 2.5 cartridges engineered for high-speed automated packaging lines, batch coding, QR code printing, and expiry dates. Instant drying on both porous and non-porous surfaces.',
    highlights: [
      'Sub-second instant drying on plastics, metals, glass & coated carton',
      'High-contrast smudge-proof barcodes with 100% optical readability',
      'Engineered for continuous 24/7 high-speed production environments'
    ],
    slug: 'splashjet-ink/industrial-inkjet-ink',
    image: '/splashjet_images/ink-cat-industrial-inkjet.png',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    accentBorder: 'border-slate-200 hover:border-blue-400',
    glowColor: 'bg-blue-500/10'
  }
];

export default function SplashjetStickyShowcase({ onNavigate }) {
  const handleClick = (slug, title) => {
    if (onNavigate) {
      onNavigate(`/product-category/${slug}/`, title);
    }
  };

  return (
    <section className="hidden md:block w-full py-12 lg:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#c92127] text-xs font-black uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Splashjet Digital Inks</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Application Specific Ink Formulations
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Scroll to explore specialized Splashjet ink solutions engineered for your printing needs
          </p>
        </div>

        {/* STICKY STACKING CARDS CONTAINER */}
        <div className="relative space-y-24 pb-12">
          {STACKED_INK_CARDS.map((card, idx) => (
            <div
              key={card.id}
              style={{
                top: '110px',
                zIndex: 10 + idx * 5
              }}
              className={`sticky rounded-3xl border ${card.accentBorder} bg-white shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group`}
              onClick={() => handleClick(card.slug, card.title)}
            >
              {/* Solid 100% Opaque Card Background Layer */}
              <div className="absolute inset-0 bg-white z-0" />
              
              {/* Ambient Glow Background Element */}
              <div className={`absolute -right-20 -bottom-20 w-96 h-96 ${card.glowColor} rounded-full blur-3xl pointer-events-none z-0`} />

              <div className="relative z-10 p-8 lg:p-12 grid grid-cols-12 gap-8 items-center bg-white">
                
                {/* LEFT CONTENT COLUMN (7 cols) */}
                <div className="col-span-7 flex flex-col justify-between space-y-5">
                  <div>
                    {/* Top Meta Line: Number + Tag */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl lg:text-3xl font-black text-slate-300 font-mono tracking-tighter">
                        {card.number}
                      </span>
                      <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${card.badgeColor}`}>
                        {card.tag}
                      </span>
                    </div>

                    {/* Main Card Title */}
                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-[#c92127] transition-colors leading-tight mb-2">
                      {card.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-sm font-bold text-slate-700 leading-snug mb-3">
                      {card.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {card.highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2.5 text-xs lg:text-[13px] text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#c92127] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(card.slug, card.title);
                      }}
                      className="bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs lg:text-sm font-black px-6 py-3 rounded-full shadow-md hover:shadow-lg flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
                    >
                      <span>Explore Inks & Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                      View full collection →
                    </span>
                  </div>
                </div>

                {/* RIGHT IMAGE COLUMN (5 cols) */}
                <div className="col-span-5 flex items-center justify-center relative">
                  <div className="w-full h-72 lg:h-84 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs p-6 flex items-center justify-center overflow-hidden group-hover:border-slate-300 transition-all">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/splashjet_images/about-splashjet.jpg';
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

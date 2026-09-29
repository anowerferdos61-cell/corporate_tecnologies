import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Corporate Technologies BD';
const BASE_URL = 'https://corporatetechbd.com';
const DEFAULT_IMAGE = 'https://corporatetechbd.com/splashjet_images/about-splashjet.jpg';
const DEFAULT_DESCRIPTION = 'Corporate Technologies BD - বাংলাদেশে Epson, Canon, HP, Brother প্রিন্টার, তোশিবা ফটোকপিয়ার এবং অফিসিয়াল Splashjet Ink ও টোনারের সবচেয়ে বিশ্বস্ত প্রতিষ্ঠান। ১ বছরের সার্ভিস ওয়ারেন্টি ও সারাদেশে দ্রুত ডেলিভারি।';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  productData = null,
  schema = null,
  noIndex = false,
  isHome = false,
  prefixBrand = false,
}) {
  const location = useLocation();

  // 1. Clean Title formatting: Always prioritize brand name first on homepage
  let fullTitle = `${SITE_NAME} | প্রিন্টার, ফটোকপিয়ার ও অফিসিয়াল Splashjet Ink`;
  
  if (isHome || location.pathname === '/') {
    fullTitle = title && title.startsWith(SITE_NAME) 
      ? title 
      : `${SITE_NAME} | ${title || 'প্রিন্টার, ফটোকপিয়ার ও অফিসিয়াল Splashjet Ink'}`;
  } else if (title) {
    fullTitle = prefixBrand ? `${SITE_NAME} | ${title}` : `${title} | ${SITE_NAME}`;
  }

  // 2. Pure Clean Canonical URL (Stripping query strings/tracking params for duplicate content protection)
  const cleanPath = (location.pathname || '/').replace(/\/+$/, '') || '/';
  const resolvedCanonical = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${BASE_URL}${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}`)
    : `${BASE_URL}${cleanPath}`;

  // 3. Absolute image URL formatting
  const resolvedImage = ogImage.startsWith('http') 
    ? ogImage 
    : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  // 4. Clean description for meta tags
  const cleanDescription = (description || DEFAULT_DESCRIPTION)
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  // 5. Authoritative E-commerce Product Schema generator
  let structuredDataList = [];

  if (schema) {
    if (Array.isArray(schema)) {
      structuredDataList.push(...schema);
    } else {
      structuredDataList.push(schema);
    }
  }

  if (productData) {
    const productPrice = Number(productData.sale_price || productData.regular_price || 0);
    const inStock = productData.stock_quantity === undefined || Number(productData.stock_quantity) > 0;
    
    // Construct Valid Schema Offer without fabricated 0 price or hardcoded fake dates
    const offerObj = {
      '@type': 'Offer',
      url: resolvedCanonical,
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    };

    if (productPrice > 0) {
      offerObj.priceCurrency = 'BDT';
      offerObj.price = productPrice.toString();
    }

    const productSchema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: productData.title || title,
      image: resolvedImage ? [resolvedImage] : [],
      description: cleanDescription,
      sku: productData.sku || productData.id ? String(productData.sku || productData.id) : undefined,
      category: productData.category || undefined,
      offers: offerObj,
    };

    // Only add Brand if valid and not empty (no fake default branding)
    if (productData.brand && String(productData.brand).trim() !== '') {
      productSchema.brand = {
        '@type': 'Brand',
        name: String(productData.brand).trim(),
      };
    }

    // Only add AggregateRating if genuine review data exists in the database
    const reviewCountNum = Number(productData.reviews_count);
    const ratingNum = Number(productData.rating || productData.rating_score);
    if (reviewCountNum > 0 && ratingNum > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: ratingNum.toString(),
        reviewCount: reviewCountNum,
      };
    }

    structuredDataList.push(productSchema);
  }

  return (
    <Helmet>
      {/* Standard HTML Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={cleanDescription} />
      <link rel="canonical" href={resolvedCanonical} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <meta name="author" content={SITE_NAME} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:type" content={productData ? 'product' : ogType} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="bn_BD" />

      {/* E-Commerce OpenGraph Product Meta Tags */}
      {productData && (
        <>
          {Number(productData.sale_price || productData.regular_price || 0) > 0 && (
            <>
              <meta property="product:price:amount" content={String(productData.sale_price || productData.regular_price)} />
              <meta property="product:price:currency" content="BDT" />
            </>
          )}
          <meta property="product:availability" content={(productData.stock_quantity === undefined || Number(productData.stock_quantity) > 0) ? 'instock' : 'oos'} />
          <meta property="product:condition" content="new" />
          {productData.brand && <meta property="product:brand" content={String(productData.brand).trim()} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Structured Data (JSON-LD) for Google Rich Snippets */}
      {structuredDataList.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(structuredDataList.length === 1 ? structuredDataList[0] : structuredDataList)}
        </script>
      )}
    </Helmet>
  );
}

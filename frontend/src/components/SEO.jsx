import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Corporate Technologies BD';
const BASE_URL = 'https://corporatetechbd.com';
const DEFAULT_IMAGE = 'https://corporatetechbd.com/splashjet_images/about-splashjet.jpg';
const DEFAULT_DESCRIPTION = 'Corporate Technologies BD - বাংলাদেশে Epson, Canon, HP, Brother প্রিন্টার, তোশিবা ফটোকপিয়ার এবং অফিসিয়াল Splashjet Ink ও টোনারের সবচেয়ে বিশ্বস্ত প্রতিষ্ঠান। ১ বছরের সার্ভিস ওয়ারেন্টি ও সারাদেশে দ্রুত ডেলিভারি।';
const DEFAULT_KEYWORDS = 'printer price in bangladesh, photocopier dhaka, epson printer bangladesh, canon printer price, hp printer dhaka, toshiba copier price, original ink bangladesh, brother printer bd, splashjet ink bd, dtf ink bangladesh, office equipment dhaka, corporate technologies bd';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  productData = null,
  schema = null,
  noIndex = false,
}) {
  const location = useLocation();

  // 1. Title formatting
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | প্রিন্টার, ফটোকপিয়ার ও অফিসিয়াল Splashjet Ink`;

  // 2. Canonical URL handling
  const resolvedCanonical = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${BASE_URL}${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}`)
    : `${BASE_URL}${location.pathname}${location.search}`;

  // 3. Absolute image URL formatting
  const resolvedImage = ogImage.startsWith('http') 
    ? ogImage 
    : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  // 4. Clean description for meta tags
  const cleanDescription = (description || DEFAULT_DESCRIPTION)
    .replace(/<[^>]*>?/gm, '') // Strip HTML if passed rich description
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  // 5. Automatic E-commerce Product Schema generator if productData is provided
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
    
    const productSchema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: productData.title || title,
      image: resolvedImage ? [resolvedImage] : [],
      description: cleanDescription,
      sku: productData.sku || productData.id || `CT-${productData.slug}`,
      brand: {
        '@type': 'Brand',
        name: productData.brand || 'Corporate Technologies BD',
      },
      category: productData.category || 'Printers & Photocopiers',
      offers: {
        '@type': 'Offer',
        url: resolvedCanonical,
        priceCurrency: 'BDT',
        price: productPrice > 0 ? productPrice.toString() : '0',
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      },
    };

    if (productData.rating || productData.rating_score) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: productData.rating || productData.rating_score || '4.9',
        reviewCount: productData.reviews_count || 12,
      };
    }

    structuredDataList.push(productSchema);
  }

  return (
    <Helmet>
      {/* Standard HTML Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={cleanDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={resolvedCanonical} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <meta name="author" content={SITE_NAME} />

      {/* Bangladesh & Local GEO-Targeting Tags (Local SEO) */}
      <meta name="geo.region" content="BD-13" />
      <meta name="geo.placename" content="Dhaka, Bangladesh" />
      <meta name="geo.position" content="23.8103;90.4125" />
      <meta name="ICBM" content="23.8103, 90.4125" />
      <meta name="language" content="Bengali, English" />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:type" content={productData ? 'product' : ogType} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="bn_BD" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* E-Commerce OpenGraph Product Meta Tags */}
      {productData && (
        <>
          <meta property="product:price:amount" content={String(productData.sale_price || productData.regular_price || 0)} />
          <meta property="product:price:currency" content="BDT" />
          <meta property="product:availability" content={(productData.stock_quantity === undefined || Number(productData.stock_quantity) > 0) ? 'instock' : 'oos'} />
          <meta property="product:condition" content="new" />
          <meta property="product:brand" content={productData.brand || 'Corporate Technologies'} />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:domain" content="corporatetechbd.com" />

      {/* Structured Data (JSON-LD) for Google Rich Snippets & AI Engines */}
      {structuredDataList.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(structuredDataList.length === 1 ? structuredDataList[0] : structuredDataList)}
        </script>
      )}
    </Helmet>
  );
}

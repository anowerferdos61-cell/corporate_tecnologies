/**
 * Smooth Curved Fly-to-Cart Animation
 * Clones the product image thumbnail and flies it along an arc trajectory
 * directly into the Cart icon in the Navbar, then pulses the cart badge!
 */
export function flyToCartAnimation(imageSrc, startEventOrElement = null) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Locate the destination cart button
  const cartBtn = document.getElementById('navbar-cart-button') || 
                  document.querySelector('[aria-label="Shopping Cart"]');
  
  let destX = window.innerWidth - 45;
  let destY = 35;

  if (cartBtn) {
    const rect = cartBtn.getBoundingClientRect();
    destX = rect.left + rect.width / 2;
    destY = rect.top + rect.height / 2;
  }

  // 2. Calculate origin coordinates
  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;

  if (startEventOrElement) {
    if (typeof startEventOrElement.clientX === 'number' && typeof startEventOrElement.clientY === 'number') {
      originX = startEventOrElement.clientX;
      originY = startEventOrElement.clientY;
    } else if (startEventOrElement.target && typeof startEventOrElement.target.getBoundingClientRect === 'function') {
      const rect = startEventOrElement.target.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    } else if (typeof startEventOrElement.getBoundingClientRect === 'function') {
      const rect = startEventOrElement.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }
  }

  // 3. Create the flying thumbnail element
  const flyer = document.createElement('div');
  flyer.style.position = 'fixed';
  flyer.style.zIndex = '99999';
  flyer.style.left = `${originX - 26}px`;
  flyer.style.top = `${originY - 26}px`;
  flyer.style.width = '52px';
  flyer.style.height = '52px';
  flyer.style.borderRadius = '16px';
  flyer.style.backgroundColor = '#ffffff';
  flyer.style.border = '2px solid #c92127';
  flyer.style.boxShadow = '0 10px 25px rgba(201, 33, 39, 0.45), 0 4px 10px rgba(0, 0, 0, 0.15)';
  flyer.style.display = 'flex';
  flyer.style.alignItems = 'center';
  flyer.style.justifyContent = 'center';
  flyer.style.pointerEvents = 'none';
  flyer.style.overflow = 'hidden';

  const img = document.createElement('img');
  img.src = imageSrc || '/splashjet_images/about-splashjet.jpg';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.style.padding = '4px';
  img.onerror = () => { img.src = '/splashjet_images/about-splashjet.jpg'; };

  flyer.appendChild(img);
  document.body.appendChild(flyer);

  // 4. Parabolic Flight Curve Animation
  const deltaX = destX - originX;
  const deltaY = destY - originY;
  const arcHeight = Math.min(100, Math.abs(deltaY) * 0.4 + 30);

  const keyframes = [
    { 
      transform: 'translate(0px, 0px) scale(0.6) rotate(0deg)', 
      opacity: 0.8 
    },
    { 
      transform: 'translate(0px, 0px) scale(1.15) rotate(-10deg)', 
      opacity: 1,
      offset: 0.18
    },
    { 
      transform: `translate(${deltaX * 0.45}px, ${deltaY * 0.3 - arcHeight}px) scale(0.85) rotate(15deg)`, 
      opacity: 1,
      offset: 0.55
    },
    { 
      transform: `translate(${deltaX}px, ${deltaY}px) scale(0.18) rotate(25deg)`, 
      opacity: 0.15 
    }
  ];

  try {
    const animation = flyer.animate(keyframes, {
      duration: 650,
      easing: 'cubic-bezier(0.25, 0.9, 0.35, 1)',
      fill: 'forwards'
    });

    animation.onfinish = () => {
      flyer.remove();

      // 5. Trigger Cart bounce and badge pop
      if (cartBtn) {
        cartBtn.classList.remove('animate-cart-bounce');
        void cartBtn.offsetWidth; // force reflow
        cartBtn.classList.add('animate-cart-bounce');
        setTimeout(() => {
          cartBtn.classList.remove('animate-cart-bounce');
        }, 650);

        const badge = document.getElementById('navbar-cart-badge');
        if (badge) {
          badge.classList.remove('animate-badge-pop');
          void badge.offsetWidth;
          badge.classList.add('animate-badge-pop');
          setTimeout(() => {
            badge.classList.remove('animate-badge-pop');
          }, 450);
        }
      }
    };
  } catch {
    // Fallback for environments where Web Animations API isn't available
    setTimeout(() => {
      flyer.remove();
    }, 650);
  }
}

// WhatsApp Share Utility Functions

export interface PropertyShareData {
  title: string;
  location: string;
  price: string;
  imageUrl?: string;
  description?: string;
  propertyUrl: string;
}

// Helper function to format price consistently
const formatPrice = (price: string): string => {
  // If price already contains currency symbol, return as is
  if (price.includes('KSh') || price.includes('$') || price.includes('€') || price.includes('£')) {
    return price;
  }
  
  // If it's a number, add KSh prefix
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
  if (!isNaN(numericPrice)) {
    return `KSh ${numericPrice.toLocaleString()}`;
  }
  
  return price;
};

// Helper function to create a short tagline from description (one line)
const createTagline = (description?: string): string => {
  if (!description) return '';
  
  // Remove line breaks and extra spaces
  const cleanDescription = description.replace(/\s+/g, ' ').trim();
  
  // Take first sentence or first 80 characters for one line
  const firstSentence = cleanDescription.split('.')[0];
  if (firstSentence.length <= 80) {
    return firstSentence;
  }
  
  return cleanDescription.substring(0, 80) + '...';
};

// Helper function to create a short URL (mock implementation)
const createShortUrl = (url: string): string => {
  // For now, we'll use a simple approach
  // In production, you could integrate with bit.ly, tinyurl, or your own shortener
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const propertyId = pathParts[pathParts.length - 1];
  
  // Create a shorter URL format
  return `${urlObj.origin}/p/${propertyId}`;
};

export const createWhatsAppShareMessage = (property: PropertyShareData): string => {
  const {
    title,
    location,
    price,
    imageUrl,
    description,
    propertyUrl
  } = property;

  // Format the data
  const formattedPrice = formatPrice(price);
  const tagline = createTagline(description);
  const shortUrl = createShortUrl(propertyUrl);

  // Create clean, structured WhatsApp message
  const whatsappMessage = `🏡 *${title}*

📍 *Location:* ${location}
💰 *Price:* ${formattedPrice}

${tagline ? `📝 *Description:* ${tagline}` : ''}

🖼️ *Property Image:* ${imageUrl || 'Image available on website'}

🔗 *View Full Details:* ${shortUrl}

*Powered by Realaist - Your Trusted Real Estate Partner*`;

  return whatsappMessage;
};

export const shareToWhatsApp = (property: PropertyShareData): void => {
  try {
    const message = createWhatsAppShareMessage(property);
    const encodedMessage = encodeURIComponent(message);
    
    // Detect if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let whatsappUrl: string;
    
    if (isMobile) {
      // For mobile, use WhatsApp app directly
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    } else {
      // For desktop, use WhatsApp Web
      whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    }
    
    // Try to open WhatsApp
    const newWindow = window.open(whatsappUrl, '_blank');
    
    // Fallback for mobile if WhatsApp app is not installed
    if (isMobile && newWindow) {
      setTimeout(() => {
        if (newWindow.closed) {
          // If the window closed immediately, WhatsApp app might not be installed
          // Fallback to WhatsApp Web
          window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
        }
      }, 1000);
    }
  } catch (err) {
    console.error('WhatsApp share failed:', err);
    alert('Could not share on WhatsApp.');
  }
};

// Shorten URL utility (optional - can be implemented with a URL shortener service)
export const shortenUrl = async (url: string): Promise<string> => {
  // For now, return the original URL
  // In production, you could integrate with bit.ly, tinyurl, or your own shortener
  return url;
};

// Enhanced share function with URL shortening
export const shareToWhatsAppWithShortUrl = async (property: PropertyShareData): Promise<void> => {
  try {
    const shortUrl = await shortenUrl(property.propertyUrl);
    const propertyWithShortUrl = { ...property, propertyUrl: shortUrl };
    shareToWhatsApp(propertyWithShortUrl);
  } catch (err) {
    console.error('WhatsApp share with short URL failed:', err);
    // Fallback to regular share
    shareToWhatsApp(property);
  }
};

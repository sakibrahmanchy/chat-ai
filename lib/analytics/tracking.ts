interface LocationData {
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
}

interface UserData {
  ip?: string;
  location?: LocationData;
  userAgent?: string;
  referrer?: string;
  screenResolution?: string;
  language?: string;
  timezone?: string;
  platform?: string;
  browser?: {
    name?: string;
    version?: string;
    os?: string;
    mobile?: boolean;
  };
  device?: {
    type?: string;
    brand?: string;
    model?: string;
  };
}

function getBrowserInfo(): { name: string; version: string; os: string; mobile: boolean } {
  const ua = navigator.userAgent;
  let browser = { name: 'unknown', version: 'unknown', os: 'unknown', mobile: false };

  // Detect mobile
  browser.mobile = /Mobile|Android|iP(hone|od|ad)/.test(ua);

  // Detect OS
  if (ua.includes('Windows')) browser.os = 'Windows';
  else if (ua.includes('Mac')) browser.os = 'MacOS';
  else if (ua.includes('Linux')) browser.os = 'Linux';
  else if (ua.includes('Android')) browser.os = 'Android';
  else if (ua.includes('iOS')) browser.os = 'iOS';

  // Detect browser
  if (ua.includes('Firefox')) {
    browser.name = 'Firefox';
    browser.version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
  } else if (ua.includes('Chrome')) {
    browser.name = 'Chrome';
    browser.version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
  } else if (ua.includes('Safari')) {
    browser.name = 'Safari';
    browser.version = ua.match(/Version\/([0-9.]+)/)?.[1] || '';
  } else if (ua.includes('Edge')) {
    browser.name = 'Edge';
    browser.version = ua.match(/Edge\/([0-9.]+)/)?.[1] || '';
  }

  return browser;
}

export async function getUserData(): Promise<UserData> {
  try {
    // Get IP and location data
    const locationResponse = await fetch('http://ip-api.com/json/?fields=66846719');
    const locationData = await locationResponse.json();

    const browser = getBrowserInfo();
    
    // Get browser and system info
    const userData: UserData = {
      ip: locationData.query,
      location: {
        country: locationData.country,
        countryCode: locationData.countryCode,
        region: locationData.region,
        regionName: locationData.regionName,
        city: locationData.city,
        zip: locationData.zip,
        lat: locationData.lat,
        lon: locationData.lon,
        timezone: locationData.timezone,
        isp: locationData.isp,
        org: locationData.org,
        as: locationData.as
      },
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      browser: {
        name: browser.name,
        version: browser.version,
        os: browser.os,
        mobile: browser.mobile
      },
      device: {
        type: browser.mobile ? 'mobile' : 'desktop',
        brand: 'unknown', // Could be enhanced with more detailed device detection
        model: 'unknown'
      }
    };

    // Store data in localStorage for future checks
    localStorage.setItem('userIp', userData.ip || '');
    localStorage.setItem('userLocation', JSON.stringify(userData.location));

    return userData;
  } catch (error) {
    console.error('Error getting user data:', error);
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
  }
} 
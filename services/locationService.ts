export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const getAddressName = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding (Free, requires User-Agent)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8', // Request Korean results
          'User-Agent': 'CarrotCloneApp/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error("Failed to fetch address");
    
    const data = await response.json();
    const addr = data.address;
    
    // Prioritize neighborhood level names for "Dong" style addresses
    // Korea address structure usually has: borough (Gu), quarter (Dong)
    return addr.quarter || addr.neighbourhood || addr.suburb || addr.village || addr.city_district || addr.city || "내 위치";
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "위치 정보 없음";
  }
};

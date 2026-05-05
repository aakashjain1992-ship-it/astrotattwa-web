export interface IndianCity {
  name: string
  state: string
  lat: number
  lng: number
  timezone: string  // always "Asia/Kolkata"
}

export const INDIAN_CITIES: IndianCity[] = [
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, timezone: 'Asia/Kolkata' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, timezone: 'Asia/Kolkata' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, timezone: 'Asia/Kolkata' },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, timezone: 'Asia/Kolkata' },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, timezone: 'Asia/Kolkata' },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, timezone: 'Asia/Kolkata' },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, timezone: 'Asia/Kolkata' },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, timezone: 'Asia/Kolkata' },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, timezone: 'Asia/Kolkata' },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, timezone: 'Asia/Kolkata' },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, timezone: 'Asia/Kolkata' },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573, timezone: 'Asia/Kolkata' },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, timezone: 'Asia/Kolkata' },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, timezone: 'Asia/Kolkata' },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, timezone: 'Asia/Kolkata' },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, timezone: 'Asia/Kolkata' },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, timezone: 'Asia/Kolkata' },
  { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064, timezone: 'Asia/Kolkata' },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973, timezone: 'Asia/Kolkata' },
  { name: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433, timezone: 'Asia/Kolkata' },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304, timezone: 'Asia/Kolkata' },
  { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, timezone: 'Asia/Kolkata' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463, timezone: 'Asia/Kolkata' },
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096, timezone: 'Asia/Kolkata' },
  { name: 'Howrah', state: 'West Bengal', lat: 22.5958, lng: 88.2636, timezone: 'Asia/Kolkata' },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, timezone: 'Asia/Kolkata' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864, timezone: 'Asia/Kolkata' },
  { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828, timezone: 'Asia/Kolkata' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, timezone: 'Asia/Kolkata' },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243, timezone: 'Asia/Kolkata' },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, timezone: 'Asia/Kolkata' },
  { name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296, timezone: 'Asia/Kolkata' },
  { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648, timezone: 'Asia/Kolkata' },
  { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794, timezone: 'Asia/Kolkata' },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, timezone: 'Asia/Kolkata' },
  { name: 'Solapur', state: 'Maharashtra', lat: 17.6805, lng: 75.9064, timezone: 'Asia/Kolkata' },
  { name: 'Hubli', state: 'Karnataka', lat: 15.3647, lng: 75.1240, timezone: 'Asia/Kolkata' },
  { name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394, timezone: 'Asia/Kolkata' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047, timezone: 'Asia/Kolkata' },
  { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304, timezone: 'Asia/Kolkata' },
  { name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lng: 78.0880, timezone: 'Asia/Kolkata' },
  { name: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lng: 78.7733, timezone: 'Asia/Kolkata' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732, timezone: 'Asia/Kolkata' },
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366, timezone: 'Asia/Kolkata' },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, timezone: 'Asia/Kolkata' },
  { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lng: 75.7804, timezone: 'Asia/Kolkata' },
  { name: 'Thrissur', state: 'Kerala', lat: 10.5276, lng: 76.2144, timezone: 'Asia/Kolkata' },
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, timezone: 'Asia/Kolkata' },
  { name: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8828, timezone: 'Asia/Kolkata' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, timezone: 'Asia/Kolkata' },
  { name: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941, timezone: 'Asia/Kolkata' },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, timezone: 'Asia/Kolkata' },
  { name: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865, timezone: 'Asia/Kolkata' },
  { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192, timezone: 'Asia/Kolkata' },
  { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460, timezone: 'Asia/Kolkata' },
  { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lng: 77.7567, timezone: 'Asia/Kolkata' },
  { name: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lng: 77.7172, timezone: 'Asia/Kolkata' },
  { name: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325, timezone: 'Asia/Kolkata' },
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322, timezone: 'Asia/Kolkata' },
  { name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lng: 78.1642, timezone: 'Asia/Kolkata' },
  { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676, timezone: 'Asia/Kolkata' },
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, timezone: 'Asia/Kolkata' },
  { name: 'Manali', state: 'Himachal Pradesh', lat: 32.2396, lng: 77.1887, timezone: 'Asia/Kolkata' },
  { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lng: 74.8570, timezone: 'Asia/Kolkata' },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, timezone: 'Asia/Kolkata' },
  { name: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lng: 74.6399, timezone: 'Asia/Kolkata' },
  { name: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119, timezone: 'Asia/Kolkata' },
  { name: 'Pushkar', state: 'Rajasthan', lat: 26.4897, lng: 74.5511, timezone: 'Asia/Kolkata' },
  { name: 'Jaisalmer', state: 'Rajasthan', lat: 26.9157, lng: 70.9083, timezone: 'Asia/Kolkata' },
  { name: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lng: 77.6737, timezone: 'Asia/Kolkata' },
  { name: 'Vrindavan', state: 'Uttar Pradesh', lat: 27.5794, lng: 77.6963, timezone: 'Asia/Kolkata' },
  { name: 'Bodh Gaya', state: 'Bihar', lat: 24.6961, lng: 84.9914, timezone: 'Asia/Kolkata' },
  { name: 'Amravati', state: 'Maharashtra', lat: 20.9320, lng: 77.7523, timezone: 'Asia/Kolkata' },
  { name: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lng: 74.2433, timezone: 'Asia/Kolkata' },
  { name: 'Sangli', state: 'Maharashtra', lat: 16.8524, lng: 74.5815, timezone: 'Asia/Kolkata' },
  { name: 'Latur', state: 'Maharashtra', lat: 18.4088, lng: 76.5604, timezone: 'Asia/Kolkata' },
  { name: 'Nanded', state: 'Maharashtra', lat: 19.1383, lng: 77.3210, timezone: 'Asia/Kolkata' },
  { name: 'Akola', state: 'Maharashtra', lat: 20.7059, lng: 77.0077, timezone: 'Asia/Kolkata' },
]

/** Haversine formula — returns distance in km */
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** Return closest `count` cities sorted by distance ascending */
export function getNearbyIndianCities(lat: number, lng: number, count = 3): IndianCity[] {
  return INDIAN_CITIES
    .map(city => ({ city, dist: getDistanceKm(lat, lng, city.lat, city.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(entry => entry.city)
}

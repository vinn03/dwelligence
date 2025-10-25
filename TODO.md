# Post-Hackathon TODOs

## Security: Google Maps API Key Configuration

### Problem
Currently using the same API key for both frontend and backend, which exposes the key in the browser.

### Solution
Set up proper API key restrictions in Google Cloud Console:

**Option 1: Two Separate Keys (Recommended)**
1. Create **Frontend Key**:
   - Restrict to: HTTP referrers only (`yourdomain.com/*`)
   - Enable only: Maps JavaScript API
   - Update: `frontend/.env` → `VITE_GOOGLE_MAPS_API_KEY`

2. Create **Backend Key**:
   - Restrict to: IP addresses only (your server IP)
   - Enable: Distance Matrix API, Directions API, Geocoding API
   - Update: `backend/.env` → `GOOGLE_MAPS_API_KEY`

**Option 2: Single Key with Dual Restrictions**
- Add both HTTP referrer AND IP address restrictions to existing key
- Works from your domain AND your server, but nowhere else

### Why This Matters
- Prevents API key abuse if someone copies it from browser DevTools
- Limits blast radius if key is compromised
- Follows security best practices

### Resources
- [Google Maps API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [API Key Restrictions](https://cloud.google.com/docs/authentication/api-keys#api_key_restrictions)

# 🏡 Dwelligence

**Smart real estate search powered by commute intelligence and AI**

Dwelligence reimagines property search by prioritizing what matters most: **where you work and how you'll get there**. Set your workplace, choose your transport mode, and instantly see commute times for every listing. AI-powered search understands natural language queries like "2BR near parks under $2500" and delivers ranked results based on your lifestyle needs.

Built during a 36-hour hackathon to solve a real problem: finding the perfect apartment shouldn't require opening 20 browser tabs to check commute times.

---

## ✨ Features

### 🗺️ **Commute-First Property Search**

- **Set your workplace** and see commute times overlaid on every property listing
- **Multi-modal routing**: Drive 🚗, Bike 🚴, Transit 🚈, or Walk 🚶
- **Interactive map** with property markers, routes, and nearby amenities
- **Smart ranking**: Properties sorted by commute time + price for your perfect balance

### 🤖 **AI-Powered Search**

- **Natural language queries**: "2 bedroom apartments near coffee shops under $3000"
- **Gemini AI integration**: Understands preferences, filters ambiguity, ranks intelligently
- **Ask about neighborhoods**: Chat with AI about nearby amenities for any property
- **POI discovery**: Find grocery stores, gyms, restaurants near your future home

### 🏘️ **Neighborhood Intelligence**

- **Amenity visualization**: See parks, cafes, transit stops within walking/biking/driving distance
- **H3 geospatial indexing**: Lightning-fast proximity queries across 8 amenity types
- **Transport-aware filtering**: Amenities adjust based on your preferred transport mode
- **Interactive hex boundaries**: Visualize your walkable/bikeable neighborhood

### 🎯 **Advanced Filtering**

- **Rent vs. Buy toggle**: Switch between rental and for-sale properties
- **Price, bedrooms, bathrooms, property type** (apartments + house rentals)
- **Persistent filters**: Your preferences are saved across sessions
- **Real-time updates**: Map refreshes as you pan and zoom

### ⭐ **Favorites & Comparisons**

- **Save properties** to your favorites (persisted in localStorage)
- **Quick access tab**: Review saved listings anytime
- **Compare commutes**: See how different properties stack up

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Google Maps API key with Distance Matrix, Directions, Geocoding, and Places APIs enabled
- Gemini API key (for AI features)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/dwelligence.git
cd dwelligence

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Database

**Option A: Supabase (Recommended)**

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project and save your database password
3. Get your connection string from Project Settings → Database

**Option B: Local PostgreSQL**

```bash
createdb dwelligence
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):

```env
DATABASE_URL=postgresql://user:password@host:5432/database
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env`):

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:3001/api
```

### 4. Initialize Database

```bash
cd backend

# Run schema
node scripts/run-schema.js

# Seed with 252 Bay Area properties
npm run seed

# Calculate H3 indexes for amenity features
node scripts/calculateH3ForProperties.js

# (Optional) Fetch real amenity data from OpenStreetMap
node scripts/fetchOSMAmenities.js
```

### 5. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Visit `http://localhost:5173` and start exploring! 🎉

---

## 📚 Tech Stack

### Frontend

- **React 19** - Modern UI library with concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **@vis.gl/react-google-maps** - Official Google Maps React library
- **React Context API** - Global state management
- **Axios** - HTTP client for API requests

### Backend

- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Relational database with geospatial queries
- **Google Maps APIs** - Distance Matrix, Directions, Geocoding, Places
- **Gemini API** - AI-powered natural language processing and ranking
- **H3** - Uber's hexagonal hierarchical spatial index
- **node-cache** - In-memory caching for API responses

### Infrastructure

- **Supabase** - Managed PostgreSQL hosting
- **OpenStreetMap** - Open-source amenity data via Overpass API

---

## 🏗️ Architecture

### Component Structure

```
App
├── Header
│   ├── ListingTypeToggle (Rent/Buy)
│   ├── SearchBar (with AI toggle)
│   ├── AskBar (AI natural language search)
│   ├── WorkplaceInput
│   ├── TransportModeToggle
│   └── Filters
├── MapContainer
│   ├── PropertyMarkers
│   ├── Tooltip (hover preview)
│   ├── RoutePolylines (commute visualization)
│   ├── AmenityMarkers (nearby amenities)
│   ├── POIMarkers (AI search results)
└── RightPanel
    ├── TabsContainer (Top Picks / AI Results / Favorites)
    └── DetailedListingView
        ├── Details Tab
        ├── Commute Tab (route alternatives)
        ├── Nearby Tab (amenity visualization)
        └── Ask Tab (AI neighborhood chat)
```

### Data Flow

1. **User sets workplace** → Stored in Context + localStorage
2. **Map viewport changes** → Debounced API call to `/api/properties/map-bounds`
3. **Properties returned** → Filtered by listing type, price, beds, baths
4. **Commute calculation** → Batch request to Google Distance Matrix API (cached 24h)
5. **Properties ranked** → Sorted by commute time + price
6. **Markers rendered** → Displayed on map with commute times

### Database Schema

```sql
properties (
  id, address, lat, lng, price, bedrooms, bathrooms,
  sq_ft, property_type, sale_type, image_url,
  h3_index_r7, h3_index_r6, h3_index_r5  -- Geospatial indexes
)

amenities (
  id, name, type, lat, lng, address, osm_id,
  h3_index_r7, h3_index_r6, h3_index_r5
)
```

**No PostGIS required!** Uses simple `BETWEEN` queries for lat/lng viewport filtering and H3 string matching for proximity queries.

---

## 🎨 Key Features in Detail

### 1. Commute Calculation Engine

- **Batch optimization**: Single Distance Matrix API call for up to 25 properties
- **Multi-modal routing**: Separate calculations for drive, bike, transit, walk
- **Intelligent caching**: 24-hour cache per property-workplace-mode combination
- **Route alternatives**: Up to 3 route options with polyline visualization
- **Real-time traffic**: Incorporates current traffic conditions

### 2. AI Search & Ranking (Gemini Integration)

**Query Parsing:**

```javascript
"2BR near parks under $2500"
→ {
    bedrooms: { min: 2, max: 2 },
    priceRange: { max: 2500 },
    amenityPreferences: ["park"],
    transportMode: "walking"
  }
```

**Intelligent Ranking:**

- Combines structured filters with natural language understanding
- Considers commute time, price, amenities, and user intent
- Provides human-readable explanations for each ranking

**Neighborhood Chat:**

- Ask questions like "Are there any coffee shops nearby?"
- Returns top 5 places with ratings, hours, photos from Google Places API
- Markers numbered on map for easy reference

### 3. H3 Geospatial Indexing

**Multi-resolution indexing** for different transport modes:

- **Resolution 7** (~1.22km edge): Walking distance
- **Resolution 6** (~3.23km edge): Biking distance
- **Resolution 5** (~8.54km edge): Driving distance

**Fast proximity queries:**

```sql
SELECT * FROM amenities
WHERE h3_index_r7 = property.h3_index_r7
-- Returns all amenities in same hex (milliseconds)
```

### 4. Performance Optimizations

- ⚡ **Debounced map updates** (500ms) to reduce API calls
- 🗺️ **Viewport limiting** to 100 properties max
- 💾 **Aggressive caching** (commutes, geocoding results)
- 🎯 **Lazy loading** for detailed property views
- 🌐 **Raster/Vector map toggle** for low bandwidth

---

## 📊 Dataset

**252 Bay Area Properties** across:

- **San Francisco** - 30 rentals, 25 for-sale, 5 house rentals
- **Oakland** - 15 rentals, 15 for-sale, 5 house rentals
- **Berkeley** - 12 rentals, 12 for-sale, 4 house rentals
- **Palo Alto** - 15 rentals, 15 for-sale, 3 house rentals
- **San Jose** - 15 rentals, 15 for-sale, 5 house rentals
- **Mountain View, Sunnyvale, Santa Clara** - 15 rentals, 15 for-sale, 4 house rentals
- **Fremont, Hayward, San Mateo** - 14 rentals, 14 for-sale, 4 house rentals

**Property Types:**

- 🏢 **Apartment rentals**: $2,000-$5,500/month (1-4BR)
- 🏠 **House rentals**: $2,200-$4,000/month (1-3BR, apartment-level specs)
- 🏘️ **For-sale properties**: $625K-$2.8M (1-5BR, mix of apartments and houses)

**Amenity Coverage:** 8 categories (parks, grocery, cafes, restaurants, transit, gyms, pharmacies, community centers) sourced from OpenStreetMap

---

## 🛠️ Development Workflow

### Running Migrations

```bash
cd backend
node scripts/runMigrations.js
```

### Seeding Database

```bash
# Clear and reseed
npm run seed

# Calculate H3 indexes
node scripts/calculateH3ForProperties.js

# Fetch amenities from OSM
node scripts/fetchOSMAmenities.js
```

### API Testing

```bash
# Test property search
curl http://localhost:3001/api/properties

# Test AI search
curl -X POST http://localhost:3001/api/search/ai \
  -H "Content-Type: application/json" \
  -d '{"query": "2 bedroom near parks", "workplace": {"lat": 37.7749, "lng": -122.4194}}'

# Test commute calculation
curl -X POST http://localhost:3001/api/commute/calculate \
  -H "Content-Type: application/json" \
  -d '{"workplace": {"lat": 37.7749, "lng": -122.4194}, "propertyIds": [1,2,3], "mode": "transit"}'
```

---

## 🚢 Deployment

### Recommended Setup: Vercel + Render

**Frontend (Vercel):**

```bash
cd frontend
vercel --prod
```

Set environment variables in Vercel dashboard:

- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_API_URL` (your Render backend URL)

**Backend (Render):**

1. Create new Web Service
2. Connect GitHub repo, select `backend` directory
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `DATABASE_URL`
   - `GOOGLE_MAPS_API_KEY`
   - `GEMINI_API_KEY`

**Database (Render PostgreSQL):**

- Free tier includes persistent PostgreSQL
- Automatic backups and SSL connections

---

## 🎯 Roadmap

### Phase 1: Core Features ✅

- [x] Map-based property search
- [x] Commute calculation and visualization
- [x] Multi-modal transport routing
- [x] Basic filters and favorites
- [x] Rent/Buy toggle

### Phase 2: AI Integration ✅

- [x] Natural language search with Gemini
- [x] Intelligent property ranking
- [x] Neighborhood chat (Ask AI)
- [x] POI discovery and visualization

### Phase 3: Amenity Intelligence ✅

- [x] H3 geospatial indexing
- [x] Nearby amenity visualization
- [x] Transport-mode-aware proximity
- [x] OpenStreetMap integration

### Phase 4: Enhancements (Future)

- [ ] User accounts and saved searches
- [ ] Email alerts for new listings
- [ ] School district overlays
- [ ] Crime and walkability scores
- [ ] Virtual tours integration
- [ ] Collaborative search (share with roommates/family)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

This was a hackathon project, but contributions are welcome! Areas for improvement:

- **Testing**: Add unit and integration tests
- **Accessibility**: Improve ARIA labels and keyboard navigation
- **Performance**: Optimize large dataset rendering
- **Mobile UX**: Enhance responsive design for mobile devices
- **Documentation**: Add inline code documentation

---

## 📝 License

MIT License - feel free to use this project for learning or inspiration!

---

## 🙏 Acknowledgments

- **Google Maps Platform** for powerful geospatial APIs
- **Gemini API** for natural language AI capabilities
- **Uber H3** for elegant hexagonal spatial indexing
- **OpenStreetMap** for open-source amenity data
- **Supabase** for reliable managed PostgreSQL hosting
- **Tailwind CSS** for making styling enjoyable

---

## 📧 Contact

Built with ❤️ during a 36-hour hackathon. Questions or feedback? Open an issue!

**Live Demo:** [Coming soon]

**Video Demo:** [Coming soon]

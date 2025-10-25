# Dwelligence

A map-based real estate search platform that integrates multimodal transportation scoring and workplace commute estimates directly into the listing experience.

## Project Structure

```
dwelligence/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/       # Header with search, workplace, filters
│   │   │   ├── Map/          # Google Maps integration
│   │   │   ├── RightPanel/   # Side panel with tabs
│   │   │   ├── Listing/      # Reusable property card
│   │   │   └── Shared/       # Shared components
│   │   ├── context/          # React Context for state management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   ├── utils/            # Utility functions
│   │   └── App.jsx           # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Node.js + Express backend
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (Maps, DB)
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Express server
│   ├── scripts/              # Database scripts
│   │   ├── schema.sql        # Database schema
│   │   └── seed-database.js  # Seed script
│   └── package.json
│
└── README.md
```

## Component Hierarchy

```
App
├── Header
│   ├── SearchBar
│   ├── WorkplaceInput
│   ├── TransportModeToggle
│   └── Filters
├── MapContainer
│   ├── PropertyMarker (multiple)
│   └── Tooltip
│       └── Listing (compact view)
└── RightPanel
    ├── TabsContainer
    └── Listing (multiple, full view)
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- Google Maps API key
- (Optional) Gemini API key for Iteration 3

### Database Setup (Supabase)

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com) and sign up
   - Create a new project
   - Save your database password!

2. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy the connection string (URI format)
   - Replace `[YOUR-PASSWORD]` with your actual password

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `.env` with your credentials:
   ```bash
   DATABASE_URL=your_supabase_connection_string
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Run the schema on Supabase:
   ```bash
   node scripts/run-schema.js
   ```

5. Seed the database with San Francisco properties:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   VITE_API_URL=http://localhost:3001/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## Iteration 1 Features (MVP)

- ✅ Map-based property viewing
- ✅ Workplace setting
- ✅ Multi-modal commute calculations (Drive, Bike, Transit, Walk)
- ✅ Basic filters (price, bedrooms, bathrooms, property type)
- ✅ Favorites (localStorage)
- ✅ Ranked property list (by commute time + price)

## Iteration 2 Features (Future)

- Property clustering on map
- Amenity awareness (parks, cafes, transit stops, etc.)
- H3 geospatial indexing for fast proximity queries
- Amenity badges on property cards

## Iteration 3 Features (Future)

- AI-powered natural language search with Gemini
- Intelligent property summaries
- Conversational search refinement

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties with filters
- `GET /api/properties/map-bounds` - Get properties in viewport with filters
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (testing)

### Commute
- `POST /api/commute/calculate` - Calculate commutes for properties
- `GET /api/commute/batch` - Batch calculate commutes for bounds

## Technologies

### Frontend
- React 19
- Vite
- Tailwind CSS
- @vis.gl/react-google-maps
- Axios
- React Context API

### Backend
- Node.js
- Express
- PostgreSQL (Supabase) with simple lat/lng columns
- Google Maps APIs (Distance Matrix, Geocoding)
- H3 geospatial indexing (Iteration 2)
- node-cache

## Development Notes

- The app uses React Context for state management (see `AppContext.jsx`)
- Favorites and workplace are persisted to localStorage
- Commute calculations are cached for 24 hours
- Properties are limited to 100 per viewport to maintain performance
- Default city: San Francisco, CA with 10 sample properties
- No PostGIS required - uses simple BETWEEN queries for viewport filtering

## License

MIT

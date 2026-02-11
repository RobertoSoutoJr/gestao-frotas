# FleetPro - Fleet Management System

Enterprise-grade fleet management system with financial and operational control, built with modern technologies and clean architecture principles.

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express 5.2**
- **Supabase** (PostgreSQL)
- **Zod** - Schema validation
- **CORS** enabled
- Layered architecture (Routes → Controllers → Services)

### Frontend
- **React 19.2** + **Vite 7.3**
- **Tailwind CSS 4.1** - Modern utility-first CSS
- **Recharts** - Interactive data visualizations
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client with interceptors

## 📁 Project Structure

```
gestao-frotas/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic layer
│   │   ├── routes/          # API endpoints
│   │   ├── validators/      # Zod schemas
│   │   ├── middlewares/     # Error handling & logging
│   │   └── server.js        # Express app entry point
│   ├── .env                 # Environment variables (not tracked)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/          # Reusable UI components
    │   │   ├── forms/       # Form components
    │   │   └── layout/      # Layout components
    │   ├── pages/           # Page components
    │   ├── hooks/           # Custom React hooks
    │   ├── services/        # API service layer
    │   ├── lib/             # Utility functions
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    └── package.json
```

## 🏗️ Backend Architecture

### Layered Architecture

**Routes → Controllers → Services → Database**

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle requests, validate input, send responses
- **Services**: Business logic, database operations
- **Validators**: Zod schemas for type-safe validation

### API Endpoints

#### Trucks (`/caminhoes`)
```
GET    /caminhoes           - List all trucks
GET    /caminhoes/:id       - Get truck by ID
POST   /caminhoes           - Create new truck
PUT    /caminhoes/:id       - Update truck
DELETE /caminhoes/:id       - Delete truck
```

#### Drivers (`/motoristas`)
```
GET    /motoristas          - List all drivers
GET    /motoristas/:id      - Get driver by ID
POST   /motoristas          - Create new driver
PUT    /motoristas/:id      - Update driver
DELETE /motoristas/:id      - Delete driver
```

#### Fuel Records (`/abastecimentos`)
```
GET    /abastecimentos                      - List all fuel records
GET    /abastecimentos/:id                  - Get fuel record by ID
GET    /abastecimentos/truck/:truckId       - Get records by truck
GET    /abastecimentos/truck/:truckId/consumption - Calculate consumption
POST   /abastecimentos                      - Create fuel record
```

#### Maintenance (`/manutencoes`)
```
GET    /manutencoes                 - List all maintenance records
GET    /manutencoes/:id             - Get maintenance by ID
GET    /manutencoes/truck/:truckId  - Get records by truck
GET    /manutencoes/truck/:truckId/stats - Get statistics
POST   /manutencoes                 - Create maintenance record
```

### Validation Schemas

All endpoints are protected with **Zod** validation:
- License plate format validation (ABC-1234 or ABC1D23)
- CPF format validation
- Phone number format validation
- Year, mileage, and monetary value constraints
- Maintenance type enum validation

### Error Handling

Global error handler with:
- Zod validation errors → 400 (detailed field errors)
- Operational errors → Custom status codes
- Unknown errors → 500 (logged)
- Development mode includes stack traces

## 🎨 Frontend Architecture

### Component-Based Design

#### UI Components (`/components/ui`)
- **Button** - Multiple variants (primary, success, danger, outline, ghost)
- **Input** - Labeled inputs with error states
- **Select** - Dropdown with validation
- **Card** - Container with header, title, description, content
- **Badge** - Status indicators
- **Spinner** - Loading states
- **EmptyState** - No data placeholders
- **Toast** - Notification system

#### Form Components (`/components/forms`)
- **TruckForm** - Vehicle registration
- **DriverForm** - Driver registration
- **FuelForm** - Fuel record creation
- **MaintenanceForm** - Maintenance logging

#### Pages
- **TrucksPage** - Fleet management
- **DriversPage** - Team management
- **FuelPage** - Fuel tracking
- **MaintenancePage** - Maintenance logging
- **ReportsPage** - Financial analytics with charts

### Custom Hooks

#### `useFleet()`
Centralized state management for all fleet data:
```jsx
const { trucks, drivers, fuelRecords, maintenanceRecords, loading, error, refetch } = useFleet();
```

#### `useToast()`
Toast notification system:
```jsx
const { toasts, toast, success, error, dismiss } = useToast();
success('Title', 'Description');
error('Error', 'Something went wrong');
```

### Service Layer

Axios-based API client with:
- Centralized base URL configuration
- Response interceptors for error handling
- Automatic data extraction
- Type-safe service functions

## 📊 Features

### Core Functionality
- ✅ Truck registration and management
- ✅ Driver registration and management
- ✅ Fuel consumption tracking
- ✅ Maintenance record logging
- ✅ Financial reports with charts
- ✅ Automatic mileage updates
- ✅ Cost per kilometer calculation

### Data Visualizations
- **Bar Chart** - Fuel vs Maintenance costs per truck
- **Pie Chart** - Total spending distribution
- **Overview Cards** - Total spent, fuel costs, maintenance, liters
- **Detailed Breakdown** - Per-truck cost analysis

### UX Features
- Loading states with spinners
- Empty states with helpful messages
- Toast notifications for actions
- Form validation with error messages
- Responsive design (mobile-first)
- Professional color scheme (Zinc + Blue)

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 20+
- Supabase account
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start server:
```bash
npm run dev      # Development with nodemon
npm start        # Production
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:3001
```

4. Start development server:
```bash
npm run dev
```

5. Open browser:
```
http://localhost:5173
```

### Database Schema (Supabase)

Create these tables in Supabase:

#### `caminhoes` (trucks)
```sql
CREATE TABLE caminhoes (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INTEGER,
  km_atual NUMERIC DEFAULT 0,
  capacidade_silo_ton NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `motoristas` (drivers)
```sql
CREATE TABLE motoristas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `abastecimentos` (fuel records)
```sql
CREATE TABLE abastecimentos (
  id SERIAL PRIMARY KEY,
  caminhao_id INTEGER REFERENCES caminhoes(id) ON DELETE CASCADE,
  motorista_id INTEGER REFERENCES motoristas(id),
  km_registro NUMERIC NOT NULL,
  litros NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  posto VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `manutencoes` (maintenance)
```sql
CREATE TABLE manutencoes (
  id SERIAL PRIMARY KEY,
  caminhao_id INTEGER REFERENCES caminhoes(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  tipo_manutencao VARCHAR(50) NOT NULL,
  valor_total NUMERIC NOT NULL,
  km_manutencao NUMERIC NOT NULL,
  data_manutencao DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Code Quality Standards

### Backend
- ✅ **Clean Code** - Self-documenting code with clear naming
- ✅ **SOLID Principles** - Single responsibility, dependency injection
- ✅ **DRY** - Reusable services and validators
- ✅ **Error Handling** - Global error middleware
- ✅ **Validation** - Type-safe Zod schemas
- ✅ **Async/Await** - Modern async handling

### Frontend
- ✅ **Component Composition** - Reusable UI components
- ✅ **Custom Hooks** - Logic separation
- ✅ **Service Layer** - API abstraction
- ✅ **Utility Functions** - Formatting helpers
- ✅ **Loading States** - Better UX
- ✅ **Error Boundaries** - Graceful error handling

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx, vercel, netlify, etc.
```

## 📝 License

MIT

## 👨‍💻 Author

**Roberto Souto Jr**
- GitHub: [@RobertoSoutoJr](https://github.com/RobertoSoutoJr)

---

**Built with ❤️ using modern web technologies**

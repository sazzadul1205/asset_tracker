# 🏢 Asset Tracker - Enterprise Asset Management System

A comprehensive asset tracking and management system built with Next.js 14, featuring role-based access control, real-time tracking, and complete asset lifecycle management.


## LIVE DEMO: [https://asset-tracker-gules.vercel.app/](https://asset-tracker-gules.vercel.app/)


## 🌟 Features

### **🔐 Authentication & Authorization**

- **Multi-role system** (Admin, Manager, Employee)
- **Secure login** with NextAuth.js
- **Protected routes** based on user roles
- **Session management** with JWT tokens

### **📊 Dashboard & Analytics**

- **Role-specific dashboards** for each user type
- **Real-time statistics** and metrics
- **System activity logs**
- **Interactive charts** and data visualization

### **🏷️ Asset Management**

- **Complete asset lifecycle tracking** (Acquisition to Disposal)
- **Barcode generation** and scanning support
- **Asset categorization** with custom fields
- **Asset assignment** to employees/departments
- **Depreciation tracking** and valuation

### **👥 Employee & Department Management**

- **Employee profiles** with asset assignments
- **Department hierarchy** management
- **Manager-employee relationships**
- **Bulk user operations**

### **🔄 Request & Workflow System**

- **8+ request types**: Assign, Transfer, Repair, Return, Dispose, Retire, Update, Request New
- **Approval workflows** with notifications
- **Request history** and tracking
- **Automatic email notifications**

### **📈 Reporting & Transactions**

- **Transaction history** with audit trail
- **Custom reports** generation
- **Export functionality** (PDF, Excel)
- **Filtering and searching** capabilities

## 🏗️ Project Structure

```
asset_tracker/
├── src/app/                    # Next.js App Router
│   ├── admin/                  # Admin panel pages
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── assets/            # Asset management
│   │   ├── employees/         # Employee management
│   │   ├── departments/       # Department management
│   │   ├── assetsCategories/  # Asset categories
│   │   ├── myAssets/          # Admin's assigned assets
│   │   ├── myRequests/        # Admin's requests
│   │   ├── transactions/      # All system transactions
│   │   ├── profile/           # Admin profile
│   │   └── companySettings/   # Company configuration
│   │
│   ├── manager/               # Manager panel pages
│   │   ├── dashboard/         # Manager dashboard
│   │   ├── myAssets/          # Manager's assets
│   │   ├── myEmployees/       # Manager's team
│   │   ├── myRequests/        # Manager's requests
│   │   ├── transactions/      # Department transactions
│   │   └── profile/           # Manager profile
│   │
│   ├── employee/              # Employee panel pages
│   │   ├── dashboard/         # Employee dashboard
│   │   ├── myAssets/          # Employee's assets
│   │   ├── myRequests/        # Employee's requests
│   │   └── profile/           # Employee profile
│   │
│   ├── auth/                  # Authentication pages
│   │   └── login/             # Login page
│   │
│   ├── api/                   # API Routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── assets/            # Asset CRUD operations
│   │   ├── users/             # User management
│   │   ├── department/        # Department operations
│   │   ├── requests/          # Request handling
│   │   ├── assetsCategories/  # Category operations
│   │   ├── company/           # Company settings
│   │   ├── allCounts/         # Dashboard statistics
│   │   └── requestLogs/       # Activity logs
│   │
│   └── layout.js              # Root layout
│
├── src/Shared/                # Reusable components
│   ├── Navbar/               # Navigation component
│   ├── Footer/               # Footer component
│   ├── Loading/              # Loading indicators
│   ├── Error/                # Error components
│   ├── Shared_Button/        # Custom buttons
│   ├── Shared_Input/         # Form inputs
│   └── Table_Pagination/     # Data table components
│
├── src/hooks/                # Custom React hooks
│   ├── useAuth.js           # Authentication hook
│   ├── useAxiosPublic.js    # API client hook
│   ├── useImageUpload.js    # Image upload hook
│   └── useToast.js          # Notification hook
│
├── src/Providers/           # Context providers
│   └── QueryProvider.js     # React Query provider
│
├── src/Utils/              # Utility functions
│   ├── formatCurrency.js   # Currency formatting
│   └── formatStatus.js     # Status formatting
│
├── src/lib/               # Database and external libs
│   └── connectDB.js       # Database connection
│
├── public/                # Static assets
│   ├── Icons/            # Custom icons
│   ├── Logo/             # Brand logos
│   └── various SVG files
│
└── middleware.js          # Route protection middleware
```

## 🎯 User Roles & Permissions

### **👑 Admin**

- Full system access
- Manage all assets, users, departments
- Configure system settings
- View all transactions and logs
- Approve/reject all requests

### **👔 Manager**

- Manage department assets
- View and manage team members
- Approve department requests
- Generate department reports
- Limited system configuration

### **👤 Employee**

- View assigned assets
- Submit asset requests
- Track personal requests
- Update personal profile
- View department assets

## 📋 Request Types

The system supports 8 types of asset requests:

1. **📦 Assign Asset** - Assign asset to employee
2. **🔄 Transfer Asset** - Transfer between employees/departments
3. **🔧 Repair Asset** - Request maintenance/repair
4. **↩️ Return Asset** - Return assigned asset
5. **🗑️ Dispose Asset** - Dispose of damaged assets
6. **🏁 Retire Asset** - Retire obsolete assets
7. **✏️ Update Asset** - Modify asset information
8. **🆕 Request Asset** - Request new asset acquisition

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd asset_tracker
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Configuration**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

4. **Database Setup**

- Ensure MongoDB is running
- The system will create necessary collections automatically

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Access the application**

- Open [http://localhost:3000](http://localhost:3000)
- Login with default admin credentials (setup required)

## 🛠️ Technology Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Styling framework
- **React Icons** - Icon library
- **React Hook Form** - Form handling
- **React Query** - Data fetching and caching

### **Backend**

- **Next.js API Routes** - Serverless functions
- **NextAuth.js** - Authentication
- **Mongoose** - MongoDB ODM
- **Axios** - HTTP client
- **JWT** - Token-based authentication

### **Database**

- **MongoDB** - NoSQL database
- **Mongoose** - Data modeling

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Turbopack** - Fast builds

## 📊 Database Models

### **User Model**

```javascript
{
  name: String,
  email: String,
  password: String,
  role: ['admin', 'manager', 'employee'],
  department: ObjectId,
  manager: ObjectId,
  status: ['active', 'inactive'],
  profileImage: String,
  contactInfo: Object
}
```

### **Asset Model**

```javascript
{
  tag: String, // Unique identifier
  serialNumber: String,
  name: String,
  category: ObjectId,
  status: ['available', 'assigned', 'maintenance', 'retired'],
  assignedTo: ObjectId,
  department: ObjectId,
  purchaseDate: Date,
  purchaseValue: Number,
  currentValue: Number,
  location: String,
  specifications: Object
}
```

### **Request Model**

```javascript
{
  type: String, // 8 request types
  asset: ObjectId,
  requestedBy: ObjectId,
  assignedTo: ObjectId,
  department: ObjectId,
  status: ['pending', 'approved', 'rejected', 'completed'],
  priority: ['low', 'medium', 'high'],
  description: String,
  attachments: Array,
  comments: Array,
  approvedBy: ObjectId,
  approvalDate: Date
}
```

## 🔧 API Endpoints

### **Authentication**

- `POST /api/auth/[...nextauth]` - Login/Logout
- `POST /api/auth/UpdatePassword/[userId]` - Password update

### **Users**

- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/[userId]` - Get user details
- `PUT /api/users/[userId]` - Update user
- `GET /api/users/EmployeeManager` - Get managers
- `GET /api/users/MyEmployees/[userId]` - Get manager's employees

### **Assets**

- `GET /api/assets` - List all assets
- `POST /api/assets` - Create asset
- `GET /api/assets/[tag]` - Get asset by tag
- `PUT /api/assets/[tag]` - Update asset
- `DELETE /api/assets/[tag]` - Delete asset
- `GET /api/assets/AssetOption` - Asset options for dropdowns

### **Requests**

- `GET /api/requests` - List all requests
- `POST /api/requests` - Create request
- `GET /api/requests/[requestedBy]` - Get user's requests
- `PUT /api/requests/Accepted/[id]` - Approve request
- `PUT /api/requests/Rejected/[id]` - Reject request

### **Departments**

- `GET /api/department` - List departments
- `POST /api/department` - Create department
- `GET /api/department/[departmentId]` - Get department
- `PUT /api/department/[departmentId]` - Update department
- `GET /api/department/DepartmentOptions` - Department options

## 🎨 Customization

### **Adding New Asset Categories**

1. Navigate to `/admin/assetsCategories`
2. Click "Add New Category"
3. Define category fields and validation rules

### **Configuring Company Settings**

1. Navigate to `/admin/companySettings`
2. Update company information
3. Configure system preferences

### **Customizing Email Templates**

- Email templates are located in the API routes
- Modify request approval/rejection emails in `/api/requests/`

## 📱 Mobile Responsiveness

The application is fully responsive across:

- **Desktop** (≥1024px) - Full feature access
- **Tablet** (768px-1023px) - Optimized layouts
- **Mobile** (<768px) - Touch-friendly interfaces

## 🔒 Security Features

- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **JWT token authentication**
- **CSRF protection**
- **Input validation** and sanitization
- **SQL/NoSQL injection prevention**
- **Rate limiting** on authentication endpoints

## 📈 Performance Optimizations

- **Server-side rendering** for critical pages
- **Client-side caching** with React Query
- **Image optimization** with Next.js Image
- **Code splitting** and lazy loading
- **Database indexing** for frequent queries
- **Compressed assets** and minified code

## 🚢 Deployment

### **Vercel (Recommended)**

```bash
npm i -g vercel
vercel
```

### **Docker Deployment**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables for Production**

```env
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=strong_random_secret
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🧪 Testing

### **Run Tests**

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### **Test Coverage**

- **Unit tests**: Components and utilities
- **Integration tests**: API endpoints
- **E2E tests**: User workflows
- **Security tests**: Authentication and authorization

## 🐛 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Failed**

   - Verify MongoDB is running
   - Check connection string in `.env.local`
   - Ensure network access is allowed

2. **Authentication Issues**

   - Clear browser cookies
   - Check JWT secret in environment variables
   - Verify user exists in database

3. **Build Errors**
   - Clear `.next` cache: `rm -rf .next`
   - Reinstall dependencies: `npm ci`
   - Check Node.js version compatibility

### **Logs**

- Application logs are available in the console
- Database queries can be logged by enabling Mongoose debug
- API request logs are stored in the database

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support, please contact:

- **System Administrator**: admin@company.com
- **Technical Support**: support@company.com
- **Documentation**: [Internal Wiki Link]

## 🔄 Changelog

### **Version 1.0.0** (Current)

- Initial release with core features
- Multi-role system implementation
- Complete asset lifecycle management
- Request and approval workflows
- Comprehensive reporting

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint

# Formatting
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

---

**✨ System Ready!** Your asset tracking system is configured and ready for deployment. Remember to:

1. Set up initial admin user
2. Configure company settings
3. Import existing assets (if any)
4. Train users on the system
5. Set up regular backups

For detailed implementation guides, refer to the internal documentation or contact the development team.

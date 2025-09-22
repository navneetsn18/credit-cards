# Credit Card Benefits Tracker

A modern NextJS application for tracking credit card benefits across different platforms and merchants. Find the best rewards for your purchases and manage your credit card data efficiently.

## Features

- 🔍 **Smart Search**: Search for credit cards by platform or merchant name
- 📊 **Reward Comparison**: View all cards ranked by reward rate for optimal selection
- ⚡ **Real-time Management**: Add, edit, and delete card-platform combinations
- 🔒 **Security**: Secret-protected delete operations to prevent accidental data loss
- 🔔 **Toast Notifications**: Real-time success/error feedback for all operations
- 📱 **Responsive Design**: Modern, mobile-first interface with Tailwind CSS
- 🚀 **Fast Performance**: Built with NextJS 14 and optimized for Vercel deployment
- ⚡ **Smart Caching**: Advanced cache invalidation and optimistic updates

## Tech Stack

- **Frontend**: NextJS 14 with App Router, TypeScript, Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with modern gradients and responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (Atlas recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd credit-card-benefits-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy the example file and update with your values:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
MONGODB_URI=<YOUR_MONGODB_URI>
MONGODB_DB=credit-cards-benefits
DELETE_SECRET=your-super-secure-delete-secret-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **Important**: The `DELETE_SECRET` is required for secure delete operations. Use a strong, random string in production.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Public Search Interface (/)
- Search for credit cards by platform name (e.g., "Amazon", "Flipkart")
- View results ranked by reward rate
- See detailed information including caps and milestones

### Management Interface (/manage)
- Add new credit card and platform combinations
- Edit existing entries with real-time updates
- Delete outdated information with secret-protected confirmation
- View all entries in an organized table
- Real-time toast notifications for all operations
- Smart cache invalidation for instant UI updates

## Deployment on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/credit-card-benefits-tracker)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB`: Your database name
   - `DELETE_SECRET`: A strong, random secret for delete operations
   - `NEXT_PUBLIC_BASE_URL`: Your production URL

### Environment Variables for Production

In your Vercel dashboard, add these environment variables:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `MONGODB_DB`: `credit-cards-benefits`
- `DELETE_SECRET`: A strong random string (use a password generator)
- `NEXT_PUBLIC_BASE_URL`: `https://your-app-name.vercel.app`

> **Security Note**: Never share your `DELETE_SECRET` publicly. Generate a unique, strong secret for production using tools like `openssl rand -hex 32`.

## API Endpoints

- `GET /api/cards` - Fetch all cards (with optional platform filter)
- `POST /api/cards` - Create new card-platform combination
- `PUT /api/cards/[id]` - Update existing card
- `DELETE /api/cards/[id]` - Delete card (requires `x-delete-secret` header)
- `GET /api/permissions` - Check read/write permissions

## Data Model

Each card-platform combination includes:
- **Card Name**: e.g., "Chase Sapphire Preferred"
- **Platform Name**: e.g., "Amazon", "Flipkart", "Offline"
- **Reward Rate**: e.g., "2% cashback", "5x points", "10% up to ₹500"
- **Description**: Optional notes about caps, milestones, redemption options

## Troubleshooting

### Common Issues

**UI not updating after create/update/delete operations:**
- Check browser console for errors
- Ensure cache invalidation is working properly
- Verify toast notifications are appearing
- Try refreshing the page or clearing browser cache

**Delete operations failing:**
- Verify `DELETE_SECRET` is set in environment variables
- Ensure the secret matches between client and server
- Check network tab for 401 errors

**Toast notifications not appearing:**
- Verify the Toaster component is mounted in the layout
- Check for JavaScript errors in console
- Ensure sonner package is properly installed

**Cache issues:**
- Clear browser storage (localStorage)
- Use the refresh button in the manage interface
- Check if cache TTL values are appropriate

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially cache invalidation and toast notifications)
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.
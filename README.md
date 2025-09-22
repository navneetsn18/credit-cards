# Credit Card Benefits Tracker

A modern NextJS application for tracking credit card benefits across different platforms and merchants. Find the best rewards for your purchases and manage your credit card data efficiently.

## Features

- 🔍 **Smart Search**: Search for credit cards by platform or merchant name
- 📊 **Reward Comparison**: View all cards ranked by reward rate for optimal selection
- ⚡ **Real-time Management**: Add, edit, and delete card-platform combinations
- 📱 **Responsive Design**: Modern, mobile-first interface with Tailwind CSS
- 🚀 **Fast Performance**: Built with NextJS 14 and optimized for Vercel deployment

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
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://testingfornsn_db_user:apNIpU5Hiz5Q7mxV@credit-cards.x51intw.mongodb.net/
MONGODB_DB=credit-cards-benefits
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

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
- Delete outdated information with confirmation
- View all entries in an organized table

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
   - `NEXT_PUBLIC_BASE_URL`: Your production URL

### Environment Variables for Production

In your Vercel dashboard, add these environment variables:

- `MONGODB_URI`: `mongodb+srv://testingfornsn_db_user:apNIpU5Hiz5Q7mxV@credit-cards.x51intw.mongodb.net/`
- `MONGODB_DB`: `credit-cards-benefits`
- `NEXT_PUBLIC_BASE_URL`: `https://your-app-name.vercel.app`

## API Endpoints

- `GET /api/cards` - Fetch all cards (with optional platform filter)
- `POST /api/cards` - Create new card-platform combination
- `PUT /api/cards/[id]` - Update existing card
- `DELETE /api/cards/[id]` - Delete card

## Data Model

Each card-platform combination includes:
- **Card Name**: e.g., "Chase Sapphire Preferred"
- **Platform Name**: e.g., "Amazon", "Flipkart", "Offline"
- **Reward Rate**: e.g., "2% cashback", "5x points", "10% up to ₹500"
- **Description**: Optional notes about caps, milestones, redemption options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.
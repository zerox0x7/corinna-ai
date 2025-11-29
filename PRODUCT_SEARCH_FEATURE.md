# 🛍️ AI Chatbot Product Search Feature

## Overview
Your chatbot now has an intelligent product search capability that displays beautiful, interactive product cards when customers ask about products. The feature uses modern UI design with smooth animations and responsive layouts.

## ✨ Features

### 1. **Smart Product Search**
- AI automatically detects when users are asking about products
- Intelligent keyword extraction from natural language queries
- Falls back to showing available products if no exact match is found
- Supports various search phrases like:
  - "Show me products"
  - "I'm looking for a shirt"
  - "Find me shoes"
  - "What products do you have?"

### 2. **Beautiful Product Cards**
Each product card features:
- **High-quality product images** with zoom effect on hover
- **Product name** and pricing information
- **Interactive elements**:
  - Heart icon for favoriting (with animation)
  - Quick view button
  - Color selection dots
  - Size selector buttons (S, M, L, XL)
- **Smooth animations** and hover effects
- **Add to Cart button** that redirects to payment page
- **Fully responsive** design that works on all screen sizes

### 3. **Modern UI Design**
- Cards styled similar to premium e-commerce sites (Nike, Apple, etc.)
- Gradient backgrounds and shadow effects
- Smooth transitions and micro-interactions
- Professional color scheme

## 🏗️ Architecture

### Components Created

#### 1. **ProductCard Component**
Location: `/src/components/chatbot/product-card.tsx`

A standalone, reusable component that displays a single product with:
- Image with hover effects
- Product information (name, price)
- Interactive controls (like, view, size, color)
- Add to cart functionality

#### 2. **Updated Bubble Component**
Location: `/src/components/chatbot/bubble.tsx`

Enhanced to:
- Accept product data in messages
- Render multiple product cards in a responsive grid
- Maintain existing chat functionality

### Backend Functions

#### 1. **onSearchProducts**
Location: `/src/actions/bot/index.ts`

Intelligent product search with:
- Keyword extraction and filtering
- Multi-stage search strategy
- Fallback to all products if no match
- Returns up to 6 products

#### 2. **Enhanced onAiChatBotAssistant**
Location: `/src/actions/bot/index.ts`

Updated to:
- Detect product-related queries
- Trigger product search
- Format responses with product data
- Track customer ID for purchases

## 🚀 How It Works

### User Flow

1. **Customer asks about products**
   ```
   Customer: "Show me your products"
   Customer: "I'm looking for shoes"
   Customer: "What do you have?"
   ```

2. **AI detects product query**
   - System identifies keywords in the message
   - Triggers product search function

3. **Products are searched**
   - Extracts meaningful keywords from query
   - Searches database with smart matching
   - Returns relevant products (up to 6)

4. **Beautiful cards are displayed**
   - Products shown in responsive grid
   - Interactive elements enabled
   - Customer can browse and interact

5. **Customer can purchase**
   - Click "Add to Cart" on any product
   - Redirected to payment page
   - Transaction can be completed

### Technical Flow

```
User Message
    ↓
AI Bot Action (onAiChatBotAssistant)
    ↓
Keyword Detection
    ↓
Product Search (onSearchProducts)
    ↓
Database Query
    ↓
Response with Products
    ↓
Bubble Component
    ↓
ProductCard Rendering
    ↓
Interactive Display
```

## 📱 Responsive Design

The product cards adapt to different screen sizes:

- **Mobile (< 768px)**: 
  - Single column layout
  - Cards stack vertically
  - Touch-friendly interactions
  - Max width: 90% of viewport

- **Tablet/Desktop (≥ 768px)**:
  - Multiple columns (flex-wrap)
  - Cards flow horizontally
  - Hover effects enabled
  - Max width: 85% of viewport

## 🎨 Styling Highlights

### Product Card Features
- **Aspect ratio**: Perfect square for images
- **Border radius**: 16px for modern look
- **Shadow**: Multi-layer for depth
- **Hover effects**: 
  - Card lifts (-4px transform)
  - Image zooms (110% scale)
  - Overlay actions fade in
- **Colors**:
  - White background for cards
  - Gray gradient for image placeholders
  - Slate dark buttons
  - Subtle shadows

### Animations
- **Card hover**: Scale and shadow transition
- **Image hover**: Smooth zoom effect
- **Button hover**: Scale and color change
- **Icon animations**: Heart fill, bounce effects
- **Fade transitions**: Overlay elements

## 🛠️ Configuration

### Customizing Product Cards

Edit `/src/components/chatbot/product-card.tsx`:

```typescript
// Change number of color options
<div className="flex gap-2 mb-3">
  {/* Add or remove color circles */}
</div>

// Change available sizes
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Modify price formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Change currency here
  }).format(price)
}
```

### Adjusting Search Behavior

Edit `/src/actions/bot/index.ts`:

```typescript
// Change number of products returned
take: 6, // Modify this number

// Add more stop words for better keyword extraction
const stopWords = [
  'show', 'me', 'find', /* add more */
]

// Adjust product query keywords
const productKeywords = [
  'product', 'shop', /* add more */
]
```

## 📊 Database Schema

Products are stored with the following structure:

```prisma
model Product {
  id        String   @id @default(dbgenerated("gen_random_uuid()"))
  name      String
  price     Int
  image     String   // Uploadcare UUID
  domainId  String?
  createdAt DateTime @default(now())
}
```

## 🔧 Testing

### Adding Test Products

1. Go to your domain settings
2. Navigate to Products section
3. Click "Add Product"
4. Fill in:
   - Product name
   - Price (in cents)
   - Upload image
5. Save

### Testing the Feature

1. Open the chatbot on your site
2. Try these queries:
   ```
   "Show me products"
   "What do you sell?"
   "I'm looking for [product name]"
   "Find me shoes"
   ```
3. Observe product cards appearing
4. Test interactions:
   - Hover over cards
   - Click heart icon
   - Click quick view
   - Select colors and sizes
   - Click "Add to Cart"

## 🎯 Best Practices

### For Merchants

1. **High-quality images**: Use clear, professional product photos
2. **Descriptive names**: Include brand, type, and key features
3. **Accurate pricing**: Set prices carefully
4. **Regular updates**: Keep product catalog fresh

### For Developers

1. **Error handling**: Function includes try-catch blocks
2. **Type safety**: All components properly typed
3. **Performance**: Limited to 6 products per query
4. **Responsive**: Tested on multiple screen sizes

## 🚦 Future Enhancements

Potential improvements:
- [ ] Product filtering (price range, category)
- [ ] Product sorting (price, name, newest)
- [ ] Multiple product images in carousel
- [ ] Real product colors and sizes from database
- [ ] Wishlist functionality
- [ ] Product comparison
- [ ] Related products suggestions
- [ ] Inventory tracking
- [ ] Product reviews and ratings

## 🐛 Troubleshooting

### Products not appearing?
1. Verify products exist in database for the domain
2. Check domain ID is correctly passed to components
3. Ensure product images are valid Uploadcare UUIDs

### Cards not responsive?
1. Check Tailwind CSS is properly configured
2. Verify viewport meta tag in HTML
3. Test different screen sizes in dev tools

### Search not working?
1. Check product names in database
2. Verify keyword detection logic
3. Test with simpler queries first

## 📝 Code Quality

All files pass linting with:
- ✅ No TypeScript errors
- ✅ Proper type annotations
- ✅ ESLint compliant
- ✅ Consistent formatting

## 🎉 Summary

You now have a fully functional, beautifully designed product search feature in your chatbot! Customers can:
- Ask about products naturally
- Browse attractive product cards
- Interact with products
- Purchase directly from chat

The feature is production-ready, responsive, and provides an excellent user experience!


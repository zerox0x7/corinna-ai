# 🚀 Quick Start Guide - Product Search Feature

## Testing Your New Feature (5 Minutes)

### Step 1: Add Products to Your Store

1. **Log into your dashboard**
2. **Navigate to your domain settings**
3. **Go to Products tab**
4. **Click "Add Product"**
5. **Fill in the details**:
   ```
   Name: Nike Air Max 270
   Price: 13999 (in cents = $139.99)
   Image: Upload a product image
   ```
6. **Add a few more products** for better testing

### Step 2: Test the Chatbot

1. **Open your website** where the chatbot is embedded
2. **Click the chatbot icon** in the bottom right
3. **Try these queries**:

   ```
   "Show me products"
   "What do you sell?"
   "I'm looking for shoes"
   "Find me Nike"
   ```

### Step 3: Interact with Products

- **Hover over cards** to see animations
- **Click the heart icon** to "favorite" (visual feedback)
- **Try different sizes and colors**
- **Click "Add to Cart"** to test purchase flow

## Example Queries That Work

✅ **General queries**:
- "Show me your products"
- "What products do you have?"
- "I want to see what you sell"

✅ **Specific searches**:
- "Find me [product name]"
- "Looking for shoes"
- "Show me Nike products"

✅ **Natural language**:
- "What can I buy?"
- "I need some new items"
- "Shopping for products"

## Visual Preview

When a customer asks about products, they'll see:

```
┌─────────────────────────────────┐
│  🤖 AI Assistant                │
├─────────────────────────────────┤
│ Customer: Show me products      │
│                                 │
│ AI: Great! I found some         │
│ amazing products for you...     │
│                                 │
│ ┌───────────────────────┐      │
│ │  [Product Image]      │      │
│ │  ───────────────      │      │
│ │  Nike Air Max 270     │      │
│ │  ● ● ●  S M L XL      │      │
│ │  $139.99              │      │
│ │  [Add to Cart]        │      │
│ └───────────────────────┘      │
│                                 │
│ ┌───────────────────────┐      │
│ │  [Product Image]      │      │
│ │  Another Product...   │      │
│ └───────────────────────┘      │
└─────────────────────────────────┘
```

## Customization Tips

### Change Card Colors

Edit `src/components/chatbot/product-card.tsx`:

```typescript
// Button background
className="bg-gradient-to-r from-blue-600 to-blue-700"

// Card hover effects
hover:shadow-blue-200
```

### Adjust Product Limit

Edit `src/actions/bot/index.ts`:

```typescript
take: 6, // Change to 3, 9, 12, etc.
```

### Add More Product Keywords

Edit `src/actions/bot/index.ts`:

```typescript
const productKeywords = [
  'product', 'products', 'show', 
  'catalog', 'inventory', 'stock', // Add more
]
```

## Troubleshooting

### "No products found" message?

**Solution**: Make sure you have added products to your domain in the dashboard.

### Products not displaying correctly?

**Solution**: Check that product images are properly uploaded to Uploadcare.

### Search not working?

**Solution**: Try simpler queries first like "show products" to ensure the feature is working.

## Mobile Testing

Don't forget to test on mobile:

1. Open Chrome DevTools (F12)
2. Click the device toolbar icon
3. Select a mobile device
4. Test the chatbot
5. Verify cards are responsive

## Next Steps

✨ **Enhance your store**:
- Add high-quality product images
- Write descriptive product names
- Keep prices updated
- Regularly add new products

🎨 **Customize the design**:
- Match your brand colors
- Adjust card styles
- Modify hover effects
- Change button text

📊 **Monitor performance**:
- Track product views
- Analyze search queries
- Optimize product names
- Update based on customer feedback

## Support

If you need help:
1. Check the main documentation (PRODUCT_SEARCH_FEATURE.md)
2. Review the code comments
3. Test with different queries
4. Verify database has products

## Success Checklist

- [x] Product card component created
- [x] Search functionality implemented
- [x] AI detection working
- [x] Responsive design applied
- [x] Animations added
- [x] Purchase flow connected
- [x] All linting errors fixed
- [x] Documentation complete

**🎉 Your chatbot is now ready to showcase products!**


# n8n Webhook Response Format Guide

## Overview

The chatbot now reads the response from your n8n workflow and displays products or custom messages to the customer!

## 🎯 How It Works

1. Customer asks about products
2. Chatbot sends request to n8n webhook
3. **n8n workflow processes the request** (searches products, applies filters, etc.)
4. **n8n returns JSON response** with products and/or message
5. Chatbot displays the products and message to the customer

## 📋 Response Format Options

### Option 1: Return Products with Custom Message ⭐ (Recommended)

This is the best option - your n8n workflow searches for products and returns them:

```json
{
  "message": "I found some great products for you!",
  "products": [
    {
      "id": "product-123",
      "name": "Nike Air Max 270",
      "price": 13999,
      "image": "019dd17d-b69b-4dea-a16b-60e0f25de1e9/product.png",
      "domainId": "your-domain-id"
    },
    {
      "id": "product-456",
      "name": "Nike Air Force 1",
      "price": 11999,
      "image": "019dd17d-b69b-4dea-a16b-60e0f25de1e9/product2.png",
      "domainId": "your-domain-id"
    }
  ]
}
```

**Product Object Fields:**
- `id` (required) - Unique product identifier
- `name` (required) - Product name/title
- `price` (required) - Price in **cents** (e.g., 13999 = $139.99)
- `image` (required) - Uploadcare image ID or full URL
- `domainId` (optional) - Your domain ID

**Result:** Chatbot shows your message + product cards below

---

### Option 2: Return Only Message (No Products)

Use this if you want to acknowledge the inquiry but not show products yet:

```json
{
  "message": "Thanks for your interest! I've forwarded your inquiry to our sales team. They'll email you shortly with product recommendations."
}
```

**Result:** Chatbot shows only your custom message

---

### Option 3: Simple Acknowledgment

If you just want to acknowledge the webhook was received:

```json
{
  "message": "Workflow was started"
}
```

**Result:** Chatbot shows default message: "I've received your product inquiry! Let me check what we have available for you. I'll get back to you with some great options shortly! 🔍"

---

## 🛠️ n8n Workflow Examples

### Example 1: Query Database and Return Products

```
1. Webhook Trigger (GET)
2. Extract query parameters
3. HTTP Request to your product API/database
   - URL: https://your-api.com/products/search
   - Method: GET
   - Query: {{ $json.query.keywords }}
4. Function Node - Format Products
   - Map results to required format
5. Respond to Webhook
   - Return JSON with products
```

**Function Node Code Example:**
```javascript
const products = $input.item.json.results;

return {
  message: `I found ${products.length} products matching "${$('Webhook').item.json.query.query}"`,
  products: products.map(p => ({
    id: p.id,
    name: p.name,
    price: Math.round(p.price * 100), // Convert dollars to cents
    image: p.imageUrl,
    domainId: $('Webhook').item.json.query.domainId
  }))
};
```

---

### Example 2: Send Email and Acknowledge

```
1. Webhook Trigger (GET)
2. Extract query parameters
3. Send Email Node
   - To: sales@yourcompany.com
   - Subject: New Product Inquiry
   - Body: Customer asked: {{ $json.query.query }}
4. Respond to Webhook
   - Return acknowledgment message
```

**Response:**
```json
{
  "message": "Thanks for your inquiry! Our team will reach out to you within 24 hours with product recommendations."
}
```

---

### Example 3: Conditional Response

```
1. Webhook Trigger (GET)
2. HTTP Request to check inventory
3. IF Node - Check if products available
   - TRUE: Return products
   - FALSE: Return "out of stock" message
4. Respond to Webhook
```

**TRUE Branch Response:**
```json
{
  "message": "Great news! We have these products in stock:",
  "products": [...]
}
```

**FALSE Branch Response:**
```json
{
  "message": "Thanks for your interest! These items are currently out of stock, but we'll notify you when they're back. Please provide your email for updates."
}
```

---

## 🎨 Message Personalization

You can use the data from the webhook to personalize messages:

```javascript
// In n8n Function Node
const query = $('Webhook').item.json.query;

return {
  message: `Great! I searched for "${query.keywords}" and found these products for you:`,
  products: [...]
};
```

---

## 💡 Best Practices

1. **Always include a message** - Even if you're returning products, add a friendly message
2. **Price in cents** - Always send price as an integer in cents (13999 = $139.99)
3. **Limit products** - Show 3-6 products max for best user experience
4. **Handle errors** - If your product search fails, return a message explaining what happened
5. **Fast response** - Keep n8n workflow execution under 3 seconds for best UX

---

## 🧪 Testing Your Response Format

### Manual Test with curl:

```bash
curl -G "https://your-n8n-webhook-url" \
  --data-urlencode "domainId=test" \
  --data-urlencode "query=show me shoes" \
  --data-urlencode "keywords=shoes"
```

Check that the response matches one of the formats above!

---

## 🐛 Troubleshooting

### Products Not Showing

**Check:**
1. Is the `products` array present in the response?
2. Does each product have `id`, `name`, `price`, and `image`?
3. Is price a number (not a string)?
4. Check console logs for: `📡 Webhook Result:`

### Wrong Message Displayed

**Check:**
1. Is `message` field present in response?
2. Check n8n execution logs to see what was returned
3. Look for console logs: `✅ n8n webhook response:`

### Error Message Shown

**Check:**
1. Is n8n workflow returning status 200?
2. Is the response valid JSON?
3. Check n8n execution for errors

---

## 📊 Full Example Response

Here's a complete example of what your n8n workflow should return:

```json
{
  "message": "I found 3 amazing Nike products for you! These are bestsellers this month. 🔥",
  "products": [
    {
      "id": "nike-air-max-270",
      "name": "Nike Air Max 270 - Triple Black",
      "price": 15000,
      "image": "019dd17d-b69b-4dea-a16b-60e0f25de1e9/nike-air-max.png",
      "domainId": "cm123456"
    },
    {
      "id": "nike-air-force-1",
      "name": "Nike Air Force 1 '07 - White",
      "price": 11000,
      "image": "019dd17d-b69b-4dea-a16b-60e0f25de1e9/nike-af1.png",
      "domainId": "cm123456"
    },
    {
      "id": "nike-dunk-low",
      "name": "Nike Dunk Low - Panda",
      "price": 12000,
      "image": "019dd17d-b69b-4dea-a16b-60e0f25de1e9/nike-dunk.png",
      "domainId": "cm123456"
    }
  ]
}
```

This will display:
1. The custom message: "I found 3 amazing Nike products for you! These are bestsellers this month. 🔥"
2. Three beautiful product cards with images, names, prices, and "View Product" buttons

---

## 🎯 Next Steps

1. Update your n8n workflow to return products in this format
2. Test with the curl command above
3. Test in the chatbot
4. Check console logs to verify the format is correct
5. Customize the message to match your brand voice!


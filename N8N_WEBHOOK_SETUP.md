# n8n Webhook Integration for Product Inquiries

## Overview
Your chatbot now sends product inquiries to an n8n webhook workflow instead of directly searching and displaying products. This gives you more control over how product requests are handled and allows for custom workflows.

## Setup Instructions

### 1. Add the Environment Variable

Add the following to your `.env.local` or `.env` file:

```env
N8N_PRODUCT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/product-inquiry
```

Replace `https://your-n8n-instance.com/webhook/product-inquiry` with your actual n8n webhook URL.

### 2. n8n Workflow Configuration

Your n8n workflow will receive a **GET request** with the following query parameters:

- `domainId` - The domain/chatbot ID
- `customerId` - The customer's ID (or "guest" if not logged in)
- `customerEmail` - The customer's email (or "not-provided" if not available)
- `query` - The full user query
- `keywords` - Extracted keywords from the query (comma-separated)
- `chatRoomId` - The chat room ID (or "guest-session" if not logged in)
- `timestamp` - ISO 8601 timestamp

**Example URL:**
```
https://your-n8n-instance.com/webhook/your-id?domainId=abc123&customerId=user456&customerEmail=user@example.com&query=show%20me%20products&keywords=products&chatRoomId=room789&timestamp=2025-11-29T10:00:00Z
```

### 3. Expected n8n Workflow Response

Your n8n workflow should return a JSON response with the following structure:

#### Option 1: Return Products Directly (Recommended)

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

**Note:** Price should be in cents (e.g., 13999 = $139.99)

#### Option 2: Return Just a Message

```json
{
  "message": "Thanks for your inquiry! I'll email you some product recommendations shortly."
}
```

#### Option 3: Simple Acknowledgment

```json
{
  "message": "Workflow was started"
}
```

### How the Chatbot Uses the Response

1. **If `products` array is present** → The chatbot will display the product cards to the user
2. **If only `message` is present** → The chatbot will show your custom message
3. **If neither** → The chatbot will show a default acknowledgment message

## Example n8n Workflow Steps

Here's a suggested workflow structure in n8n:

1. **Webhook Node** (GET method) - Receives the product inquiry via query parameters
2. **Extract Data** - Access query parameters: `{{$json.query.domainId}}`, `{{$json.query.query}}`, etc.
3. **Search Products** - Query your product database/API based on the keywords
4. **Format Response** - Prepare product information
5. **Send to Customer** (Optional) - Send email, notification, or update CRM
6. **Respond** - Return success response with products array

## How It Works

1. **Customer asks about products** in the chatbot (e.g., "Show me your products", "I'm looking for shoes")
2. **AI detects product query** using keywords like: product, products, show, looking for, find, search, buy, purchase, shop, item, items
3. **Webhook is triggered** - Data is sent to your n8n workflow
4. **Customer receives acknowledgment** - "I've received your product inquiry! Let me check what we have available for you. I'll get back to you with some great options shortly! 🔍"
5. **Your n8n workflow processes the request** - Search products, notify team, update CRM, etc.

## Customization Options

### Modify the Response Message

Edit the response message in `/src/actions/bot/index.ts` around line 400:

```typescript
if (webhookResult.success) {
  responseContent = `Your custom success message here`
} else {
  responseContent = `Your custom error message here`
}
```

### Add More Data to Webhook Payload

You can extend the payload in the `onSendProductInquiryToN8N` function to include additional data like:
- Customer name
- Previous chat history
- Customer preferences
- Location/timezone
- Device type

### Product Keywords

To add or modify keywords that trigger the webhook, edit the `productKeywords` array in `/src/actions/bot/index.ts` around line 385:

```typescript
const productKeywords = ['product', 'products', 'show', 'looking for', 'find', 'search', 'buy', 'purchase', 'shop', 'item', 'items']
```

## Testing

To test the webhook integration:

1. Start your chatbot
2. Send a message like "Show me your products"
3. Check your n8n workflow logs to confirm the webhook was received
4. Verify the payload contains the expected data

## Troubleshooting

### Webhook not firing
- Verify `N8N_PRODUCT_WEBHOOK_URL` is set correctly in your environment variables
- Check n8n workflow is active and the webhook URL is correct
- Look for error messages in the server console

### Webhook failing
- Check n8n workflow logs for errors
- Verify your n8n instance is accessible from your server
- Ensure the webhook accepts POST requests with JSON body

### No response from workflow
- The chatbot will still respond to the customer even if the webhook fails
- Check the `webhookResult.success` value in the logs
- Review n8n workflow response format

## Benefits

- **Asynchronous Processing**: Don't block the chat while searching/processing products
- **Flexible Workflows**: Use n8n's visual workflow builder for complex logic
- **Integration Options**: Connect to multiple systems (CRM, inventory, email, etc.)
- **Analytics**: Track product inquiries and customer interests
- **Scalability**: Handle high volumes of product requests efficiently
- **Custom Logic**: Implement business rules, filters, and recommendations

## Next Steps

1. Create your n8n workflow
2. Copy the webhook URL from n8n
3. Add it to your environment variables
4. Restart your application
5. Test with sample product queries

Need help? Check the n8n documentation at https://docs.n8n.io/


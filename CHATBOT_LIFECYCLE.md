# Chatbot Window Lifecycle & Architecture

## Overview
The chatbot is an embeddable widget that can be injected into any website via an iframe. It uses PostMessage API for communication between the parent website and the iframe.

## Lifecycle Flow

### 1. **Embedding Phase** (Initial Setup)

#### Step 1.1: Code Snippet Generation
- Location: `src/components/forms/settings/code-snippet.tsx`
- The user gets a code snippet with their domain ID
- This snippet is pasted into the target website's HTML

#### Step 1.2: Iframe Creation
```javascript
// The snippet creates an iframe pointing to:
iframe.src = "http://localhost:3000/chatbot"  // ⚠️ Hardcoded - needs env var
iframe.classList.add('chat-frame')
document.body.appendChild(iframe)
```

#### Step 1.3: PostMessage Handshake
```javascript
// Parent website listens for dimension updates
window.addEventListener("message", (e) => {
    if(e.origin !== "http://localhost:3000") return null
    let dimensions = JSON.parse(e.data)
    iframe.width = dimensions.width
    iframe.height = dimensions.height
    // Send domain ID to chatbot
    iframe.contentWindow.postMessage("${domainId}", "http://localhost:3000/")
})
```

### 2. **Initialization Phase**

#### Step 2.1: Chatbot Page Loads
- Location: `src/app/chatbot/page.tsx`
- Renders: `src/components/chatbot/index.tsx` (AiChatBot component)

#### Step 2.2: Domain ID Reception
- Location: `src/hooks/chatbot/use-chatbot.ts` (lines 98-107)
- The chatbot listens for PostMessage with domain ID:
```typescript
useEffect(() => {
    window.addEventListener('message', (e) => {
        const botid = e.data  // Domain ID received
        if (limitRequest < 1 && typeof botid == 'string') {
            onGetDomainChatBot(botid)  // Fetch chatbot config
            limitRequest++
        }
    })
}, [])
```

#### Step 2.3: Fetch Chatbot Configuration
- Function: `onGetDomainChatBot(id)` → calls `onGetCurrentChatBot(id)`
- Location: `src/actions/bot/index.ts` (lines 39-67)
- Fetches from database:
  - Domain name
  - Chatbot settings (icon, welcome message, colors, helpdesk)
  - Helpdesk questions/answers
- Sets welcome message in chat state

#### Step 2.4: Dimension Communication
- Location: `src/hooks/chatbot/use-chatbot.ts` (lines 71-78)
- When chatbot opens/closes, it sends dimensions to parent:
```typescript
useEffect(() => {
    postToParent(JSON.stringify({
        width: botOpened ? 550 : 80,
        height: botOpened ? 800 : 80,
    }))
}, [botOpened])
```

### 3. **User Interaction Phase**

#### Step 3.1: User Opens Chatbot
- User clicks the floating bot button
- `botOpened` state toggles to `true`
- BotWindow component renders

#### Step 3.2: User Sends Message
- Location: `src/hooks/chatbot/use-chatbot.ts` → `onStartChatting` (lines 109-185)
- Form submission triggers:
  1. Add user message to local state
  2. Show "AI typing" indicator
  3. Call `onAiChatBotAssistant()` server action

### 4. **Message Processing Phase**

#### Step 4.1: Server Action Processing
- Location: `src/actions/bot/index.ts` → `onAiChatBotAssistant` (lines 71-378)
- This is the **CORE LOGIC** of the chatbot:

**Flow:**
1. **Extract Email** (if present in message)
   - Uses regex to find email addresses
   - Stores in global variable `customerEmail` ⚠️ (BAD PRACTICE)

2. **Check/Create Customer**
   - If email found, checks if customer exists
   - If new customer:
     - Creates Customer record
     - Creates ChatRoom
     - Creates CustomerResponses from FilterQuestions
     - Returns welcome message

3. **Check Real-time Mode**
   - If `chatRoom.live === true`:
     - Stores message in database
     - Triggers Pusher event for real-time chat
     - Sends email notification (if not already sent)
     - Returns `{ live: true, chatRoom: id }`

4. **AI Processing** (if not in real-time mode)
   - Calls OpenAI/OpenRouter API
   - System prompt includes:
     - Filter questions to ask
     - Instructions to add `(complete)` keyword
     - Instructions to add `(realtime)` keyword if needed
     - Links for appointments/products

5. **Response Handling**
   - If response contains `(realtime)`: Switch to real-time mode
   - If response contains `(complete)`: Update CustomerResponses
   - Extract URLs from response
   - Store assistant message in database
   - Return response to client

#### Step 4.2: Client Receives Response
- Location: `src/hooks/chatbot/use-chatbot.ts` (lines 137-183)
- If `response.live === true`:
  - Sets real-time mode
  - Subscribes to Pusher channel
- Otherwise:
  - Adds AI response to chat state
  - Hides typing indicator

### 5. **Real-time Mode Phase**

#### Step 5.1: Real-time Mode Activation
- Triggered when:
  - AI detects inappropriate/out-of-context message → adds `(realtime)`
  - User manually enables (from dashboard)

#### Step 5.2: Pusher Subscription
- Location: `src/hooks/chatbot/use-chatbot.ts` → `useRealTime` (lines 203-237)
- Subscribes to Pusher channel (chatRoom ID)
- Listens for `'realtime-mode'` events

#### Step 5.3: Owner Sends Message
- Location: `src/hooks/conversation/use-conversation.ts` → `useChatWindow` (lines 152-175)
- Owner types message in dashboard
- Calls `onOwnerSendMessage()` server action
- Stores message in database
- Triggers Pusher event via `onRealTimeChat()`

#### Step 5.4: Real-time Message Delivery
- Pusher broadcasts to all subscribers
- Chatbot receives message via Pusher client
- Updates chat state
- Message appears in chatbot window

### 6. **Message Storage**

#### Database Schema
- **ChatRoom**: Container for conversation
  - `id`, `live`, `mailed`, `customerId`
- **ChatMessage**: Individual messages
  - `id`, `message`, `role` (user/assistant), `chatRoomId`, `seen`

#### Storage Flow
- Every message (user & assistant) stored via `onStoreConversations()`
- Location: `src/actions/bot/index.ts` (lines 19-37)
- Updates ChatRoom with new ChatMessage

## Current Architecture Issues

### ❌ Hardcoded URLs
- `localhost:3000` hardcoded in multiple places
- Should use `process.env.NEXT_PUBLIC_SITE_URL`

### ❌ Global Variable
- `customerEmail` is a module-level variable
- Can cause race conditions with concurrent requests

### ⚠️ Server Actions Only
- All communication uses Next.js Server Actions
- Server Actions are only accessible from React components
- Messages can only be sent through the chatbot UI


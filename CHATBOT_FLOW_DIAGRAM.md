# Chatbot Flow Diagram

## Visual Flow Representation

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSITE (Parent Domain)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Code Snippet (Embedded in <head> or <body>)            │  │
│  │                                                          │  │
│  │  1. Creates <iframe>                                    │  │
│  │  2. Sets src="http://localhost:3000/chatbot"           │  │
│  │  3. Listens for PostMessage events                      │  │
│  │  4. Sends domainId via postMessage()                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ iframe                                │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              CORINNA AI SERVER (localhost:3000)                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /chatbot Page (src/app/chatbot/page.tsx)                │  │
│  │                                                          │  │
│  │  Renders: <AiChatBot />                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AiChatBot Component                                      │  │
│  │  (src/components/chatbot/index.tsx)                       │  │
│  │                                                          │  │
│  │  • Floating button (bot icon)                            │  │
│  │  • BotWindow (when opened)                               │  │
│  │  • useChatBot() hook                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useChatBot Hook                                          │  │
│  │  (src/hooks/chatbot/use-chatbot.ts)                       │  │
│  │                                                          │  │
│  │  INITIALIZATION:                                          │  │
│  │  1. Listens for PostMessage (domainId)                   │  │
│  │  2. Calls onGetDomainChatBot(domainId)                    │  │
│  │  3. Fetches chatbot config from DB                       │  │
│  │  4. Displays welcome message                             │  │
│  │                                                          │  │
│  │  USER INTERACTION:                                        │  │
│  │  1. User types message                                    │  │
│  │  2. onStartChatting() called                             │  │
│  │  3. Calls onAiChatBotAssistant() [Server Action]         │  │
│  │  4. Receives response                                    │  │
│  │  5. Updates chat state                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ Server Action Call                   │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  onAiChatBotAssistant()                                  │  │
│  │  (src/actions/bot/index.ts)                             │  │
│  │                                                          │  │
│  │  PROCESSING FLOW:                                        │  │
│  │                                                          │  │
│  │  1. Extract email from message (if present)             │  │
│  │     └─► Create/Find Customer                            │  │
│  │         └─► Create ChatRoom                             │  │
│  │             └─► Create CustomerResponses                │  │
│  │                                                          │  │
│  │  2. Check if ChatRoom.live === true                     │  │
│  │     └─► YES: Real-time mode                             │  │
│  │         ├─► Store message in DB                         │  │
│  │         ├─► Trigger Pusher event                        │  │
│  │         └─► Send email notification                      │  │
│  │                                                          │  │
│  │  3. If NOT in real-time mode:                           │  │
│  │     └─► Call OpenAI/OpenRouter API                      │  │
│  │         ├─► System prompt with instructions            │  │
│  │         ├─► Chat history context                        │  │
│  │         └─► User message                                │  │
│  │                                                          │  │
│  │  4. Process AI Response:                                │  │
│  │     ├─► Contains "(realtime)"?                          │  │
│  │     │   └─► Switch to real-time mode                    │  │
│  │     ├─► Contains "(complete)"?                          │  │
│  │     │   └─► Update CustomerResponses                   │  │
│  │     └─► Extract URLs?                                   │  │
│  │         └─► Return with link                            │  │
│  │                                                          │  │
│  │  5. Store assistant message in DB                       │  │
│  │  6. Return response to client                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ Database                             │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (via Prisma)                         │  │
│  │                                                          │  │
│  │  Tables:                                                 │  │
│  │  • Domain (chatbot config)                               │  │
│  │  • ChatBot (settings)                                   │  │
│  │  • Customer (user info)                                 │  │
│  │  • ChatRoom (conversation container)                    │  │
│  │  • ChatMessage (individual messages)                    │  │
│  │  • CustomerResponses (form answers)                    │  │
│  │  • HelpDesk (FAQ)                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ Pusher Event                        │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pusher (Real-time Communication)                        │  │
│  │                                                          │  │
│  │  Channel: chatRoom.id                                    │  │
│  │  Event: 'realtime-mode'                                  │  │
│  │                                                          │  │
│  │  Broadcasts messages to:                                 │  │
│  │  • Chatbot window (customer side)                      │  │
│  │  • Dashboard (owner side)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Pusher Subscription
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Owner Side)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Conversation Page                                        │  │
│  │  (src/app/(dashboard)/conversation/page.tsx)             │  │
│  │                                                          │  │
│  │  • Lists all chat rooms                                  │  │
│  │  • Shows unread messages                                 │  │
│  │  • Owner can send messages                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useChatWindow Hook                                       │  │
│  │  (src/hooks/conversation/use-conversation.ts)            │  │
│  │                                                          │  │
│  │  • Subscribes to Pusher channel                          │  │
│  │  • Receives real-time messages                           │  │
│  │  • Sends messages via onOwnerSendMessage()               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Message Flow Sequence

### Normal Chat Flow (AI Mode)

```
1. User types message in chatbot
   └─► onStartChatting() called
       └─► onAiChatBotAssistant(domainId, chatHistory, 'user', message)
           ├─► Extract email (if present)
           ├─► Check/Create customer
           ├─► Check real-time mode
           │   └─► NO: Continue to AI
           ├─► Call OpenAI API
           │   └─► Get AI response
           ├─► Process response
           │   ├─► Check for "(realtime)" keyword
           │   ├─► Check for "(complete)" keyword
           │   └─► Extract URLs
           ├─► Store message in DB
           └─► Return response
               └─► Update chat UI
```

### Real-time Mode Flow

```
1. User types message in chatbot
   └─► onStartChatting() called
       └─► onAiChatBotAssistant(domainId, chatHistory, 'user', message)
           ├─► Check real-time mode
           │   └─► YES: Real-time mode active
           ├─► Store message in DB
           ├─► Trigger Pusher event
           │   └─► onRealTimeChat(chatRoomId, message, id, 'user')
           ├─► Send email notification (if not sent)
           └─► Return { live: true, chatRoom: id }
               └─► Subscribe to Pusher channel
                   └─► Wait for owner response

2. Owner types message in dashboard
   └─► onHandleSentMessage() called
       └─► onOwnerSendMessage(chatRoom, message, 'assistant')
           ├─► Store message in DB
           └─► Trigger Pusher event
               └─► onRealTimeChat(chatRoomId, message, id, 'assistant')
                   └─► Pusher broadcasts to all subscribers
                       ├─► Chatbot window receives message
                       └─► Dashboard receives message
```

## Key Components

### 1. **Embedding Mechanism**
- **Technology**: iframe + PostMessage API
- **Purpose**: Cross-origin communication
- **Security**: Origin validation

### 2. **State Management**
- **Client**: React useState hooks
- **Server**: Prisma + PostgreSQL
- **Real-time**: Pusher channels

### 3. **AI Integration**
- **Provider**: OpenRouter (OpenAI compatible)
- **Model**: `openai/gpt-3.5-turbo`
- **Context**: System prompts + chat history

### 4. **Message Storage**
- **Database**: PostgreSQL via Prisma
- **Tables**: ChatRoom, ChatMessage
- **Relations**: Customer → ChatRoom → ChatMessage

### 5. **Real-time Communication**
- **Technology**: Pusher
- **Channels**: One per ChatRoom (using ChatRoom.id)
- **Events**: `'realtime-mode'`

## Lifecycle States

```
┌─────────────┐
│  EMBEDDED   │  Code snippet creates iframe
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ INITIALIZED │  Domain ID received, config loaded
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   WAITING   │  Welcome message shown, waiting for user
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   CHATTING  │  User sending messages, AI responding
└──────┬──────┘
       │
       ├─► AI Mode (default)
       │   └─► OpenAI processing
       │
       └─► Real-time Mode (triggered)
           └─► Human operator handling
```


# Chatbot Quick Reference

## 📋 Summary

Your chatbot is an **embeddable widget** that can be injected into any website via an iframe. It uses:
- **PostMessage API** for parent-iframe communication
- **Next.js Server Actions** for backend processing
- **OpenAI/OpenRouter** for AI responses
- **Pusher** for real-time messaging
- **PostgreSQL** for data storage

## 🔄 Lifecycle Overview

1. **Embedding** → Code snippet creates iframe
2. **Initialization** → Domain ID passed via PostMessage
3. **Configuration** → Chatbot settings loaded from database
4. **Interaction** → User sends messages, AI responds
5. **Real-time Mode** → Human operator takes over (optional)

## 📡 How It Works

### Embedding Flow
```
Website → Creates iframe → Loads /chatbot page → Receives domainId → Fetches config
```

### Message Flow
```
User Message → Server Action → AI Processing → Database Storage → Response → UI Update
```

### Real-time Flow
```
User Message → Database → Pusher Event → Dashboard/Chatbot (both receive)
```

### 📚 Full Documentation
- **Lifecycle Details**: See `CHATBOT_LIFECYCLE.md`
- **Flow Diagrams**: See `CHATBOT_FLOW_DIAGRAM.md`

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/app/chatbot/page.tsx` | Main chatbot page (iframe target) |
| `src/components/chatbot/index.tsx` | Chatbot component |
| `src/hooks/chatbot/use-chatbot.ts` | Chatbot logic & state |
| `src/actions/bot/index.ts` | Server actions (AI processing) |
| `src/components/forms/settings/code-snippet.tsx` | Embedding code generator |

## 🎯 Key Functions

### Client Side
- `useChatBot()` - Main chatbot hook
- `onStartChatting()` - Handles message submission
- `onGetDomainChatBot()` - Fetches chatbot config

### Server Side
- `onAiChatBotAssistant()` - **Core AI processing logic**
- `onGetCurrentChatBot()` - Gets chatbot configuration
- `onStoreConversations()` - Saves messages to DB
- `onRealTimeChat()` - Triggers Pusher events

## 🔍 Finding Your Domain ID

1. **From Dashboard**: Settings → Code Snippet (shows domain ID)
2. **From Database**: Query `Domain` table, use `id` field
3. **From Browser**: Check console when chatbot loads (PostMessage data)

## ⚠️ Important Notes

1. **Hardcoded URLs**: `localhost:3000` needs to be replaced with env vars
2. **Global Variable**: `customerEmail` in `bot/index.ts` is a code smell
3. **Server Actions Only**: Messages can only be sent through the chatbot UI (not via API)

## 📊 Database Schema

```
Domain (1) ──→ (1) ChatBot
  │
  ├──→ (many) Customer
  │      └──→ (many) ChatRoom
  │             └──→ (many) ChatMessage
  │
  ├──→ (many) HelpDesk
  └──→ (many) FilterQuestions
```

## 🔐 Security Considerations

- ✅ Origin validation in PostMessage handlers
- ❌ Hardcoded localhost URLs (security risk)

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Chatbot not loading | Check domain ID is correct |
| No AI response | Verify OpenAI/OpenRouter API key |
| Real-time not working | Check Pusher credentials |
| Messages not saving | Verify database connection |

## 📝 Next Steps

1. 🔄 **Replace hardcoded URLs** - Use environment variables
2. 🐛 **Fix global variable** - Refactor `customerEmail` in bot/index.ts
3. 📊 **Add logging** - Track chatbot usage
4. 🔒 **Improve error handling** - Better error messages and recovery

---

**Need Help?** Check the detailed documentation files:
- `CHATBOT_LIFECYCLE.md` - Complete lifecycle explanation
- `CHATBOT_FLOW_DIAGRAM.md` - Visual flow diagrams


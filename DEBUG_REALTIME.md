# Debugging Real-time Messages Not Showing in Chatbot

## Issue
Merchant messages sent from `/conversation` are not appearing in the chatbot window, even though Pusher logs show the message is being sent.

## Debugging Steps

### 1. Check Browser Console
Open the browser console (F12) on the chatbot page and look for these logs:

**When real-time mode activates:**
- `🟢 [useChatBot] Switching to real-time mode, chatRoom: [id]`
- `🟢 [useChatBot] New real-time state: {chatroom: "[id]", mode: true}`
- `🟡 [BotWindow] Real-time mode active, chatroom: [id]`
- `🟢 [RealTimeMode] Component rendered with chatRoomId: [id]`

**When subscribing:**
- `🔵 [CHATBOT] Subscribing to Pusher channel: [id]`
- `🔵 [CHATBOT] Pusher client state: [state]`
- `✅ [CHATBOT] Successfully subscribed to channel: [id]`
- `🔵 [CHATBOT] Bound to realtime-mode event on channel: [id]`

**When message is received:**
- `✅ [CHATBOT] Received realtime message from merchant: [data]`
- `✅ [CHATBOT] Adding message to chat: [message]`
- `✅ [CHATBOT] Updated chats array: [array]`

### 2. Verify Channel ID Match
The channel ID in Pusher logs should match the chatRoom ID in the console logs.

**From Pusher logs:**
```
Channel: 803ef9c9-66b9-454b-8247-8e838bbbb0d7
```

**Should match console log:**
```
🔵 [CHATBOT] Subscribing to Pusher channel: 803ef9c9-66b9-454b-8247-8e838bbbb0d7
```

### 3. Check Real-time Mode Status
Look for the "Real Time" badge in the chatbot window. If it's not showing:
- Real-time mode hasn't been activated
- Check console for: `🟡 [BotWindow] Real-time mode NOT active`

### 4. Verify Pusher Connection
Check if Pusher client is connected:
- Look for: `🔵 [CHATBOT] Pusher client state: connected`
- If state is not "connected", Pusher isn't initialized properly

### 5. Check for Errors
Look for any error messages:
- `❌ Pusher client is not initialized!`
- `❌ [CHATBOT] Subscription error: [error]`

## Common Issues

### Issue 1: Real-time Mode Not Activated
**Symptom:** No "Real Time" badge visible
**Solution:** 
- Send a message that triggers real-time mode (AI adds "(realtime)" keyword)
- Or manually activate from dashboard

### Issue 2: Channel ID Mismatch
**Symptom:** Different channel IDs in Pusher logs vs console
**Solution:** 
- Verify the chatRoom ID being passed to `useRealTime` matches the one in Pusher logs
- Check that `realtimeMode.chatroom` is the correct UUID

### Issue 3: Pusher Not Connected
**Symptom:** Pusher client state is not "connected"
**Solution:**
- Check environment variables: `NEXT_PUBLIC_PUSHER_APP_KEY`, `NEXT_PUBLIC_PUSHER_APP_CLUSTOR`
- Verify Pusher credentials are correct

### Issue 4: Subscription Happens After Message Sent
**Symptom:** Message sent before subscription completes
**Solution:**
- Wait for `✅ Successfully subscribed to channel` before sending message
- Or send another message after subscription is confirmed

## Testing Checklist

- [ ] Real-time mode is active (see "Real Time" badge)
- [ ] Console shows subscription to correct channel
- [ ] Channel ID matches Pusher logs
- [ ] Pusher client is connected
- [ ] No errors in console
- [ ] Message sent after subscription confirmed

## Next Steps

1. Open browser console on chatbot page
2. Send a message from `/conversation` (merchant side)
3. Copy all console logs starting with emojis (🔵, ✅, 🟢, etc.)
4. Compare channel IDs
5. Check if subscription succeeded
6. Verify message was received


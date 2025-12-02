# N8N Integration Guide

## Webhook Endpoint

**Backend webhook endpoint for N8N:**

```
POST http://localhost:3000/executions/webhook
```

## Workflow Setup

### 1. Initial Trigger (Webhook)

Your N8N workflow receives the initial request from the backend:

**Payload received:**

```json
{
  "executionId": 123,
  "workflowId": 1,
  "videoUrl": "https://youtube.com/..."
  // ... other inputs
}
```

**IMPORTANT:** Save `executionId` to a variable for use in all subsequent webhooks.

### 2. Sending Events Back

For EVERY event you want to send back to the frontend, use an HTTP Request node:

**URL:** `http://localhost:3000/executions/webhook`
**Method:** POST
**Body:**

```json
{
  "executionId": {{ $('Webhook').item.json.executionId }},
  "type": "scene_generated",
  "scene_index": 0,
  "prompt": "A beautiful sunset...",
  "mediaType": "image",
  "filename": "scene_0.png",
  "data": { /* any additional data */ }
}
```

### 3. Event Types

- `scene_generated` - When a scene is created
- `final_result` - The final video/result
- `youtube_metadata` - YouTube title, description, thumbnails
- `error` - When something fails

### 4. Final Result

```json
{
  "executionId": 123,
  "type": "final_result",
  "message": "Video generated successfully!",
  "mediaType": "video",
  "filename": "final_video.mp4"
}
```

## Example N8N Workflow Structure

```
1. Webhook (Trigger)
   ↓
2. Set Variable (executionId = {{$json.executionId}})
   ↓
3. Process Video
   ↓
4. For each scene:
   HTTP Request → http://localhost:3000/executions/webhook
   Body: { executionId, type: "scene_generated", ... }
   ↓
5. Final HTTP Request
   Body: { executionId, type: "final_result", ... }
```

## Troubleshooting

**"Webhook not registered" error:**

- Make sure your workflow is **Active** (toggle in top-right)
- Test mode only works once after clicking "Execute Workflow"

**Events not showing in frontend:**

- Check that `executionId` is included in ALL webhook calls
- Verify the webhook URL is correct
- Check backend logs for errors

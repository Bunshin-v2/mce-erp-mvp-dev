# Nexus AI Gateway - Quick Reference

## 🎯 Your Current Setup

### GCP Instance Details
- **Instance**: `morgan-erp`
- **External IP**: `34.135.130.6`
- **Internal IP**: `10.128.0.4`
- **Zone**: `us-central1-a`
- **Project**: `gen-lang-client-0644776556`

### Docker Container
- **Container**: `nexus-ai-gateway`
- **Port**: 8000
- **Auto-restart**: Yes (`--restart always`)
- **Detached**: Yes (`-d` flag)

### Vercel Deployment
- **URL**: https://morgan-mce.vercel.app
- **Endpoint**: `/api/ai/chat`
- **Status**: Live ✅

---

## ✅ Closing PuTTY is SAFE

Your Docker command uses:
```bash
-d              # Runs in background (detached)
--restart always # Auto-restarts on crash/reboot
```

**After starting the container, you can close PuTTY immediately.**

---

## 🚀 One-Click Commands (Google Cloud SDK - RECOMMENDED)

**Prerequisites**: Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install), then run `gcloud init`

### View Logs (Windows)
```cmd
start-nexus-gateway-gcloud.bat
```
Shows live container logs. Press Ctrl+C to exit (container keeps running).

### Check Status
```cmd
check-gateway-gcloud.bat
```
Shows running containers and recent logs.

### Restart Gateway
```cmd
restart-gateway-gcloud.bat
```
Stops and restarts the container with fresh configuration.

---

## 🔧 Alternative: PuTTY Method (Backup)

If you prefer PuTTY over gcloud:
```cmd
start-nexus-gateway-putty.bat
```
**Requires**: SSH key setup in GCP + PuTTY installed

---

## 📡 Manual Commands

### SSH to GCP
```bash
ssh t1glish@morgan-erp
```

### Start Container
```bash
sudo docker run -d \
  --name nexus-ai-gateway \
  --restart always \
  -p 8000:8000 \
  --env-file .env \
  nexus-ai-gateway:latest
```

### Check Status
```bash
sudo docker ps
sudo docker logs -f nexus-ai-gateway
```

### Stop Container
```bash
sudo docker stop nexus-ai-gateway
sudo docker rm nexus-ai-gateway
```

### Restart Container
```bash
sudo docker restart nexus-ai-gateway
```

---

## 🧪 Testing Endpoints

### Test Local Gateway (Port 8000)
```bash
curl -X POST http://[YOUR-IP]:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"health check"}'
```

### Test Vercel Deployment
```bash
curl -X POST https://morgan-mce.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"List 3 projects"}'
```

### Expected Response
```json
{
  "success": true,
  "reply": "Here are 3 projects...",
  "data": {...}
}
```

---

## 🔧 Troubleshooting

### Container Not Starting
```bash
# Check logs
sudo docker logs nexus-ai-gateway

# Check if port is in use
sudo netstat -tulpn | grep 8000

# Rebuild image
sudo docker build -t nexus-ai-gateway:latest .
```

### Environment Variables Missing
```bash
# Check .env file exists
ls -la ~/.env

# Verify .env is in correct directory
cd ~
cat .env
```

### Connection Refused
```bash
# Check firewall
sudo ufw status
sudo ufw allow 8000

# Check if container is running
sudo docker ps
```

---

## 📊 RAG Implementation Status

### ✅ Current Implementation: SOUND

Your bot uses **Function Calling** (not traditional RAG):
- 9 specialized database query tools
- Direct SQL queries to `daily_performance_v2`
- Real-time data access
- Error handling with fallbacks

**Why this is better than RAG for your use case:**
- RAG = Good for documents/text
- Function Calling = Perfect for structured analytics
- Your data is metrics (revenue, orders) not documents
- Always fresh, no embedding costs

**Implementation file**: `src/app/api/aichat/route.ts`

---

## 🎯 Quick Checklist

After starting container:
- [ ] PuTTY can be closed safely
- [ ] Container auto-restarts on server reboot
- [ ] Logs accessible via `sudo docker logs -f nexus-ai-gateway`
- [ ] API accessible on port 8000
- [ ] Vercel deployment independent (already live)

---

**Last Updated**: February 4, 2026
**Status**: Production Ready ✅

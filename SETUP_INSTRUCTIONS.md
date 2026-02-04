# 🚀 Nexus Gateway - Quick Setup

## ✅ Current Status

Your container is **already running** on Google Cloud!

- **Instance**: `morgan-erp` (34.135.130.6)
- **Container**: Running with `--restart always`
- **You can close PuTTY safely** ✓

---

## 📋 Choose Your Control Method

### **Option 1: Google Cloud SDK** (Recommended)

**One-time setup** (5 minutes):

1. **Download Google Cloud SDK**: https://cloud.google.com/sdk/docs/install
2. **Install** and run the installer
3. **Initialize**:
   ```cmd
   gcloud init
   ```
   - Login with your Google account
   - Select project: `gen-lang-client-0644776556`
   - Skip default region (not needed)

4. **Done!** Now you can use:
   - `start-nexus-gateway-gcloud.bat` - View logs
   - `check-gateway-gcloud.bat` - Check status
   - `restart-gateway-gcloud.bat` - Restart container

---

### **Option 2: Just Use Browser SSH** (Easiest)

Keep using Google Cloud Console's browser SSH:
https://ssh.cloud.google.com/v2/ssh/projects/gen-lang-client-0644776556/zones/us-central1-a/instances/morgan-erp

**Commands to know**:
```bash
# Check container status
sudo docker ps

# View logs
sudo docker logs -f nexus-ai-gateway

# Restart container
sudo docker restart nexus-ai-gateway

# Stop container
sudo docker stop nexus-ai-gateway

# Start container (if stopped)
sudo docker run -d --name nexus-ai-gateway --restart always -p 8000:8000 --env-file .env nexus-ai-gateway:latest
```

---

### **Option 3: PuTTY** (Advanced)

If you want to use PuTTY with the external IP:

1. **Set up SSH key** in GCP Console:
   - Go to: Compute Engine > Metadata > SSH Keys
   - Click "Add SSH Key"
   - Generate key with PuTTYgen
   - Add public key to GCP

2. **Edit** `start-nexus-gateway-putty.bat`:
   - Update `SSH_KEY_PATH` to your .ppk file location

3. **Run**: `start-nexus-gateway-putty.bat`

---

## 🧪 Testing Your Gateway

### Test the GCP Container (Port 8000)

**From inside GCP** (browser SSH):
```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"health check"}'
```

**From Windows** (requires firewall rule):
```cmd
curl.exe -X POST http://34.135.130.6:8000/api/ai/chat -H "Content-Type: application/json" -d "{\"message\":\"test\"}"
```

### Test Vercel Deployment (Already Live)

```cmd
curl.exe -X POST https://morgan-mce.vercel.app/api/ai/chat -H "Content-Type: application/json" -d "{\"message\":\"List 3 projects\"}"
```

---

## 🎯 What You Need to Know

### ✅ Container is Running
Your Docker command has:
```bash
-d              # Detached (background)
--restart always # Auto-restart on crash/reboot
```

**This means**:
- ✅ You can close PuTTY/browser SSH anytime
- ✅ Container survives server reboots
- ✅ Container auto-restarts if it crashes
- ✅ No need to "keep it running" manually

### 📊 How to Check If It's Working

**Method 1**: Run this in browser SSH:
```bash
sudo docker ps
```
Should show: `nexus-ai-gateway` with status "Up X minutes/hours"

**Method 2**: Use a .bat file:
```cmd
check-gateway-gcloud.bat
```

**Method 3**: Test the API:
```cmd
curl.exe -X POST https://morgan-mce.vercel.app/api/ai/chat -H "Content-Type: application/json" -d "{\"message\":\"ping\"}"
```

---

## 🔥 Quick Reference

| Task | Command |
|------|---------|
| View logs | `start-nexus-gateway-gcloud.bat` |
| Check status | `check-gateway-gcloud.bat` |
| Restart | `restart-gateway-gcloud.bat` |
| SSH manually | Click bookmark in browser |
| Test API | `curl.exe -X POST https://morgan-mce.vercel.app/api/ai/chat ...` |

---

## ❓ FAQ

### Do I need to keep PuTTY/SSH open?
**No!** Your container runs with `-d --restart always`, so it's independent.

### How do I know it's still running?
Run `check-gateway-gcloud.bat` or open browser SSH and run `sudo docker ps`

### What if the server reboots?
Container auto-starts because of `--restart always`

### Can I access it from my phone?
Yes! Use the Vercel deployment: https://morgan-mce.vercel.app/api/ai/chat

### How do I update the bot code?
1. SSH into GCP
2. Rebuild image: `sudo docker build -t nexus-ai-gateway:latest .`
3. Run: `restart-gateway-gcloud.bat`

---

**You're all set! The gateway is running and will stay running.** 🎉

For full details, see: `NEXUS_GATEWAY_GUIDE.md`

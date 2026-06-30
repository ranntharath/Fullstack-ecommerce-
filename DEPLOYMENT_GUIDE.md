# VPS Production Deployment Guide from Scratch (HTTPS enabled)

This guide walks you through deploying the complete containerized stack (Next.js frontend, Django backend, PostgreSQL database, and Nginx reverse proxy with SSL) onto a fresh Ubuntu VPS for your domain **morktinh.store**.

---

## Step 1: Connect to your VPS and Update the System

1. Open your local terminal/command prompt and connect to your VPS via SSH:
   ```bash
   ssh root@your-vps-ip
   ```
2. Update the package registry and upgrade installed packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## Step 2: Install Docker and Docker Compose

Run the following commands to install Docker and Docker Compose:

```bash
# Install required dependencies
sudo apt install -y curl gnupg lsb-release ca-certificates apt-transport-https

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine & Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable and start the Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

---

## Step 3: Clone Repository and Configure Environment

1. Clone your project onto the VPS (replace with your actual git repository URL):
   ```bash
   git clone <your-git-repository-url>
   cd morktinh
   ```

2. **Configure Django Backend environment variables**:
   Create the backend `.env` file:
   ```bash
   nano morktinh-backend/.env
   ```
   Paste the following configuration:
   ```env
   BAKONG_TOKEN=your-bakong-token-here
   KHQR_ACCOUNT_ID=rann_tharath@bkrt
   KHQR_MERCHANT_NAME=Rann tharath
   KHQR_MERCHANT_CITY=Phnom Penh
   KHQR_STORE_LABEL=Mork Tinh
   KHQR_PHONE_NUMBER=060535771
   KHQR_TERMINAL_LABEL=WebQR

   # Django configuration
   SECRET_KEY=generate-a-secure-random-key-here
   DEBUG=False
   ALLOWED_HOSTS=localhost,127.0.0.1,morktinh.store,www.morktinh.store
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://morktinh.store,https://morktinh.store,https://www.morktinh.store

   # PostgreSQL settings
   POSTGRES_DB=morktinh
   POSTGRES_USER=morktinh
   POSTGRES_PASSWORD=your-secure-postgres-password
   POSTGRES_HOST=db
   POSTGRES_PORT=5432
   POSTGRES_CONN_MAX_AGE=60

   # Email settings
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=tharath8061@gmail.com
   EMAIL_HOST_PASSWORD=your-email-app-password
   EMAIL_USE_TLS=True
   ```
   *(Press `Ctrl + O`, then `Enter`, then `Ctrl + X` to save and exit).*

3. **Configure Next.js Frontend environment variables**:
   Create the frontend `.env` file:
   ```bash
   nano morktinh-frontend/.env
   ```
   Paste the following:
   ```env
   NEXT_PUBLIC_API_URL=/api/
   ```
   *(Press `Ctrl + O`, then `Enter`, then `Ctrl + X` to save and exit).*

---

## Step 4: Obtain SSL Certificates (Certbot Standalone)

Let's Encrypt certificates must exist on the VPS host *before* starting the Nginx container, or Nginx will fail to start due to missing certificate paths.

1. **Install Certbot** on your VPS:
   ```bash
   sudo apt install -y certbot
   ```
2. **Obtain SSL Certificates** (ensure port 80 is not currently being used by any service):
   ```bash
   sudo certbot certonly --standalone -d morktinh.store -d www.morktinh.store
   ```
   * Enter your email address when prompted.
   * Agree to the terms of service.
   * Certbot will verify domain ownership and write the keys to `/etc/letsencrypt/live/morktinh.store/`.

---

## Step 5: Deploy the Containers

Once the certificates are successfully generated, you can start the complete system:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Verify running status:
```bash
docker compose -f docker-compose.prod.yml ps
```
Ensure all four containers (`morktinh-db`, `morktinh-backend`, `morktinh-frontend`, and `morktinh-nginx`) are running.

---

## Step 6: Set up SSL Auto-Renewal Hook

Since Let's Encrypt certificates expire every 90 days, configure Nginx to reload automatically whenever the certificate renews:

1. Create a reload script:
   ```bash
   sudo nano /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
   ```
2. Paste this content:
   ```bash
   #!/bin/bash
   docker exec morktinh-nginx nginx -s reload
   ```
3. Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).
4. Make the script executable:
   ```bash
   sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
   ```

---

## Useful Command Cheat Sheet

### View logs
* View all logs: `docker compose -f docker-compose.prod.yml logs`
* View Nginx logs: `docker compose -f docker-compose.prod.yml logs nginx`
* View Backend logs: `docker compose -f docker-compose.prod.yml logs backend`

### Rebuilding/Restarting
* Rebuild and recreate all containers:
  ```bash
  docker compose -f docker-compose.prod.yml up -d --build --force-recreate
  ```
* Rebuild backend only:
  ```bash
  docker compose -f docker-compose.prod.yml up -d --build backend
  ```

### Database Management (Django CLI inside container)
* Run migrations manually:
  ```bash
  docker exec -it morktinh-backend python manage.py migrate
  ```
* Create a superuser:
  ```bash
  docker exec -it morktinh-backend python manage.py createsuperuser
  ```

# AWS EC2 Single-Server Deployment Guide (All in One)

This guide walks you through deploying the complete containerized stack (Next.js frontend, Django backend, PostgreSQL database, and Nginx reverse proxy) onto a single AWS EC2 instance.

---

## 1. Prerequisites & AWS Setup

### EC2 Instance Provisioning
1. **OS:** Ubuntu 22.04 LTS (recommended) or Ubuntu 24.04 LTS.
2. **Instance Type:** `t3.medium` or larger (Next.js builds require at least 2GB of RAM; if using a smaller instance like `t3.small` or `t3.micro`, you might need to enable Swap memory to prevent build crashes).
3. **Elastic IP:** Allocate and associate an Elastic IP (EIP) with your EC2 instance so that its public IP remains constant.
4. **DNS Settings:** Point your domain names (e.g., `yourdomain.com` and `www.yourdomain.com`) to your EC2 instance's Elastic IP.

### Security Group Inbound Rules
Configure your EC2 Security Group to allow the following inbound traffic:
- **SSH (Port 22):** Only from your IP address.
- **HTTP (Port 80):** From anywhere (`0.0.0.0/0`, `::/0`).
- **HTTPS (Port 443):** From anywhere (`0.0.0.0/0`, `::/0`).

---

## 2. Server Installation & Configuration

Connect to your EC2 instance via SSH:
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-elastic-ip
```

### Install Docker and Docker Compose
Run the following script to install Docker and Docker Compose:
```bash
# Update package database
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl gnupg lsb-release ca-certificates apt-transport-https

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine & Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to the docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER
```
*Note: Exit the SSH session and log back in for the group changes to take effect.*

---

## 3. Clone Repository and Configure Environment

Clone your project repository onto the EC2 server and navigate to the root directory.

### Set up Django Environment Variables
Create `/morktinh-backend/.env`:
```bash
nano morktinh-backend/.env
```
Add the following production values:
```env
# Database Settings
POSTGRES_DB=morktinh
POSTGRES_USER=morktinh
POSTGRES_PASSWORD=secure-random-db-password-here
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_CONN_MAX_AGE=60

# Django Settings
SECRET_KEY=generate-a-secure-random-django-secret-key
DEBUG=False
# Add your domains and EC2 internal IP
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,backend,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Bakong KHQR settings
BAKONG_TOKEN=your-bakong-token-here
KHQR_ACCOUNT_ID=rann_tharath@bkrt
KHQR_MERCHANT_NAME=Rann tharath
KHQR_MERCHANT_CITY=Phnom Penh
KHQR_STORE_LABEL=IRCT SHOP
KHQR_PHONE_NUMBER=060535771
KHQR_TERMINAL_LABEL=WebQR

# Email SMTP Settings (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-app-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=morktinh <your-email@gmail.com>
```

### Set up Frontend Environment Variables
Create `/morktinh-frontend/.env`:
```bash
nano morktinh-frontend/.env
```
Add the following:
```env
# Points local frontend requests to the relative API endpoint proxied by Nginx
NEXT_PUBLIC_API_URL=/api/
```

---

## 4. Run the Production Containers

Run Docker Compose to build and start the containers in detached (background) mode:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Verify Running Status
```bash
docker compose -f docker-compose.prod.yml ps
```
Verify that all four containers (`morktinh-db`, `morktinh-backend`, `morktinh-frontend`, `morktinh-nginx`) are running. If Nginx restarts repeatedly, check its logs:
```bash
docker compose -f docker-compose.prod.yml logs nginx
```

---

## 5. Enable SSL/TLS (HTTPS) using Certbot

To secure your deployment with free HTTPS certificates from Let's Encrypt:

### Install Certbot on the Host Machine
```bash
sudo apt install -y certbot
```

### Obtain the Certificates
Stop the Docker containers temporarily so Certbot can run on port 80 to verify your domain ownership:
```bash
docker compose -f docker-compose.prod.yml down
```
Request certificates for your domain names:
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```
Enter your email and agree to the terms. Certbot will save your certificates under `/etc/letsencrypt/live/yourdomain.com/`.

### Update Nginx to use SSL
1. Open your Nginx configuration:
   ```bash
   nano nginx/default.conf
   ```
2. Replace its contents with a secure SSL configuration (making sure to replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 25M;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 1. Route to Django Admin
    location /django-admin/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Route to Django Backend Container (API)
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Serve Django Admin Static Files directly
    location /static/ {
        alias /static/;
        access_log off;
        expires 30d;
    }

    # 4. Serve Media Directly
    location /media/ {
        alias /media/;
        access_log off;
        expires 7d;
    }

    # 5. Route to Next.js Frontend Container
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

3. Update `docker-compose.prod.yml` to mount the Let's Encrypt certificates folder into the Nginx container:
   ```bash
   nano docker-compose.prod.yml
   ```
   Add the SSL volume mapping under the `nginx` service:
   ```yaml
     nginx:
       image: nginx:alpine
       container_name: morktinh-nginx
       ports:
         - "80:80"
         - "443:443"  # <-- Open HTTPS port
       volumes:
         - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
         - ./morktinh-backend/media:/media:ro
         - django_static:/static:ro
         - /etc/letsencrypt:/etc/letsencrypt:ro # <-- Mount Certificates
       restart: unless-stopped
       depends_on:
         - frontend
         - backend
   ```

4. Restart your containers in detached mode:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

### Set up SSL Auto-Renewal
Let's Encrypt certificates are valid for 90 days. Certbot installs a systemd timer or cron job to auto-renew them. 
To reload Nginx automatically when the certificates renew, add a deploy hook to Certbot:
Create or edit `/etc/letsencrypt/cli.ini` or run:
```bash
sudo certbot renew --dry-run
```
To automate the Nginx container reload upon renewal, create a script at `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh`:
```bash
sudo nano /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```
Add the following line to reload the container's Nginx:
```bash
#!/bin/bash
docker exec morktinh-nginx nginx -s reload
```
Make the hook executable:
```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

---

## 6. Troubleshooting

### Container Logs
To view logs for all services or a specific service:
```bash
docker compose -f docker-compose.prod.yml logs
docker compose -f docker-compose.prod.yml logs backend
```

### Static Files Not Found / Missing Admin Styles
Ensure that:
1. `django_static` volume is correctly configured.
2. The backend logs show `Copying ... static files to '/app/staticfiles'`.
3. Check the content inside the volume:
   ```bash
   docker exec -it morktinh-backend ls /app/staticfiles
   ```

### Next.js Build Fails / Server Out of Memory
Next.js builds require significant memory. If your EC2 instance runs out of RAM, you can add 2GB of Swap memory:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

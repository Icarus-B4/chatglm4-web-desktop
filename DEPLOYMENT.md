# ChatGLM Web Application - Deployment-Handbuch

## Übersicht

Dieses Handbuch beschreibt verschiedene Deployment-Strategien für die ChatGLM Web Application, von einfachen lokalen Installationen bis hin zu skalierbaren Cloud-Deployments.

## 🎯 Deployment-Optionen

### 1. Lokales Deployment (Entwicklung/Testing)
### 2. Docker Deployment (Empfohlen)
### 3. Cloud Deployment (AWS, GCP, Azure)
### 4. Kubernetes Deployment
### 5. Reverse Proxy Setup (Nginx/Apache)

---

## 🏠 1. Lokales Deployment

### Windows
```powershell
# Voraussetzungen prüfen
node --version    # Sollte v18+ sein
cargo --version   # Sollte 1.82+ sein

# Projekt bauen
.\build.ps1 prod

# Konfiguration anpassen
copy .env.example .env
# Bearbeiten Sie .env mit Ihrem API-Schlüssel

# Anwendung starten
.\target\release\chatglm-web.exe
```

### Linux/macOS
```bash
# Voraussetzungen prüfen
node --version
cargo --version

# Projekt bauen
./build.sh prod

# Konfiguration
cp .env.example .env
# Bearbeiten Sie .env

# Anwendung starten
./target/release/chatglm-web
```

### Systemd Service (Linux)
```bash
# Service-Datei erstellen
sudo nano /etc/systemd/system/chatglm-web.service
```

```ini
[Unit]
Description=ChatGLM Web Application
After=network.target

[Service]
Type=simple
User=chatglm
Group=chatglm
WorkingDirectory=/opt/chatglm-web
Environment=RUST_LOG=info
EnvironmentFile=/opt/chatglm-web/.env
ExecStart=/opt/chatglm-web/target/release/chatglm-web
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable chatglm-web
sudo systemctl start chatglm-web
sudo systemctl status chatglm-web
```

---

## 🐳 2. Docker Deployment

### Einfaches Docker Deployment

```bash
# Image bauen
docker build -t chatglm-web:latest .

# Container starten
docker run -d \
  --name chatglm-web \
  --restart unless-stopped \
  -p 3000:3000 \
  -e GLM_API_KEY="your-api-key" \
  -e RUST_LOG="info" \
  -v /opt/chatglm-web/logs:/app/logs \
  chatglm-web:latest
```

### Docker Compose (Empfohlen)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  chatglm-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: chatglm-web-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GLM_API_KEY=${GLM_API_KEY}
      - GLM_MODEL=${GLM_MODEL:-glm-4.5}
      - SERVER_HOST=0.0.0.0
      - SERVER_PORT=3000
      - RUST_LOG=${RUST_LOG:-info}
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config:ro
    networks:
      - chatglm-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: chatglm-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - chatglm-web
    networks:
      - chatglm-network

networks:
  chatglm-network:
    driver: bridge
```

```bash
# Deployment
docker-compose -f docker-compose.prod.yml up -d

# Updates
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## ☁️ 3. Cloud Deployment

### AWS EC2 Deployment

#### EC2-Instanz vorbereiten
```bash
# Ubuntu 20.04 LTS auf EC2-Instanz
sudo apt update && sudo apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Deployment-Skript
```bash
#!/bin/bash
# deploy-aws.sh

set -e

# Variablen
REPO_URL="https://github.com/your-org/chatglm-web.git"
DEPLOY_DIR="/opt/chatglm-web"
BACKUP_DIR="/opt/backups"

# Backup erstellen
if [ -d "$DEPLOY_DIR" ]; then
    sudo mkdir -p $BACKUP_DIR
    sudo tar -czf "$BACKUP_DIR/chatglm-web-$(date +%Y%m%d-%H%M%S).tar.gz" -C $DEPLOY_DIR .
fi

# Code aktualisieren
sudo rm -rf $DEPLOY_DIR
sudo git clone $REPO_URL $DEPLOY_DIR
cd $DEPLOY_DIR

# Konfiguration
sudo cp .env.example .env
sudo nano .env  # API-Schlüssel konfigurieren

# Deployment
sudo docker-compose -f docker-compose.prod.yml up -d

echo "Deployment abgeschlossen!"
echo "Anwendung verfügbar unter: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
```

### AWS ECS Deployment

#### Task Definition (task-definition.json)
```json
{
  "family": "chatglm-web",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "chatglm-web",
      "image": "your-account.dkr.ecr.region.amazonaws.com/chatglm-web:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SERVER_HOST",
          "value": "0.0.0.0"
        }
      ],
      "secrets": [
        {
          "name": "GLM_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:chatglm-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/chatglm-web",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

---

## ⚓ 4. Kubernetes Deployment

### Kubernetes Manifests

#### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: chatglm-web
```

#### ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: chatglm-config
  namespace: chatglm-web
data:
  config.toml: |
    [server]
    host = "0.0.0.0"
    port = 3000
    timeout = 30
    
    [chatglm]
    api_url = "https://api.z.ai/v1"
    model = "glm-4.5"
    max_tokens = 4096
    temperature = 0.7
    top_p = 0.9
    stream = false
    
    [logging]
    level = "info"
    format = "json"
```

#### Secret
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: chatglm-secret
  namespace: chatglm-web
type: Opaque
data:
  api-key: <base64-encoded-api-key>
```

#### Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatglm-web
  namespace: chatglm-web
  labels:
    app: chatglm-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatglm-web
  template:
    metadata:
      labels:
        app: chatglm-web
    spec:
      containers:
      - name: chatglm-web
        image: chatglm-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: GLM_API_KEY
          valueFrom:
            secretKeyRef:
              name: chatglm-secret
              key: api-key
        - name: SERVER_HOST
          value: "0.0.0.0"
        - name: RUST_LOG
          value: "info"
        volumeMounts:
        - name: config
          mountPath: /app/config.toml
          subPath: config.toml
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: config
        configMap:
          name: chatglm-config
```

#### Service
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: chatglm-web-service
  namespace: chatglm-web
spec:
  selector:
    app: chatglm-web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: chatglm-web-ingress
  namespace: chatglm-web
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - chatglm.example.com
    secretName: chatglm-tls
  rules:
  - host: chatglm.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: chatglm-web-service
            port:
              number: 80
```

#### Deployment-Befehle
```bash
# Kubernetes Deployment
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Status prüfen
kubectl get pods -n chatglm-web
kubectl logs -f deployment/chatglm-web -n chatglm-web
```

---

## 🔧 5. Reverse Proxy Setup

### Nginx Konfiguration (Vollständig)

```nginx
# /etc/nginx/sites-available/chatglm-web
server {
    listen 80;
    server_name chatglm.example.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chatglm.example.com;

    # SSL-Konfiguration
    ssl_certificate /etc/letsencrypt/live/chatglm.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatglm.example.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Logging
    access_log /var/log/nginx/chatglm-access.log;
    error_log /var/log/nginx/chatglm-error.log;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=ws:10m rate=5r/s;

    # Main Application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API Endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # WebSocket
    location /ws {
        limit_req zone=ws burst=10 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
        proxy_buffering off;
    }

    # Static Files Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:3000;
        access_log off;
    }
}
```

### Apache Konfiguration

```apache
# /etc/apache2/sites-available/chatglm-web.conf
<VirtualHost *:80>
    ServerName chatglm.example.com
    Redirect permanent / https://chatglm.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName chatglm.example.com
    
    # SSL-Konfiguration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/chatglm.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/chatglm.example.com/privkey.pem
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=63072000"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    
    # Proxy Configuration
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Main Application
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # WebSocket Support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:3000/$1" [P,L]
    
    # Logging
    CustomLog /var/log/apache2/chatglm-access.log combined
    ErrorLog /var/log/apache2/chatglm-error.log
</VirtualHost>
```

---

## 📊 Monitoring und Logging

### Prometheus Monitoring

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'chatglm-web'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
    scrape_interval: 10s
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "ChatGLM Web Monitoring",
    "panels": [
      {
        "title": "HTTP Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### Log Aggregation (ELK Stack)

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

---

## 🔒 Sicherheitsmaßnahmen

### 1. Umgebungsvariablen sicher verwalten
```bash
# Verwenden Sie Services wie:
# - AWS Secrets Manager
# - Azure Key Vault
# - Kubernetes Secrets
# - HashiCorp Vault
```

### 2. Firewall-Konfiguration
```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Nur über Reverse Proxy
sudo ufw enable
```

### 3. SSL/TLS mit Let's Encrypt
```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# Zertifikat erstellen
sudo certbot --nginx -d chatglm.example.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

---

## 🚀 Automatisierte Deployments

### GitHub Actions Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/chatglm-web
          git pull origin main
          docker-compose -f docker-compose.prod.yml up -d --build
```

### Rollback-Strategie
```bash
#!/bin/bash
# rollback.sh

BACKUP_DIR="/opt/backups"
DEPLOY_DIR="/opt/chatglm-web"

# Letztes Backup finden
LATEST_BACKUP=$(ls -t $BACKUP_DIR/chatglm-web-*.tar.gz | head -n1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "Kein Backup gefunden!"
    exit 1
fi

echo "Rollback zu: $LATEST_BACKUP"

# Services stoppen
docker-compose -f $DEPLOY_DIR/docker-compose.prod.yml down

# Backup wiederherstellen
sudo rm -rf $DEPLOY_DIR
sudo mkdir -p $DEPLOY_DIR
sudo tar -xzf "$LATEST_BACKUP" -C $DEPLOY_DIR

# Services starten
cd $DEPLOY_DIR
docker-compose -f docker-compose.prod.yml up -d

echo "Rollback abgeschlossen!"
```

---

## 📋 Wartung und Updates

### Regelmäßige Wartungsaufgaben

```bash
#!/bin/bash
# maintenance.sh

# Logs rotieren
find /opt/chatglm-web/logs -name "*.log" -type f -mtime +7 -delete

# Docker Images bereinigen
docker system prune -f

# Backups bereinigen (älter als 30 Tage)
find /opt/backups -name "chatglm-web-*.tar.gz" -mtime +30 -delete

# System-Updates prüfen
apt list --upgradable

# SSL-Zertifikat prüfen
certbot certificates
```

### Update-Prozess
```bash
#!/bin/bash
# update.sh

set -e

# Backup erstellen
./backup.sh

# Code aktualisieren
git pull origin main

# Dependencies aktualisieren
docker-compose -f docker-compose.prod.yml pull

# Anwendung neu starten
docker-compose -f docker-compose.prod.yml up -d

# Health Check
sleep 30
curl -f http://localhost:3000/health || {
    echo "Health Check fehlgeschlagen - Rollback..."
    ./rollback.sh
    exit 1
}

echo "Update erfolgreich abgeschlossen!"
```

---

## 📞 Support und Troubleshooting

### Häufige Deployment-Probleme

1. **Port-Konflikte**: Stellen Sie sicher, dass Port 3000 verfügbar ist
2. **Berechtigungen**: Docker-Benutzer muss in der docker-Gruppe sein
3. **Firewall**: Öffnen Sie erforderliche Ports
4. **SSL-Zertifikate**: Überprüfen Sie Domain-Konfiguration
5. **API-Schlüssel**: Stellen Sie sicher, dass Secrets korrekt konfiguriert sind

### Logs überprüfen
```bash
# Docker Logs
docker-compose logs -f chatglm-web

# System Logs
journalctl -u chatglm-web -f

# Nginx Logs
tail -f /var/log/nginx/chatglm-*.log

# Anwendungslogs
tail -f /opt/chatglm-web/logs/app.log
```

### Performance-Monitoring
```bash
# Ressourcenverbrauch
docker stats

# Netzwerk-Verbindungen
netstat -tulpn | grep :3000

# System-Metriken
htop
```

Das war's! Ihr Deployment sollte nun erfolgreich laufen. Bei Problemen konsultieren Sie die Logs und die Troubleshooting-Sektion.

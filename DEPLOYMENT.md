# Deployment Guide

This guide provides detailed instructions for deploying the Birthday Notification System in various environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Cloud Deployment](#cloud-deployment)
- [Docker Deployment](#docker-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Pre-Deployment Checklist

Before deploying the Birthday Notification System, ensure you have:

- [ ] Node.js v14+ installed on target system
- [ ] SMS gateway account with API credentials
- [ ] Excel file with associate data prepared
- [ ] Mobile number for receiving notifications
- [ ] Network access to SMS gateway API
- [ ] Appropriate file system permissions
- [ ] Backup strategy for Excel data
- [ ] Monitoring solution (optional but recommended)

## Development Environment

### Local Development Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd birthday-notification-system
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your development settings
```

4. **Prepare test data:**

```bash
# Create data directory if it doesn't exist
mkdir -p data

# Copy your Excel file
cp /path/to/your/associates.xlsx ./data/associates.xlsx
```

5. **Run tests:**

```bash
npm test
```

6. **Start application:**

```bash
npm run dev
```

### Development Best Practices

- Use a separate SMS gateway account for development
- Use a test mobile number for notifications
- Keep a small test Excel file with known birthdays
- Enable debug logging: `LOG_LEVEL=DEBUG`
- Test with various date scenarios

## Production Environment

### Server Requirements

**Minimum Requirements:**
- CPU: 1 core
- RAM: 512 MB
- Disk: 1 GB free space
- OS: Linux (Ubuntu 20.04+), Windows Server 2016+, or macOS 10.15+

**Recommended Requirements:**
- CPU: 2 cores
- RAM: 1 GB
- Disk: 5 GB free space (for logs and data)
- OS: Linux (Ubuntu 22.04 LTS)

### Production Deployment Steps

#### 1. Prepare Server

```bash
# Update system packages (Linux)
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 2. Create Application User

```bash
# Create dedicated user (Linux)
sudo useradd -m -s /bin/bash birthdayapp
sudo su - birthdayapp
```

#### 3. Deploy Application

```bash
# Clone or copy application files
cd /home/birthdayapp
git clone <repository-url> birthday-notification-system
cd birthday-notification-system

# Install production dependencies only
npm install --production

# Create required directories
mkdir -p data logs
```

#### 4. Configure Application

```bash
# Create production .env file
cp .env.example .env
nano .env

# Set production values:
# - Use production SMS API credentials
# - Set production mobile number
# - Configure appropriate scheduled time
# - Set log level to INFO or WARN
```

#### 5. Set File Permissions

```bash
# Secure .env file
chmod 600 .env

# Set directory permissions
chmod 755 data logs
chmod 644 data/associates.xlsx

# Ensure log directory is writable
chmod 755 logs
```

#### 6. Test Configuration

```bash
# Run a test execution
node src/index.js

# Verify logs
tail -f logs/birthday-system-*.log

# Stop with Ctrl+C after verification
```

#### 7. Set Up Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start src/index.js --name birthday-system

# Configure auto-restart on system reboot
pm2 startup
# Follow the instructions provided by the command

# Save PM2 configuration
pm2 save

# Verify status
pm2 status
pm2 logs birthday-system
```

#### 8. Configure Firewall (if needed)

```bash
# Allow outbound HTTPS for SMS API
sudo ufw allow out 443/tcp

# Verify firewall status
sudo ufw status
```

### Production Configuration Best Practices

1. **Environment Variables:**
   - Use strong, unique API keys
   - Never use development credentials in production
   - Rotate credentials regularly

2. **Scheduling:**
   - Choose off-peak hours for execution
   - Consider timezone of recipients
   - Avoid scheduling during maintenance windows

3. **Logging:**
   - Set `LOG_LEVEL=INFO` for production
   - Implement log rotation
   - Monitor log file sizes
   - Set up log aggregation (optional)

4. **Monitoring:**
   - Monitor application uptime
   - Track SMS delivery success rate
   - Alert on consecutive failures
   - Monitor disk space for logs

## Cloud Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance:**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (free tier eligible)
   - Security Group: Allow outbound HTTPS (443)

2. **Connect to Instance:**

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Follow Production Deployment Steps** (see above)

4. **Configure Auto-Start:**

```bash
# PM2 will handle auto-restart
pm2 startup systemd
pm2 save
```

### Azure VM Deployment

1. **Create Virtual Machine:**
   - Image: Ubuntu Server 22.04 LTS
   - Size: B1s (1 vCPU, 1 GB RAM)
   - Networking: Allow outbound HTTPS

2. **Connect and Deploy:**

```bash
ssh azureuser@your-vm-ip
# Follow Production Deployment Steps
```

### Google Cloud Platform (GCP)

1. **Create Compute Engine Instance:**
   - Machine type: e2-micro
   - Boot disk: Ubuntu 22.04 LTS
   - Firewall: Allow HTTPS egress

2. **Deploy Application:**

```bash
gcloud compute ssh your-instance-name
# Follow Production Deployment Steps
```

### Heroku Deployment

1. **Create Heroku App:**

```bash
heroku create birthday-notification-system
```

2. **Configure Environment Variables:**

```bash
heroku config:set EXCEL_FILE_PATH=./data/associates.xlsx
heroku config:set RECIPIENT_MOBILE_NUMBER=+1234567890
heroku config:set SMS_API_URL=https://api.smsprovider.com/send
heroku config:set SMS_API_KEY=your_api_key
heroku config:set SMS_SENDER_ID=BirthdayBot
heroku config:set SCHEDULED_TIME=09:00
```

3. **Create Procfile:**

```bash
echo "worker: node src/index.js" > Procfile
```

4. **Deploy:**

```bash
git push heroku main
heroku ps:scale worker=1
```

5. **Upload Excel File:**

```bash
# Use Heroku CLI or add to repository (not recommended for sensitive data)
# Consider using cloud storage (S3, Google Cloud Storage) instead
```

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directories
RUN mkdir -p data logs

# Set permissions
RUN chmod 755 data logs

# Run as non-root user
USER node

# Start application
CMD ["node", "src/index.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  birthday-system:
    build: .
    container_name: birthday-notification-system
    restart: unless-stopped
    environment:
      - EXCEL_FILE_PATH=/app/data/associates.xlsx
      - RECIPIENT_MOBILE_NUMBER=${RECIPIENT_MOBILE_NUMBER}
      - SMS_API_URL=${SMS_API_URL}
      - SMS_API_KEY=${SMS_API_KEY}
      - SMS_SENDER_ID=${SMS_SENDER_ID}
      - SCHEDULED_TIME=${SCHEDULED_TIME}
      - LOG_LEVEL=INFO
      - LOG_FILE_PATH=/app/logs/birthday-system.log
    volumes:
      - ./data:/app/data:ro
      - ./logs:/app/logs
    networks:
      - birthday-network

networks:
  birthday-network:
    driver: bridge
```

### Deploy with Docker

```bash
# Build image
docker build -t birthday-notification-system .

# Run container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Docker Best Practices

- Use multi-stage builds for smaller images
- Mount Excel file as read-only volume
- Persist logs to host filesystem
- Use Docker secrets for sensitive data
- Implement health checks
- Set resource limits

## Monitoring and Maintenance

### Health Checks

Create a health check script:

```bash
#!/bin/bash
# health-check.sh

LOG_FILE="./logs/birthday-system-$(date +%Y-%m-%d).log"

# Check if process is running
if pm2 list | grep -q "birthday-system.*online"; then
    echo "✓ Application is running"
else
    echo "✗ Application is not running"
    exit 1
fi

# Check if log file exists and is recent
if [ -f "$LOG_FILE" ]; then
    echo "✓ Log file exists"
else
    echo "✗ Log file not found"
    exit 1
fi

# Check for recent errors
ERROR_COUNT=$(grep -c "ERROR" "$LOG_FILE" 2>/dev/null || echo 0)
if [ "$ERROR_COUNT" -gt 10 ]; then
    echo "⚠ High error count: $ERROR_COUNT"
    exit 1
fi

echo "✓ Health check passed"
exit 0
```

### Monitoring Checklist

- [ ] Application uptime monitoring
- [ ] Log file monitoring for errors
- [ ] Disk space monitoring
- [ ] SMS delivery success rate tracking
- [ ] Excel file accessibility checks
- [ ] Network connectivity to SMS gateway

### Maintenance Tasks

#### Daily
- Review logs for errors
- Verify SMS delivery

#### Weekly
- Check disk space usage
- Review log file sizes
- Verify Excel file is up-to-date

#### Monthly
- Rotate API credentials (if required)
- Review and archive old logs
- Update dependencies: `npm update`
- Review SMS gateway usage and costs

#### Quarterly
- Update Node.js to latest LTS version
- Review and update Excel file format
- Test disaster recovery procedures
- Review security configurations

### Backup Strategy

1. **Excel File Backup:**

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backup/birthday-system"
DATE=$(date +%Y-%m-%d)

mkdir -p "$BACKUP_DIR"
cp ./data/associates.xlsx "$BACKUP_DIR/associates-$DATE.xlsx"

# Keep last 30 days
find "$BACKUP_DIR" -name "associates-*.xlsx" -mtime +30 -delete
```

2. **Configuration Backup:**

```bash
# Backup .env file (encrypted)
tar -czf config-backup.tar.gz .env
gpg -c config-backup.tar.gz
rm config-backup.tar.gz
```

3. **Log Backup:**

```bash
# Archive old logs
tar -czf logs-archive-$(date +%Y-%m).tar.gz logs/*.log
mv logs-archive-*.tar.gz /backup/logs/
```

### Disaster Recovery

1. **Application Failure:**
   - PM2 will auto-restart
   - Check logs for root cause
   - Verify configuration
   - Test SMS gateway connectivity

2. **Data Loss:**
   - Restore Excel file from backup
   - Verify file format and permissions
   - Restart application

3. **Server Failure:**
   - Deploy to new server
   - Restore configuration from backup
   - Restore Excel file from backup
   - Update DNS/IP if needed

### Scaling Considerations

For organizations with multiple locations or large datasets:

1. **Multiple Instances:**
   - Deploy separate instances per region
   - Use different Excel files per location
   - Configure different scheduled times

2. **Load Distribution:**
   - Split large Excel files into smaller chunks
   - Stagger execution times
   - Use SMS gateway rate limiting

3. **High Availability:**
   - Deploy redundant instances
   - Use load balancer for API calls
   - Implement failover mechanisms

## Troubleshooting Deployment Issues

### Issue: Application won't start after deployment

**Solution:**
```bash
# Check Node.js version
node --version

# Verify dependencies installed
npm list

# Check file permissions
ls -la .env data/associates.xlsx

# Review logs
cat logs/birthday-system-*.log
```

### Issue: SMS not sending in production

**Solution:**
```bash
# Test SMS gateway connectivity
curl -v $SMS_API_URL

# Verify environment variables loaded
node -e "require('dotenv').config(); console.log(process.env.SMS_API_KEY)"

# Check firewall rules
sudo ufw status
```

### Issue: High memory usage

**Solution:**
```bash
# Monitor memory usage
pm2 monit

# Increase Node.js memory limit
pm2 delete birthday-system
pm2 start src/index.js --name birthday-system --node-args="--max-old-space-size=1024"
```

## Security Hardening

### Production Security Checklist

- [ ] Use non-root user for application
- [ ] Restrict .env file permissions (600)
- [ ] Enable firewall with minimal rules
- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting for SMS API
- [ ] Regular security updates
- [ ] Encrypt sensitive data at rest
- [ ] Use secrets management (AWS Secrets Manager, Azure Key Vault)
- [ ] Enable audit logging
- [ ] Implement intrusion detection

### Security Best Practices

1. **Credential Management:**
   - Use environment-specific credentials
   - Rotate credentials regularly
   - Never commit credentials to version control
   - Use secrets management services

2. **Network Security:**
   - Restrict outbound connections
   - Use VPN for sensitive deployments
   - Implement IP whitelisting
   - Monitor network traffic

3. **Access Control:**
   - Limit SSH access
   - Use key-based authentication
   - Implement principle of least privilege
   - Regular access audits

## Support and Resources

For deployment assistance:
- Review application logs
- Check system requirements
- Verify network connectivity
- Test with minimal configuration
- Contact development team

---

**Document Version:** 1.0  
**Last Updated:** October 2025

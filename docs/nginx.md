# nginx Reverse Proxy Configuration

This document provides nginx configuration examples for deploying the v1rtopia website with a reverse proxy setup.

## Basic Configuration

Here's a basic nginx configuration to proxy traffic to the Next.js application:

```nginx
upstream nextjs_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Root directory (for static files if needed)
    root /var/www/v1rtopia-website;

    # Proxy settings for Next.js
    location / {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static asset caching
    location /_next/static/ {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Cache static assets for 1 year
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Public folder assets
    location /public/ {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Cache public assets for 1 month
        expires 30d;
        add_header Cache-Control "public";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Logging
    access_log /var/log/nginx/v1rtopia-access.log;
    error_log /var/log/nginx/v1rtopia-error.log warn;
}
```

## WebSocket Support

If your application uses WebSocket connections (for real-time features), the configuration above already includes WebSocket support through these headers:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_cache_bypass $http_upgrade;
```

## Custom Port Configuration

If you've configured your Next.js app to run on a different port (using the `PORT` environment variable), update the upstream configuration:

```nginx
upstream nextjs_app {
    # Change the port to match your PORT environment variable
    server 127.0.0.1:3001;
    keepalive 64;
}
```

## Load Balancing (Multiple Instances)

For high-traffic scenarios, you can run multiple Next.js instances and configure load balancing:

```nginx
upstream nextjs_app {
    least_conn;
    server 127.0.0.1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 64;
}
```

## SSL/TLS with Let's Encrypt

For free SSL certificates using Let's Encrypt with certbot:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain and install certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

The certbot will automatically update your nginx configuration with SSL settings.

## Rate Limiting

To protect your application from abuse, you can add rate limiting:

```nginx
# Add this before the server block
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

server {
    # ... other configuration ...

    location / {
        limit_req zone=general burst=20 nodelay;
        # ... other proxy settings ...
    }

    # Stricter rate limiting for API endpoints
    location /api/ {
        limit_req zone=api burst=5 nodelay;
        # ... other proxy settings ...
    }
}
```

## Testing Configuration

Before applying changes, always test your nginx configuration:

```bash
# Test configuration syntax
sudo nginx -t

# Reload nginx if test passes
sudo systemctl reload nginx

# Or restart if needed
sudo systemctl restart nginx
```

## Monitoring

Check nginx status and logs:

```bash
# Check nginx status
sudo systemctl status nginx

# Follow access logs
sudo tail -f /var/log/nginx/v1rtopia-access.log

# Follow error logs
sudo tail -f /var/log/nginx/v1rtopia-error.log
```

## Additional Resources

- [nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Let's Encrypt](https://letsencrypt.org/)

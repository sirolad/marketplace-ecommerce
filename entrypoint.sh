#!/bin/sh

# Substitute environment variables in the template
envsubst '${ORDER_SERVICE_PORT},${INVOICE_SERVICE_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start Nginx
nginx -g 'daemon off;'
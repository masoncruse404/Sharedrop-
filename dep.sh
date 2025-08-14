#!/bin/bash
set -e

# --------------------------------------------------
# Update system
# --------------------------------------------------
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# --------------------------------------------------
# Install Docker
# --------------------------------------------------
echo "Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add current user to docker group
sudo usermod -aG docker $USER
echo "Docker installed. You may need to log out and back in for group changes to take effect."

# --------------------------------------------------
# Install Nginx
# --------------------------------------------------
echo "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# --------------------------------------------------
# Install Certbot (Let's Encrypt)
# --------------------------------------------------
echo "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# --------------------------------------------------
# Finish
# --------------------------------------------------
echo "--------------------------------------------------"
echo "Installation complete!"
echo "Nginx is running on port 80."
echo "Docker and Docker Compose are installed."
echo
echo "To issue a Let's Encrypt certificate, run:"
echo "    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "Certificates will auto-renew with certbot.timer."


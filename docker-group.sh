# Create the docker group (in case it doesn't exist)
sudo groupadd docker

# Add your current user to the docker group
sudo usermod -aG docker $USER

# Apply group changes without reboot (optional, but logging out/in is safer)
newgrp docker

FROM node:20-alpine

WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier tout le reste du code backend
COPY . .

# Exposer le port (Back4App utilise souvent la variable PORT, par défaut 5000)
ENV PORT=5000
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]

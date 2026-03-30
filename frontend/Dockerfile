FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy full project (includes index.html and src)
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]

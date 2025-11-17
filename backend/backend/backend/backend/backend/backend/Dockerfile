FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 4000
CMD ["node", "index.js"]

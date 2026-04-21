# GITHUB: Day 1 - Commit 2 - "chore: add Docker configuration"

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

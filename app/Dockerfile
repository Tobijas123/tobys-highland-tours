FROM node:20-alpine

WORKDIR /app

# deps
COPY package.json package-lock.json ./
RUN npm ci

# app code
COPY . .

# build
RUN npm run build

EXPOSE 3000
CMD ["npm","run","start"]

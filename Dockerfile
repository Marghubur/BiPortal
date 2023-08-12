#   BUILD STAGE 1

FROM node:18.15.0 as node
WORKDIR /app

COPY package.json .
RUN npm config set legacy-peer-deps true
RUN npm install

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=8192

RUN npm run build -- --configuration production

# STAGE 2
FROM nginx:alpine
COPY --from=node /app/dist/odbui /usr/share/nginx/html

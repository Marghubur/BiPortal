#   BUILD STAGE 1

FROM node:18.15.0 as node
WORKDIR /app

COPY package.json .
RUN npm install --force

COPY . .

RUN npm run build -- --configuration production

# STAGE 2
FROM nginx:alpine
COPY --from=node /app/dist/odbui /usr/share/nginx/html

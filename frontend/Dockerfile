FROM node:19.2 AS build

ARG REACT_APP_API_HOST
ARG REACT_APP_API_PORT
ARG REACT_APP_PORT
ARG REACT_APP_NGINX_PORT

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . ./
RUN find . -type f -name '*.test.tsx' -delete \
    && find . -type f -name '*.test.ts' -delete \
    && find . -type f -name '*.test.jsx' -delete \
    && find . -type f -name '*.test.js' -delete
RUN REACT_APP_API_HOST=${REACT_APP_API_HOST} \
    REACT_APP_API_PORT=${REACT_APP_API_PORT} \
    REACT_APP_PORT=${REACT_APP_PORT} \
    REACT_APP_NGINX_PORT=${REACT_APP_NGINX_PORT} \
    npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
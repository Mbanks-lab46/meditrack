FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
RUN npm ci -w apps/web
COPY apps/web apps/web
ARG API_URL=/api
RUN sed -i "s|__API_URL__|${API_URL}|g" apps/web/src/environments/environment.ts
RUN npm run build -w apps/web

FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist/web/browser /usr/share/nginx/html
EXPOSE 80
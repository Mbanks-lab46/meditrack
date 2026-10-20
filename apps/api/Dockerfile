FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
RUN npm ci -w apps/api
COPY apps/api apps/api
RUN npm run build -w apps/api

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
RUN npm ci -w apps/api --omit=dev && npm cache clean --force
COPY --from=build /repo/apps/api/dist apps/api/dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
    CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "apps/api/dist/main.js"]
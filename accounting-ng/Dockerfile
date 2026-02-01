# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Angular for production
RUN npm run build

# -----------------------------
# Runtime stage (nginx)
# -----------------------------
FROM nginx:alpine AS runtime

# Copy built app to nginx html folder
# (Angular build output is typically under dist/<project-name>/browser for the new builder)
COPY --from=build /app/dist/accounting-ng/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Expose HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

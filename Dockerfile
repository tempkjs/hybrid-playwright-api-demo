FROM mcr.microsoft.com/playwright:v1.48.0-jammy
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx playwright install --with-deps
CMD ["npx", "playwright", "test", "--reporter=html"]
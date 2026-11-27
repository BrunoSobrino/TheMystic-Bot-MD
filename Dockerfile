FROM node:22-bookworm

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

COPY package.json .

# qrcode-terminal ya está en package.json: basta un solo npm install.
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "index.js", "--server"]

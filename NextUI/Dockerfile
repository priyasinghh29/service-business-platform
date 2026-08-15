FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN if [ -f .env.example ] && [ ! -f .env.local ]; then cp .env.example .env.local; fi

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

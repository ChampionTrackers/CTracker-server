FROM node:20-bullseye-slim
ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev
RUN npm i -g prisma

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start:migrate"]

FROM node:16

WORKDIR /usr

COPY package.json yarn.lock ./
COPY prisma ./prisma
COPY .env ./
COPY tsconfig.json ./

RUN npm install typescript -g
RUN yarn install
COPY . .
RUN npx prisma generate
RUN tsc -p .

CMD ["yarn", "start"]
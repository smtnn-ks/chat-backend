FROM node:20.10.0-slim
WORKDIR /usr/src/app
EXPOSE 5000
EXPOSE 5001
COPY package*.json ./
COPY prisma ./prisma
RUN apt-get update -y && apt-get install -y openssl
RUN npm install
COPY . . 
RUN npm run build
CMD ["npm", "run", "start:migrate:prod"]

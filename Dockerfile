FROM node:14
WORKDIR /usr/src/app
EXPOSE 1234
COPY package*.json ./
COPY superheros.json ./
COPY . .

RUN npm ci --only=production
CMD [ "npm", "start" ]
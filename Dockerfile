FROM node:12-alpine
COPY . .
RUN npm install
CMD ["node", "index.js"]
EXPOSE 22


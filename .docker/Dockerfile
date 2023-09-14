FROM node:18.17.1

USER node

WORKDIR /code
COPY --chown=node:node package*.json /code

RUN npm install

COPY . .

# available MODE webook,queue
ENV MODE=webhook
ENV NODE_ENV=production
ENV PORT=8000

RUN chmod +x bin/run.sh
CMD ["bin/run.sh"]

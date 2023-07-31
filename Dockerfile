FROM node:18-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN npm i npm@latest -g

RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app
USER node
COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci && npm cache clean --force
ENV PATH /opt/node_app/node_modules/.bin:$PATH

COPY --chown=node:node . .
RUN npm run build

CMD ["npm", "start:prod"]
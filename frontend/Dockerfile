FROM node:13.3.0 AS compile-image

WORKDIR /opt/ng
COPY package.json yarn.lock ./
RUN yarn install

ENV PATH="./node_modules/.bin:$PATH" 

COPY . ./
RUN ng build --prod

FROM nginx
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=compile-image /opt/ng/dist/app-name /usr/share/nginx/html
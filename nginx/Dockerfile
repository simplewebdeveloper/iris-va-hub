FROM nginx:1.17.8-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY iris-vahub-backend.gy.conf /etc/nginx/conf.d
COPY iris-vahub-dev.gy.conf /etc/nginx/conf.d

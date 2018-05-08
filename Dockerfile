FROM kyma/docker-nginx
COPY dist/ /var/www
RUN echo "Syncpipes client is up and running! Try localhost:3011"
CMD 'nginx'

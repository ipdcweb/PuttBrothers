FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067

ENTRYPOINT ["/bin/bash", "-l", "-c"]
WORKDIR /app/


COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends curl wget

ARG CI COOLIFY_BRANCH COOLIFY_CONTAINER_NAME COOLIFY_FQDN COOLIFY_RESOURCE_UUID COOLIFY_URL NIXPACKS_METADATA NIXPACKS_NODE_VERSION NODE_ENV NPM_CONFIG_PRODUCTION SOURCE_COMMIT
ENV CI=$CI COOLIFY_BRANCH=$COOLIFY_BRANCH COOLIFY_CONTAINER_NAME=$COOLIFY_CONTAINER_NAME COOLIFY_FQDN=$COOLIFY_FQDN COOLIFY_RESOURCE_UUID=$COOLIFY_RESOURCE_UUID COOLIFY_URL=$COOLIFY_URL NIXPACKS_METADATA=$NIXPACKS_METADATA NIXPACKS_NODE_VERSION=$NIXPACKS_NODE_VERSION NODE_ENV=$NODE_ENV NPM_CONFIG_PRODUCTION=$NPM_CONFIG_PRODUCTION SOURCE_COMMIT=$SOURCE_COMMIT

# setup phase
# noop

# install phase
ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH
COPY . /app/.
RUN  npm install --legacy-peer-deps

# build phase
COPY . /app/.
RUN  npm run build


RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile


# start
COPY . /app

CMD ["npm run start"]


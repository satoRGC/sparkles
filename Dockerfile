FROM oven/bun:1.4 AS base
RUN mkdir -p /usr/src/app && chown bun:bun /usr/src/app
#USER bun
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /tmp/prod /tmp/dev
# copy package.json, lockfile
COPY package.json bun.lock /usr/src/app/
COPY concept3 /usr/src/app/concept3
# We will manually run postinstalls later
RUN cd /usr/src/app && bun i
RUN chown -R bun:bun /usr/src/app/node_modules
RUN mv /usr/src/app/node_modules dev_node_modules
RUN bun i --production
RUN chown -R bun:bun /usr/src/app/node_modules

FROM base AS build
COPY . .
COPY --from=install /usr/src/app/dev_node_modules node_modules
RUN unlink node_modules/concept3 && rm -r concept3
COPY concept3 node_modules/concept3
RUN chown bun:bun /usr/src/app
USER bun
COPY .env.example .env
RUN f="$(ls node_modules/concept3/ )" && echo $f && sleep 10
RUN NODE_ENV=production bun --bun run build

FROM base AS release
COPY package.json .
COPY --from=install /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/build build

EXPOSE 3000/tcp
CMD ["bun", "run", "./build"]
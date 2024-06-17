# Use a imagem oficial do Node.js como base
FROM node:22-alpine AS build

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Compile o projeto TypeScript
RUN npm run build

# Use uma nova etapa para criar uma imagem final mais enxuta
FROM node:22-alpine

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie as dependências instaladas e o código compilado da etapa anterior
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY wait-for-it.sh /usr/src/app/wait-for-it.sh

# Dê permissão de execução ao script wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

# Exponha a porta que a aplicação irá usar
EXPOSE 3333

# Comando para rodar a aplicação
# CMD ["sh", "-c", "./wait-for-it.sh db 5432 -- npm run start"]
CMD ["npm", "run", "start"]

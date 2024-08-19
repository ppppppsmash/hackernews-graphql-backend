const { ApolloServer, gql } = require("apollo-server");
const fs = require("fs");
const path = require("path");

const { PrismaClient } = require("@prisma/client");
const { getUserId } = require("./utils");

const prisma = new PrismaClient();

// リゾルバ関数、typeDefsの型に対して、何かの値を与える
const resolvers = {
  Query: {
    info: () =>  "HackerNewsクローン",
    feed: async (parent, args, context) => {
      return context.prisma.link.findMany();
    }
  },

  Mutation: {
    post: (parent, args, context) => {
      const newLink = context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        }
      });

      return newLink;
    }
  }
};

// リゾルバに連携する
const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      userId: req && req.headers.authorization ? getUserId(req) : null,
    }
  }
});

server
  .listen()
  .then(({ url }) => console.log(`${url}でサーバーを起動中・・・`));
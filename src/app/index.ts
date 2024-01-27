import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import express from 'express';
import cors from 'cors'
import bodyParser from "body-parser";
import {User} from "./user";
import jwtService from "../services/jwt";
import {Tweet} from "./tweet";

export async function initServer() {
    const app = express();
    app.use(bodyParser.json())
    app.use(cors())
    const graphqlServer = new ApolloServer({
        typeDefs: `
        ${User.types}
        ${Tweet.types}
        type Query {
            ${User.queries}
            ${Tweet.queries}
        }
        type Mutation {
            ${Tweet.mutations},
            ${User.mutations}
        }
        `,
        resolvers: {
            Query: {
                ...User.resolver.queries,
                ...Tweet.resolvers.queries,
            },
            Mutation: {
                ...Tweet.resolvers.mutations,
                ...User.resolver.mutations,
            },
            ...Tweet.resolvers.extraResolvers,
            ...User.resolver.extraResolvers
        }
    });
    await graphqlServer.start();

    app.use('/graphql', expressMiddleware(graphqlServer, {
        context: async ({req, res}) => {
            // @ts-ignore
            return {user: req.headers.authorization ? jwtService.decodeToken(req.headers.authorization.split('Bearer ')[1]) : undefined,};
        },
    }));
    return app;
}

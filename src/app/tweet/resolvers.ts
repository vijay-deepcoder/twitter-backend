import {GraphqlContext} from "../../interfaces";
import {Tweet} from "@prisma/client";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService, {CreateTweetPayload} from "../../services/tweet";

const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
})

const queries = {
    getAllTweets: () => TweetService.getAllTweet(),
    getSignedUrlForTweet: async (parent: any, {imageType, imageName}: {
        imageType: string,
        imageName: string
    }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("you are not logged in! Please login first");
        const allowedImageTypes = ['jpg', 'png', 'jpeg', 'webp'];
        if (!allowedImageTypes.includes(imageType)) throw new Error("Image type not allowed");

        const putObjectCommand = new PutObjectCommand(
            {
                Bucket: process.env.AWS_BUCKET,
                Key: `uploads/${ctx.user.id}/tweet/${imageName}-${Date.now().toString()}.${imageType}`,
            })

        const signedUrl = await getSignedUrl(s3Client, putObjectCommand)

        return signedUrl;
    }
};

const mutations = {
    createTweet: async (parent: any, {payload}: { payload: CreateTweetPayload }, ctx: GraphqlContext) => {
        if (!ctx.user) {
            throw new Error('You are not logged in! Please login first')
        }
        const tweet = TweetService.createTweet({...payload, userId: (ctx.user.id).toString()})
        return tweet
    }
}

const extraResolvers = {
    Tweet: {
        author: (parent: Tweet) => UserService.getUserById(parent.authorId)
    }
}

export const resolvers = {mutations, extraResolvers, queries};

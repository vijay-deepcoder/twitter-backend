import {prismaClient} from "../clients/db";
import redisClient from "../clients/redis";

export interface CreateTweetPayload {
    content: string
    imageUrl?: string
    userId: string
}

class TweetService {
    public static async getAllTweet() {
        // const tokenas = JWT.sign({id: 1, email: 'vijaykerai098@gmail.com'}, 'mytokenisthis')
        // console.log(tokenas)
        const cachedTweets = await redisClient.get("ALL_TWEETS");
        if (cachedTweets) return JSON.parse(cachedTweets);
        const tweets = await prismaClient.tweet.findMany({
            orderBy: {createdAt: "desc"},
        });
        await redisClient.set("ALL_TWEETS", JSON.stringify(tweets));
        return tweets;
    }

    public static async createTweet(data: CreateTweetPayload) {
        const rateLimitFlag = await redisClient.get(
            `RATE_LIMIT:TWEET:${data.userId}`
        );
        if (rateLimitFlag) throw new Error("Please wait....");
        const tweet = await prismaClient.tweet.create({
            data: {
                content: data.content,
                imageUrl: data.imageUrl,
                author: {connect: {id: data.userId}},
            },
        });
        await redisClient.setex(`RATE_LIMIT:TWEET:${data.userId}`, 10, 1);
        await redisClient.del("ALL_TWEETS");
        return tweet;
    }
}

export default TweetService;

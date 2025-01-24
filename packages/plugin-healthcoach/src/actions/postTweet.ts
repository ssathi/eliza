import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    HandlerCallback,
    State,
} from "@elizaos/core";
import { elizaLogger, truncateToCompleteSentence } from "@elizaos/core";
import { validateTwitterConfig, TwitterConfig, DEFAULT_MAX_TWEET_LENGTH } from "../base/environment";
import { ClientBase } from "../base/base";

export const postTweet: Action = {
    name: "POST_TWEET",
    similes: [],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Seach twitter for given topics and return a list of tweets and ids",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state?: State,
        _options?: { [key: string]: unknown },
        _callback?: HandlerCallback,
    ): Promise<void> => {

         const tweetContent = _message.content.text;

         elizaLogger.info("tweetContent", tweetContent);

         const twitterConfig: TwitterConfig = await validateTwitterConfig(_runtime);

         const client = new ClientBase(_runtime, twitterConfig);
         client.init();

        // TODO: we wait 5 seconds here to avoid getting rate limited on startup, but we should queue
        await new Promise((resolve) => setTimeout(resolve, 5000));

        doPost( client, tweetContent);

    },
    examples: [] as ActionExample[][],
} as Action;


async function doPost(
    client: ClientBase,
    cleanedContent: string
) {
    try {
        elizaLogger.info(`Posting new tweet:\n`);

        let result;

        if (cleanedContent.length > DEFAULT_MAX_TWEET_LENGTH) {
            result = await handleNoteTweet(client, cleanedContent);
        } else {
            result = await sendStandardTweet(client, cleanedContent);
        }

        elizaLogger.info('tweet created result: ', result);
    } catch (error) {
        elizaLogger.error(`Error sending tweet: ${error.message}`, error);
    }
}

async function handleNoteTweet(
    client: ClientBase,
    content: string,
    tweetId?: string
) {
    try {
        const noteTweetResult = await client.requestQueue.add(
            async () =>
                await client.twitterClient.sendNoteTweet(content, tweetId)
        );

        if (noteTweetResult.errors && noteTweetResult.errors.length > 0) {
            // Note Tweet failed due to authorization. Falling back to standard Tweet.
            const truncateContent = truncateToCompleteSentence(
                content,
                client.twitterConfig.MAX_TWEET_LENGTH
            );
            return await sendStandardTweet(
                client,
                truncateContent,
                tweetId
            );
        } else {
            return noteTweetResult.data.notetweet_create.tweet_results
                .result;
        }
    } catch (error) {
        throw new Error(`Note Tweet failed: ${error}`);
    }
}

async function sendStandardTweet(
    client: ClientBase,
    content: string,
    tweetId?: string
) {
    try {
        const standardTweetResult = await client.requestQueue.add(
            async () =>
                await client.twitterClient.sendTweet(content, tweetId)
        );
        const body = await standardTweetResult.json();
        if (!body?.data?.create_tweet?.tweet_results?.result) {
            console.error("Error sending tweet; Bad response:", body);
            return;
        }
        return body.data.create_tweet.tweet_results.result;
    } catch (error) {
        elizaLogger.error("Error sending standard Tweet:", error);
        throw error;
    }
}
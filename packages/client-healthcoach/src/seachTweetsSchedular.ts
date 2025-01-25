import { elizaLogger, Memory } from "@elizaos/core";
import {
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
} from "@elizaos/core";

export class SearchTweetsSchedular {
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
    }

    async start() {
        this.engageWithSearchTermsLoop();
    }

    private engageWithSearchTermsLoop() {
        this.engageWithSearchTerms().then();

        const randomMinutes = Math.floor(Math.random() * (20 - 10 + 1)) + 10;

        elizaLogger.info(
            `Next twitter search scheduled in ${randomMinutes} minute1`
        );
        setTimeout(
            () => this.engageWithSearchTermsLoop(),
            randomMinutes * 60 * 1000
        );
    }

    private async engageWithSearchTerms() {
        elizaLogger.info("Engaging with search terms");
        try {

            // SEARCH_TWEETS
            let responseTweetList = []
            const searchTweetCallback: HandlerCallback = async (response: Content) => {
                responseTweetList = response.tweetList as Array<unknown>;
                return [];
            };

            const message1: Memory = {
                content: {
                    action: 'SEARCH_TWEETS',
                    text: 'topics'
                },
                userId: null,
                agentId: null,
                roomId: null,
            }

            await this.runtime.processActions(
                message1,
                [message1],
                null,
                searchTweetCallback,
            );

            // CHOOSE_TWEET

            let tweetId = '';
            const chooseTweetCallback: HandlerCallback = async (response: Content) => {
                elizaLogger.info('Choose Tweet Response: ', JSON.stringify(response));
                tweetId = response.tweetId as string;
                return [];
            }

            const message2: Memory = {
                content: {
                    action: 'CHOOSE_TWEET',
                    text: 'topics',
                    tweetList: responseTweetList
                },
                userId: null,
                agentId: null,
                roomId: null,
            }

            await this.runtime.processActions(
                message2,
                [message2],
                null,
                chooseTweetCallback,
            );

            const twoDaysAgoTimestamp = Math.floor(new Date().setDate(new Date().getDate() - 2) / 1000);  // Timestamp for 2 days ago


            const selectedTweet = responseTweetList.filter((tweet) => tweet.id === tweetId && tweet.timestamp >= twoDaysAgoTimestamp)[0];

            // if no tweet, skip it
            if (!selectedTweet) {
                elizaLogger.info('Skipping RESPOND_TO_TWEET');
                return;
            }

            // RESPOND_TO_TWEET

            const nothingCallback: HandlerCallback = async (response: Content) => {return []}

            const message4: Memory = {
                content: {
                    action: 'RESPOND_TO_TWEET',
                    text: 'topics',
                    tweetId: tweetId,
                    selectedTweet: selectedTweet,
                },
                userId: null,
                agentId: null,
                roomId: null,
            }

            await this.runtime.processActions(
                message4,
                [message4],
                null,
                nothingCallback,
            )



        } catch (error) {
            console.error("Error engaging with search terms:", error);
        }
    }
}

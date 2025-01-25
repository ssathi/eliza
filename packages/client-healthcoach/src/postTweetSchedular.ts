import { elizaLogger, Memory } from "@elizaos/core";
import {
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
} from "@elizaos/core";

export class PostTweetsSchedular {
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
    }

    async start() {
        this.engageWithSearchTermsLoop();
    }

    private engageWithSearchTermsLoop() {
        this.engageWithSearchTerms().then();
        const randomMinutes = Math.floor(Math.random() * (120 - 60 + 1)) + 60;
        elizaLogger.info(
            `Next twitter search scheduled in ${randomMinutes} minute`
        );
        setTimeout(
            () => this.engageWithSearchTermsLoop(),
            randomMinutes * 60 * 1000
        );
    }

    private async engageWithSearchTerms() {
        elizaLogger.info("Engaging with search terms");
        try {

            // GENERATE_TWEET
            const message1: Memory = {
                content: {
                    action: 'GENERATE_TWEET',
                    text: 'topics'
                },
                userId: null,
                agentId: null,
                roomId: null,
            }

            let generatedTweet = '';
            const callback: HandlerCallback = async (response: Content) => {
                generatedTweet = response.generatedTweet as string
                return [];
            };

            await this.runtime.processActions(
                message1,
                [message1],
                null,
                callback,
            );

            elizaLogger.info('GENERATE_TWEET Action called')


            // POST_TWEET

            const message2: Memory = {
                content: {
                    action: 'POST_TWEET',
                    text: generatedTweet
                },
                userId: null,
                agentId: null,
                roomId: null,
            }

            await this.runtime.processActions(
                message2,
                [message2],
                null,
                callback,
            );

            elizaLogger.info('POST_TWEET Action called')


        } catch (error) {
            console.error("Error engaging with search terms:", error);
        }
    }
}

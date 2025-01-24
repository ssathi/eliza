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
        elizaLogger.info(
            `Next twitter search scheduled in 2 minute`
        );
        setTimeout(
            () => this.engageWithSearchTermsLoop(),
            2 * 60 * 1000
        );
    }

    private async engageWithSearchTerms() {
        elizaLogger.info("Engaging with search terms");
        try {


            const message: Memory = {
                content: {
                    action: 'GENERATE_TWEET',
                    text: 'topics'
                },
                userId: null,
                agentId: null,
                roomId: null,
            }

            const callback: HandlerCallback = async (response: Content) => {
                const message: Memory = {
                    content: {
                        action: 'POST_TWEET',
                        text: response.generatedTweet as string
                    },
                    userId: null,
                    agentId: null,
                    roomId: null,
                }

                await this.runtime.processActions(
                    message,
                    [message],
                    null,
                    callback,
                );

                elizaLogger.info('POST_TWEET Action called')

                return [];
            };

            await this.runtime.processActions(
                message,
                [message],
                null,
                callback,
            );

            elizaLogger.info('GENERATE_TWEET Action called')




        } catch (error) {
            console.error("Error engaging with search terms:", error);
        }
    }
}

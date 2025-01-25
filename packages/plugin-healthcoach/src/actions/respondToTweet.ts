import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    HandlerCallback,
    State,
    Content,
    UUID,
} from "@elizaos/core";
import { composeContext, elizaLogger, generateMessageResponse, messageCompletionFooter, ModelClass, stringToUuid, truncateToCompleteSentence } from "@elizaos/core";
import { validateTwitterConfig, TwitterConfig, DEFAULT_MAX_TWEET_LENGTH } from "../base/environment";
import { ClientBase } from "../base/base";
import { sendTweet } from "../utils";
import { SelectedTweet } from "../types";



const twitterSearchTemplate =
`
About {{agentName}} (@{{twitterUserName}}):
{{bio}}
{{lore}}
{{topics}}

{{postDirections}}

# Task: Respond to the following post in the style and perspective of {{agentName}} (aka @{{twitterUserName}}). Write a {{adjective}} response for {{agentName}} to say directly in response to the post. don't generalize.
{{tweetContext}}

IMPORTANT: Your response CANNOT be longer than 40 words.
Aim for 1-2 short sentences maximum. Be concise and direct.
Your response should not contain any questions. Brief, concise statements only. No emojis.

` + messageCompletionFooter;;


export const respondToTweet: Action = {
    name: "RESPOND_TO_TWEET",
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

         const selectedTweet = _message.content.selectedTweet as SelectedTweet;

         const twitterConfig: TwitterConfig = await validateTwitterConfig(_runtime);

        const roomId = stringToUuid(
            "twitter_generate_room-" + twitterConfig.TWITTER_USERNAME
        );

        _message.roomId = roomId;

         const client = new ClientBase(_runtime, twitterConfig);
         client.init();

        // TODO: we wait 5 seconds here to avoid getting rate limited on startup, but we should queue
        await new Promise((resolve) => setTimeout(resolve, 5000));

        if (selectedTweet.username as string === twitterConfig.TWITTER_USERNAME) {
            elizaLogger.log("Skipping tweet from bot itself");
            return;
        }

        let state = await _runtime.composeState(_message, {
            twitterClient: client.twitterClient,
            twitterUserName: twitterConfig.TWITTER_USERNAME,
            timeline: '',
            tweetContext: `

Original Post:
By @${selectedTweet.username}
${`Original post text: ${selectedTweet.text}`}
`,
        });

        const context = composeContext({
            state,
            template:
                _runtime.character.templates?.twitterSearchTemplate ||
                twitterSearchTemplate,
        });

        const responseContent = await generateMessageResponse({
            runtime: _runtime,
            context,
            modelClass: ModelClass.LARGE,
        });


        responseContent.inReplyTo = _message.content.tweetId as UUID;


        const response = responseContent;

        if (!response.text) {
            elizaLogger.warn("Returning: No response text found");
            return;
        }

        elizaLogger.info(
            `Bot would respond to tweet ${selectedTweet.id} with: ${response.text}`
        );

        await sendTweet(
            client,
            response,
            selectedTweet.roomId,
            twitterConfig.TWITTER_USERNAME,
            selectedTweet.id
        )

        elizaLogger.info(
            `replied !!!`
        );

    },
    examples: [] as ActionExample[][],
} as Action;

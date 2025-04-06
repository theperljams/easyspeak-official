interface PromptGenerator {
    generate(
        content: string,
        user_id: string,
        similarContextCurrent: string[],
        similarContextLegacy: string[],
        styleContextCurrent: string[],
        styleContextLegacy: string[]
    ): string;
}

export class DefaultPrompt implements PromptGenerator {
    generate(
        content: string,
        user_id: string,
        similarContextCurrent: string[],
        similarContextLegacy: string[],
        styleContextCurrent: string[],
        styleContextLegacy: string[]
    ): string {
        return `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
        sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
        based on the context provided. You are given two samples of ${user_id}'s text conversations. The first one contains previous conversations that are the most similar to 
        the current conversation. Use these for information to make an educated guess about how ${user_id} would respond. The second one is various sample texts showing how ${user_id} texts in general and will likely contain some similar 
        conversations ${user_id} has had in the past (they will not necessarily though). Use the first sample primarily for information and the second mostly for style. 
        Contine the conversation as if you 
        were responding to another text from ${user_id}'s phone.
        
        Here is the text you are responding to: ${content}
    
        Here are the samples: 
        Current conversation: ${similarContextCurrent} 
        ${similarContextLegacy}
        
        Past conversations: ${styleContextCurrent}
        ${styleContextLegacy}
    
        Craft a numbered list of 3 different responses in different contexts. Imitate ${user_id}'s style as shown in their sample texts. From these samples: infer ${user_id}'s 
        tone, style, values and beliefs, background and experience, personal preferences, writing habits, and emotional underpinning. Assume the audience is a good friend and 
        the purpose is just casual conversation. If one or both of the first two samples are left blank, do your best by relying on previous similar conversations from the second sample.
        DO NOT share any information not contained in the samples. If there is a text you don't know how to 
        respond to based on the samples, give 3 different "I don't know" responses that sound like something ${user_id} would say. You should ONLY rely on information that you know ${user_id} knows.`;
    }
}

export class ConcisePrompt implements PromptGenerator {
    generate(
        content: string,
        user_id: string,
        similarContextCurrent: string[],
        similarContextLegacy: string[],
        styleContextCurrent: string[],
        styleContextLegacy: string[]
    ): string {
        return `Act as ${user_id}. Use these conversation samples to match their texting style:
        Similar conversations: ${similarContextCurrent} ${similarContextLegacy}
        General style examples: ${styleContextCurrent} ${styleContextLegacy}
        
        Respond to this text: ${content}
        
        Give 3 numbered responses that sound exactly like ${user_id} would write.`;
    }
}

// Export an object containing all available prompts
export const prompts = {
    default: new DefaultPrompt(),
    concise: new ConcisePrompt()
};

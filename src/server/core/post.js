import { context, reddit } from '@devvit/web/server';
export const createPost = async () => {
    const { subredditName } = context;
    if (!subredditName) {
        throw new Error('subredditName is required');
    }
    return await reddit.submitCustomPost({
        splash: {
            // Splash screen customization
            appDisplayName: 'road-knowledge',
            backgroundUri: 'default-splash.png',
            buttonLabel: 'Try it now',
            description: 'Prove it here by clicking the button below',
            entry: 'index.html',
            heading: 'Do you think your traffic knowledge is good?',
            appIconUri: 'default-icon.png',
        },
        postData: {
            gameState: 'initial',
            score: 0,
        },
        subredditName: subredditName,
        title: 'road-knowledge',
    });
};

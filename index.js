require("env2")(".env");
const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    Partials,
} = require('discord.js')
const {
    Configuration,
    OpenAIApi
} = require("openai");
const isKonfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(isKonfig);
const commands = [{
        name: process.env.CMD_ASK,
        description: 'Tanyakan semuanya',
        options: [{
            name: "question",
            description: "How to get girlfriend?",
            type: 3,
            required: true
        }]
    },
    {
        name: process.env.CMD_IMG,
        description: 'Create image with AI',
        options: [{
            name: "prompt",
            description: "Ex : cat with purple rain",
            type: 3,
            required: true
        }]
    }
];


async function daftarCommand() {
    const rest = new REST({
        version: '10'
    }).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
            body: commands
        });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

async function crotMain() {

    await daftarCommand()

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Channel]
    });

    client.on('ready', () => {
        console.log(`
        \\   ^__^
         \\  (oo)\\_______    Discord Bot Chat GPT
            (__)\\       )\\/ author: @MasDahni1337 => github
                ||----w |   discord: https://discord.gg/Jsh9aaaTz4
                ||     ||
        `);
    });

    async function kamuNanya(question) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: question,
            temperature: 0.6,
            max_tokens: parseInt(process.env.TEXT_LENGTH),
        });
        var fixResponse = response['data']['choices'][0]['text'];
        return fixResponse;
    }
    async function resGambar(prompt) {
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "512x512"
        })
        var fixResponse = response['data']['data'][0]['url'];
        return fixResponse;
    }

    async function genAsk(interaction) {
        const question = interaction.options.getString("question")
        try {
            await interaction.reply({
                content: "Sebentar"
            })
            var dataJawaban = await kamuNanya(question);
            await interaction.editReply({
                content: "**Pertanyaan**: " + question + "\n\n**Jawaban**: " + dataJawaban
            })

        } catch (e) {
            var dataJawaban = e['response']['data']['error']['message'];
            await interaction.editReply({
                content: "**Pertanyaan**: " + question + "\n\n**Jawaban**: " + dataJawaban
            })
        }
    }

    async function genImg(interaction) {
        const isPrompt = interaction.options.getString("prompt")
        try {
            await interaction.reply({
                content: "Sebentar"
            })
            var dataJawaban = await resGambar(isPrompt);
            const embed = {
                "image": {
                    "url": dataJawaban
                }
            };
            await interaction.editReply({
                content: "**Perintah**: " + isPrompt + "\n\n**Gambarmu**: ",
                embeds: [embed]
            })

        } catch (e) {
            var dataJawaban = e['response']['data']['error']['message'];
            await interaction.editReply({
                content: "**Pertanyaan**: " + isPrompt + "\n\n**Jawaban**: " + dataJawaban
            })
        }
    }

    client.on("interactionCreate", async interaction => {
        switch (interaction.commandName) {
            case process.env.CMD_ASK:
                genAsk(interaction)
                break;
            case process.env.CMD_IMG:
                genImg(interaction)
                break;
        }
    });

    client.login(process.env.DISCORD_BOT_TOKEN);
}

crotMain()
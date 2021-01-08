import fetch, { RequestInit } from "node-fetch";

interface Config {
    apiKey: string;
    clientId: string;
    clientSecret: string;
}

interface AuthorizeRequest {
    grant_type: string;
    client_id: string;
    client_secret: string;
    scope: string;
}

export default class Toornament {
    private apiKey: string;
    private clientId: string;
    private clientSecret: string;
    private accessToken: string;

    public expiresIn: number;
    public issuedTime: number;

    constructor(config: Config) {
        this.apiKey = config.apiKey || "";
        this.clientId = config.clientId || "";
        this.clientSecret = config.clientSecret || "";

        this.authorize();
    }

    private async authenticate() {
        const url = "https://api.toornament.com/endpoint";

        const options: RequestInit = {
            headers: {
                'X-Api-Key': this.apiKey,
                'Host': 'api.toornament.com'
            },
        }

        const result = await fetch(url, options);

        console.log(result);
    }

    private async authorize() {
        const url = "https://api.toornament.com/oauth/v2/token";
        
        const options: RequestInit = {
            headers: {
                'X-Api-Key': this.apiKey,
                'Host': 'api.toornament.com',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}&scope=organizer:participant organizer:registration`,
            method: 'POST'
        };

        const result = await fetch(url, options);

        console.log(await result.json());
    }
}
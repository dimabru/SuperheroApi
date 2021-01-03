import axios from 'axios';
import express = require('express');
import LRU = require('lru-cache');
import fs = require('fs-extra');
import { Server } from 'http';
const app = express();

type Superhero = {
    response: 'success',
    'results-for': string,
    results: {
        id: string,
        name: string,
        powerstats: {
            intelligence: "81",
            strength: "40",
            speed: "29",
            durability: "55",
            power: "63",
            combat: "90"
        },
    }[]
} | {
    response: 'error',
    error: string
}

export class SuperheroEndpoint {
    private port = 1234;
    private accessToken = '10158964287472463';
    private cache = new LRU<string, Promise<any>>();
    private superheroFilename = 'superheros.json';
    private server: Server | undefined;

    public async initialize() {
        this.server = app.listen(this.port);

        app.get('/superhero/:superhero', this.getSuperheroInfo.bind(this));
        app.get('/searched', this.getSearchedSuperheros.bind(this));
    }

    public close() {
        if (this.server) {
            this.server.close();
        }
    }

    private async getSearchedSuperheros(req: express.Request, res: express.Response) {
        let fileContent = await fs.readJson(this.superheroFilename);
        res.json({ searched: Object.keys(fileContent) }).status(200);
    }

    private async getSuperheroInfo(req: express.Request, res: express.Response) {
        let name = req.params.superhero;
        if (!this.cache.has(name)) {
            this.setCachedValue(name);
        }

        let cached = await this.getCachedValue(name);
        if (!cached) {
            res.status(404);
            return;
        }
        res.json(cached).status(200);
    }

    private async getCachedValue(name: string) {
        let fileContent = await fs.readJson(this.superheroFilename);
        if (fileContent[name]) {
            return fileContent[name];
        }

        try {
            let cachedSuperheroRes = await this.cache.get(name);
            if (cachedSuperheroRes) {
                let superhero = this.trimData(cachedSuperheroRes.data);
    
                fileContent[name] = superhero;
                await fs.writeJson(this.superheroFilename, fileContent);
                return superhero;
            }
        }
        catch (error) {
            console.error(error);
        }

        return undefined;
    }

    private trimData(superheroRes: any): Superhero {
        if (superheroRes.response !== 'success') {
            return superheroRes;
        }

        let returnObject: Superhero;
        returnObject = {
            response: 'success',
            "results-for": superheroRes['results-for'],
            results: superheroRes.results.map((superhero: any) => {
                return {
                    id: superhero.id,
                    name: superhero.name,
                    powerstats: superhero.powerstats
                }
            }) 
        };

        return returnObject;
    }

    private setCachedValue(name: string) {
        this.cache.set(name, axios.get(`https://superheroapi.com/api/${this.accessToken}/search/${name}`));
    }
}
import axios from "axios";
import { expect, should } from "chai";
import { SuperheroEndpoint } from "./superheroEndpoint";

should();

describe('Superhero Endpoint', function() {
    const superheroEndpoint = new SuperheroEndpoint();
    
    before('Initialize endpoint', async function() {
        await superheroEndpoint.initialize();
    });

    after(function() {
        superheroEndpoint.close();
    });

    it ('should get info for superman', async function() {
        let res = await axios.get('http://localhost:1234/superhero/superman');
        let superhero = res.data;
        superhero.response.should.equal('success');
        superhero['results-for'].should.equal('superman');
    }).timeout(10000);

    it ('should get error for bad input', async function() {
        let res = await axios.get('http://localhost:1234/superhero/XzXZX');
        let superhero = res.data;
        superhero.response.should.equal('error');
    }).timeout(10000);

    it ('should display searched superheros', async function() {
        let res = await axios.get('http://localhost:1234/searched');
        let searched: any[] = res.data.searched;

        for (let name of ['superman', 'XzXZX']) {
            searched.should.contain(name);
        }
    })
});
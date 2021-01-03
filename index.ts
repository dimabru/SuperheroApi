import { SuperheroEndpoint } from "./superheroEndpoint";

async function run() {
    const superheroEndpoint = new SuperheroEndpoint();
    await superheroEndpoint.initialize();
}

run().then(() => {
    console.log('Done');
}).catch(error => {

});
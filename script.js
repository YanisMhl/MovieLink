import { API_KEY } from './config.js';
import { options } from './config.js';


let submitButton = document.getElementById("submit");
let actorElement = document.getElementById("first-actor-name");
let actorImage = document.getElementById("first-actor-image");
let userElement = document.getElementById("second-actor-name");
let userImage = document.getElementById("second-actor-image");
let userInput = document.getElementById("user-input");
let result = document.getElementById("result");
let nextBtn = document.getElementById("next");
let scoreElement = document.getElementById("score");
let score = 0;

submitButton.addEventListener("click", guessActor);

async function getActor() {

    let actorData;
    let userActor;
    let userId;
    let films;

    await fetch('./actors_data.json')
    .then(response => response.json())
    .then(data => {
        actorData = data;
    });

    let randomActor = actorData[Math.floor(Math.random() * actorData.length)];
    while (randomActor.popularity < 70)
        randomActor = actorData[Math.floor(Math.random() * actorData.length)];
    actorElement.innerHTML = randomActor.name;

    
    await fetch(`https://api.themoviedb.org/3/person/${randomActor.id}/images`, options)
    .then(response => response.json())
    .then(data => {
        const imageUrl = data.profiles[0].file_path;
        actorImage.src = `https://image.tmdb.org/t/p/original${imageUrl}`;
    });

    console.log(randomActor);
    submitButton.addEventListener("click", async function() {
        userActor = userInput.value.toLowerCase();
        console.log(userActor);
        actorData.forEach(element => {
            if (element.name === userActor)
                userId = element.id;
        });
        if (!userId)
        {
            console.log("Désolé nous n'avons pas trouver cet acteur dans notre base de données.");
            return ;
        }
        films = await sameMovie(randomActor.id, userId);
        if (films.length === 0)
        {
            result.innerHTML = `Désolé ${randomActor.name} et ${userActor} n'ont jamais joué ensemble.`;
            score = 0;
            scoreElement.innerHTML = score;
            userInput.value = "";
            console.log(`Désolé ${randomActor.name} et ${userActor} n'ont jamais joué ensemble.`);
        }
        else
        {
            result.innerHTML = `Tout à fait !\nVoilà la liste des films en commun qu'ont ces acteurs :\n${films}`;
            score++;
            scoreElement.innerHTML = score;
            userInput.value = "";
            console.log(`Tout à fait !\nVoilà la liste des films en commun qu'ont ces acteurs :\n${films}`);
            await fetch(`https://api.themoviedb.org/3/person/${userId}/images`, options)
            .then(response => response.json())
            .then(data => {
                const imageUrl = data.profiles[0].file_path;
                userImage.src = `https://image.tmdb.org/t/p/original${imageUrl}`;
                userElement.innerHTML = userActor;
            });
        
        }
    })

    nextBtn.addEventListener("click", async function() {
        result.innerHTML = "";
        userElement.innerHTML = "?";
        userImage.src = "anonymous.jpg";
        randomActor = actorData[Math.floor(Math.random() * actorData.length)];
        while (randomActor.popularity < 70)
            randomActor = actorData[Math.floor(Math.random() * actorData.length)];
        actorElement.innerHTML = randomActor.name;
        await fetch(`https://api.themoviedb.org/3/person/${randomActor.id}/images`, options)
        .then(response => response.json())
        .then(data => {
            const imageUrl = data.profiles[0].file_path;
            actorImage.src = `https://image.tmdb.org/t/p/original${imageUrl}`;
        });
    });
}

function guessActor(actorid) {
    let userActor = userInput.value;

}

async function getCredits(actorid)
{
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorid}/movie_credits?api_key=${API_KEY}`);
    const data = await response.json();
    console.log(data);
    let credits = [];
    data.cast.forEach(element => {
        credits.push({
            title: element.title,
            id: element.id,
        });
    });
    return credits;
}

async function sameMovie(actor1, actor2)
{
    let len = 0;
    let commonFilms = [];
    let credits1 = await getCredits(actor1);
    let credits2 = await getCredits(actor2);
    // console.log(credits1);
    // console.log(credits2);
    for (let i = 0; i < credits1.length; i++)
    {
        for (let j = 0; j < credits2.length; j++)
        {
            if (credits1[i].title === credits2[j].title)
                commonFilms.push(credits1[i].title);
        }
    }
    return commonFilms;
}

getActor();
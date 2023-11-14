import { API_KEY, options } from "./config.js";

//Variables globales
const ANONYMOUS_IMAGE_URL = "anonymous.jpg";
let popularity_threshold = 90;
let score = 0;


//DOM
let submitButton = document.getElementById("submit");
let actorElement = document.getElementById("first-actor-name");
let actorImage = document.getElementById("first-actor-image");
let userElement = document.getElementById("second-actor-name");
let userImage = document.getElementById("second-actor-image");
let userInput = document.getElementById("user-input");
let result = document.getElementById("result");
let nextBtn = document.getElementById("next");
let scoreElement = document.getElementById("score");


//Functions
async function fetchActorData()
{
    const response = await fetch("./actors_data.json");
    const data = await response.json();
    return data;
}

async function fetchActorImage(actorId)
{
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}/images`, options);
    const data = await response.json();
    const imageUrl = data.profiles[0].file_path;
    return `https://image.tmdb.org/t/p/original${imageUrl}`;
}

async function getCredits(actorId) 
{
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${API_KEY}`);
    const data = await response.json();
    let credits = [];
    data.cast.forEach(element => {
        credits.push({
            title: element.title,
            id: element.id,
        });
    });
    return credits;
}

async function findCommonMovies(actor1, actor2) 
{
    let credits1 = await getCredits(actor1);
    let credits2 = await getCredits(actor2);
    let commonFilms = credits1.filter(credit1 => credits2.some(credit2 => credit2.title === credit1.title));
    return commonFilms.map(credit => credit.title);
}

//Vérifier les films en commun entre les deux acteurs
async function checkCommonMovies(randomActor, userActor)
{

}

//Mettre à jour l'élément de résultat et le score ici
function updateResultAndScore(message, films, scoreElement, score)
{

}

//Afficher les informations de l'acteur dans l'élément spécifié
async function displayActorInfo(actor_element, actor_image, name, id)
{
    actor_element.innerHTML = name;
    actor_image.src = await fetchActorImage(id);
}

//Gérer la soumission de la supposition de l'utilisateur ici
async function handleGuessActor(actor_data, actor)
{
    submitButton.removeEventListener("click", handleGuessActor);
    let userId;
    let userActor = userInput.value.toLowerCase();
    actor_data.forEach(element => {
        if (element.name === userActor)
            userId = element.id;
    });
    if (!userId)
    {
        result.innerHTML = "Désolé nous n'avons pas trouvé cet acteur dans notre base de données";
        score = 0;
        popularity_threshold = 90;
        nextBtn.innerHTML = "Retry";
        nextBtn.addEventListener("click", initializeGame);
    }
    else 
    {
        let films = await findCommonMovies(actor.id, userId);
        if (films.length === 0)
        {
            result.innerHTML = `Désolé ${actor.name} et ${userActor} n'ont jamais joué ensemble`;
            score = 0;
            popularity_threshold = 90;
            nextBtn.innerHTML = "Retry";
            nextBtn.addEventListener("click", initializeGame);
        }
        else 
        {
            result.innerHTML = `Tout à fait !\nVoilà la liste des films en commun qu'ont ces acteurs :\n${films}`;
            score++;
            popularity_threshold -= 2;
            scoreElement.innerHTML = score;
            userInput.value = "";
            await displayActorInfo(userElement, userImage, userActor, userId);
            nextBtn.innerHTML = "next";
            nextBtn.addEventListener("click", initializeGame);
        }
    }
}

//Gérer le clic sur le bouton suivant 
async function handleNextActor()
{

}

async function initializeGame()
{
    scoreElement.innerHTML = score;
    userInput.value = "";
    userImage.src = "anonymous.jpg";
    userElement.innerHTML = "?";
    result.innerHTML = "";
    nextBtn.innerHTML = "Retry";
    let actorData = await fetchActorData();
    let randomActor = actorData[Math.floor(Math.random() * actorData.length)];
    while (randomActor.popularity < popularity_threshold)
        randomActor = actorData[Math.floor(Math.random() * actorData.length)];
    await displayActorInfo(actorElement, actorImage, randomActor.name, randomActor.id);
    submitButton.addEventListener("click", () => handleGuessActor(actorData, randomActor));
}

initializeGame();
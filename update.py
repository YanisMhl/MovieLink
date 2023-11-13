import requests
import json

def save_actors():
    response =  requests.get(f'https://api.themoviedb.org/3/trending/person/week?api_key={API_KEY}')
    data =  response.json()
    nb_pages = data['total_pages']
    actors_data = []

    for i in range(1, nb_pages + 1):
        response =  requests.get(f'https://api.themoviedb.org/3/trending/person/week?api_key={API_KEY}&page={i}')
        data =  response.json()
        results = data.get('results', [])

        for element in results:
            if element.get('known_for_department') == "Acting":
                actors_data.append({
                    'name': element.get('name').lower(),
                    'id': element.get('id'),
                    'gender': element.get('gender'),
                    'popularity': element.get('popularity'),
                    'known_for': element.get('known_for'),
                })

    # Exporter les données dans un fichier JSON
    with open('actors_data.json', 'w') as json_file:
        json.dump(actors_data, json_file, indent=2)
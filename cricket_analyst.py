import os
import requests
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com"


def search_player(player_name):
    """Search for a player and return their playerId"""
    url = f"https://{RAPIDAPI_HOST}/stats/v1/player/search"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    params = {"plrN": player_name}
    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    if "player" in data and len(data["player"]) > 0:
        return data["player"][0]["id"]
    return None


def get_player_stats(player_id):
    """Get batting stats for a player using their ID"""
    url = f"https://{RAPIDAPI_HOST}/stats/v1/player/{player_id}/batting"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    response = requests.get(url, headers=headers)
    return response.json()


def analyze_player(player_name):
    player_id = search_player(player_name)

    live_stats = "No live stats found."
    if player_id:
        stats_data = get_player_stats(player_id)
        live_stats = str(stats_data)

    prompt = f"""
    You are a cricket expert analyst. Analyze {player_name}'s batting/bowling performance in T20 cricket.

    Here is real, live statistical data for this player:
    {live_stats}

    Using the above real data, cover these points:
    1. Batting/Bowling style
    2. Strengths
    3. Weaknesses
    4. Recent form
    5. Overall T20 rating out of 10

    Give a structured, detailed analysis based on the actual data provided.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

def compare_players(player1, player2):
    # Fetch live stats for both players
    id1 = search_player(player1)
    id2 = search_player(player2)

    stats1 = str(get_player_stats(id1)) if id1 else "No stats found."
    stats2 = str(get_player_stats(id2)) if id2 else "No stats found."

    prompt = f"""
    You are a cricket expert. Compare {player1} and {player2} in T20 cricket.

    Live stats for {player1}:
    {stats1}

    Live stats for {player2}:
    {stats2}

    Using the above real data, cover:
    1. Head to head statistical comparison
    2. Who is better in powerplay
    3. Who is better in death overs
    4. Overall who is the better T20 player and why
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def predict_match(team1, team2, venue, 
                  team1_players=None, team2_players=None):
    
    # Default key players if none provided
    if team1_players is None:
        team1_players = []
    if team2_players is None:
        team2_players = []

    # Fetch live stats for key players
    team1_stats = ""
    for player in team1_players:
        pid = search_player(player)
        if pid:
            stats = get_player_stats(pid)
            team1_stats += f"\n{player}: {str(stats)}"
    
    team2_stats = ""
    for player in team2_players:
        pid = search_player(player)
        if pid:
            stats = get_player_stats(pid)
            team2_stats += f"\n{player}: {str(stats)}"

    # Fallback if no players provided
    if not team1_stats:
        team1_stats = "No player stats provided."
    if not team2_stats:
        team2_stats = "No player stats provided."

    prompt = f"""
    You are a cricket analyst. Predict the outcome of a T20 match 
    between {team1} and {team2} at {venue}.

    Live stats for key {team1} players:
    {team1_stats}

    Live stats for key {team2} players:
    {team2_stats}

    Using the above real data, cover:
    1. Team strengths and weaknesses based on player stats
    2. Key players to watch
    3. Pitch and venue analysis for {venue}
    4. Predicted winner with reasoning
    5. Predicted score range
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
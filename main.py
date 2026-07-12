from fastapi import FastAPI
from cricket_analyst import (
    analyze_player,
    compare_players,
    predict_match
)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Cricket AI Analyst API Running"}


@app.get("/analyze-player/{player_name}")
def player_analysis(player_name: str):
    result = analyze_player(player_name)
    return {"analysis": result}


@app.get("/compare-players")
def player_comparison(player1: str, player2: str):
    result = compare_players(player1, player2)
    return {"comparison": result}


@app.get("/match-analysis")
def match_analysis(
    team1: str, 
    team2: str, 
    venue: str,
    team1_players: str = "",
    team2_players: str = ""
):
    t1_list = [p.strip() for p in team1_players.split(",") if p.strip()]
    t2_list = [p.strip() for p in team2_players.split(",") if p.strip()]
    
    result = predict_match(team1, team2, venue, t1_list, t2_list)
    return {"analysis": result}

reset_game:
	sqlite3 aotds.sqlite3 "delete from game_turns where name ='epsilon'"
	transerialize samples/game.yml samples/game.json
	http post 'http://localhost:3000/api/battle' < samples/game.json

http post 'http://localhost:3000/api/battle' < samples/game.json

# check that game is created

http :3000/api/battle/epsilon 

# post the turn for enkidu

http post :3000/api/battle/epsilon/ship/enkidu/orders < enkidu-orders.json

# post the turn for siduri

http post :3000/api/battle/epsilon/ship/enkidu/orders < siduri-orders.json 

# should at at turn 1

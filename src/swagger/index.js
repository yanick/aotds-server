export default {
   "swagger": "2.0",
   "info": {
     "title": "AotDS game server",
     "description": "REST server keep track of the games",
     "version": "0.0.1"
   },
   "produces": ["application/json"],
   "consumes": ["application/json"],
   "host": "localhost:8000",
   "basePath": "/api",
   "paths": {
     "/battle": {
       "get": {
         "x-swagger-router-controller": "battle",
         "operationId": "getBattle",
         "tags": ["/test"],
         "description": "",
         "parameters": [],
         "responses": {}
       }
     }
   }
};

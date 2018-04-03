import express from 'express';
import swaggerUi from 'swagger-ui-express';
const bodyParser = require('body-parser')
const swagger = require('swagger-express-router');

import { Model } from 'objection';
import knexConfig from '../knexfile';
import Knex from 'knex';

import readdir from "recursive-readdir";

import * as battle from './controllers/battle';
let boom = require('express-boom');

const knex = Knex(knexConfig.development);
Model.knex(knex);

let app = express();
app.use( bodyParser.json() );
//app.use(boom);

let swaggerDoc = {
   "swagger": "2.0",
   "info": {
     "title": "AotDS game server",
     "description": "REST server keep track of the games",
     "version": "0.0.1"
   },
   "produces": ["application/json"],
   "consumes": ["application/json"],
   "host": "localhost:3000",
   "basePath": "/api",
   "paths": { }
};
 
readdir("./src/controllers").then((files) => {
    let mws = {};
    files.forEach( file => {
        if( /test/.test(file) ) return;

        let i = require( file.replace( 'src/', './' ) );
        swaggerDoc = i.update_swagger(swaggerDoc);
        let path = file.replace( 'src/controllers/', '' ).replace('.js','');
        mws[path] = i;
    });

    return { swaggerDoc, mws }
}).then( ({ swaggerDoc, mws }) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

    app.get('/api/docs.json', (req,res,next) => {
        res.send(swaggerDoc);
    });

    console.log(mws)
    swagger.setUpRoutes( mws, app, swaggerDoc, true );

    app.use((err, req, res, next) => {
        let output = err.output.payload;
        if( err.data ) { output.data = err.data }
        return res.status(err.output.statusCode).json(output);
    });

    app.listen(3000, () => console.log("READY!"));
}).catch( e => {
    console.log(e);
});



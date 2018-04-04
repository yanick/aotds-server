import { Model } from 'objection';
import knexConfig from '../knexfile';
import Knex from 'knex';

const knex = Knex(knexConfig.development);
Model.knex(knex);

import { schedule_expirations } from './turn_expiration';

( async () => await schedule_expirations() )();

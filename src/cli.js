import Players from './store/players';
import commander from 'commander';
import bcrypt from 'bcrypt';

let store = new Players( './player_store' );

commander
  .command('add <player> <password>')
  .option('--admin', 'is admin')
  .action(async function (player_id, password, cmd) {
      let user = {
          player_id,
          password: await bcrypt.hash(password, 10),
          is_admin:  cmd.admin
      };

      store.set( user );

      console.log("saved");
  });
 
commander.parse(process.argv);

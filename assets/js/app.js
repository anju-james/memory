// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html";

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

import game_form from './gamestartform';
import start_game from "./memorygame";

function init() {
  let game = document.getElementById('game');
  let game_start_form = document.getElementById('game_start_form');
  if (game_start_form) {
    game_form(game_start_form);
  }

  if (game) {
      start_game(game, window.gameName);
  }
}

// Use jQuery to delay until page loaded.
$(init);


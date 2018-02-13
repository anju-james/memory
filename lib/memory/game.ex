defmodule Memory.Game do
  @moduledoc """
  A module that handles the rules of the momory game.
  """

  # use Agent for state
  alias Memory.GameState

  # fixed grid size
  @grid_size 16

  # Returns the card values of the memory game
  defp grid_size, do: @grid_size

  # Returns the default initial values of a grid
  defp initial_grid_values,
       do: ((Enum.map(?a..?z, fn (x) -> <<x :: utf8>> end)
             |> Enum.take(div(grid_size(), 2))) ++
            (Enum.map(?a..?z, fn (x) -> <<x :: utf8>> end)
             |> Enum.take(div(grid_size(), 2))))
           |> Enum.shuffle


  # Returns the default initial visibility of a grid
  defp initial_visibility, do: List.duplicate(0, grid_size())

  # Returns the initial state of the grid
  defp initial_grid,
       do: %{
         values: initial_grid_values(),
         visibility: initial_visibility(),
         click_count: 0,
         gamestatus: determine_game_status(initial_visibility())
       }

  # Determines whether the game is ongoing or not
  defp determine_game_status(grid_visibility) do
    if Enum.any?(grid_visibility, fn (x) -> x != -1 end) do
      1
    else
      2
    end
  end

  # Compute the grid state based on the card clicked
  defp compute_grid_state(
         %{values: grid_values, visibility: grid_visibility, click_count: count, gamestatus: gamestatus},
         grid_index
       ) do
    if Enum.at(grid_visibility, grid_index) == 1 || Enum.at(grid_visibility, grid_index) == -1 do
      # no change
      %{values: grid_values, visibility: grid_visibility, click_count: count, gamestatus: gamestatus}
    else
      new_grid_visibility = List.replace_at(grid_visibility, grid_index, 1)
      new_click_count = count + 1
      # if even click then decide whether to hide both cards
      new_grid_visibility = if rem(new_click_count, 2) == 0 do
        search_alpha = Enum.at(grid_values, grid_index)

        # find matching counter part
        matching_elem = Enum.find(
          Enum.with_index(
            grid_values
          ),
          fn ({alpha, idx}) -> alpha == search_alpha && grid_index != idx && Enum.at(new_grid_visibility, idx) == 1
          end
        )

        if (matching_elem != nil) do
          # On finding matched tiles, they are disabled
          List.replace_at(new_grid_visibility, grid_index, -1)
          |> List.replace_at(elem(matching_elem, 1), -1)
        else
          # Hides the clicked tiles that are not matching in value
          Enum.map(
            new_grid_visibility,
            fn (x) ->
              if x == 1 do
                0
              else
                x
              end
            end
          )
        end
      else
        new_grid_visibility
      end

      # return the state
      %{
        values: grid_values,
        visibility: new_grid_visibility,
        click_count: new_click_count,
        gamestatus: determine_game_status(new_grid_visibility)
      }
    end
  end

  @doc """
  Return the current state of the game.
  """
  def get_game_state(game_name) do
    if !GameState.known_game?(game_name) do
      game_state = initial_grid()
      GameState.put_game_state(game_name, game_state)
    end
    GameState.get_game_state(game_name)
  end

  @doc """
  Recompute and return the new state of the board based on the player move.
  """
  def recompute_game_state(game_name, game_move) do
    current_game_state = get_game_state(game_name)
    new_game_state = compute_grid_state(current_game_state, game_move)
    GameState.put_game_state(game_name, new_game_state)
    new_game_state
  end

  @doc """
  Return the intermediate state of the board based on the move.
  """
  def determine_visibility_stateless(game_name, grid_index) do
    game_state = get_game_state(game_name)
    %{
      values: _new_grid_values,
      visibility: _new_grid_visibility,
      click_count: new_count,
      gamestatus: new_gamestatus
    } = compute_grid_state(game_state, grid_index)
    %{values: grid_values, visibility: grid_visibility, click_count: _count, gamestatus: gamestatus} = game_state
    # show intermediate state showing two open cards
    if (new_gamestatus != 1 || rem(new_count, 2) != 0) do
      {:ignore, game_state}
    else
      {
        :publish,
        %{
          values: grid_values,
          visibility: List.replace_at(grid_visibility, grid_index, 1),
          click_count: new_count,
          gamestatus: gamestatus
        }
      }
    end
  end

  @doc """
  Reset the game to the default game.
  """
  def reset_game_state(game_name) do
    game_state = initial_grid()
    GameState.put_game_state(game_name, game_state)
    game_state
  end


end

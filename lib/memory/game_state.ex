defmodule Memory.GameState do
  @moduledoc """
  An Agent used to store and retrieve state of the games.
  """

  @doc """
  Start agent as an empty array.
  """
  def start_link do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @doc """
  Retrieves the state of the given game.
  """
  def get_game_state(game_name), do:
    Agent.get(__MODULE__, &Map.get(&1, game_name))


  @doc """
  Updates the state of the given game.
  """
  def put_game_state(game_name, game_state), do:
    Agent.update(__MODULE__, &Map.put(&1, game_name, game_state))

  @doc """
  Checks if the state of given name is available in map.
  """
  def known_game?(game_name), do:
    Agent.get(__MODULE__, &Map.fetch(&1, game_name)) != :error


end

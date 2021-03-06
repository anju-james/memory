defmodule MemoryWeb.GameChannel do
  use Phoenix.Channel
  @moduledoc """
  A module that handles messages from the clients to the game channel
  """

  alias Memory.Game

  @doc """
  Handle join message.
  """
  def join("game:" <> name, payload, socket) do
    if authorized?(payload) do
      socket = socket
               |> assign(:game_name, name)
      {:ok, %{state: Game.get_game_state(socket.assigns.game_name)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Add authorization logic here as required.
  # Will enhance it later to look at usertoken and decide.
  defp authorized?(_payload) do
    true
  end

  @doc """
  Handle game reset message.
  """
  def handle_in("game:reset", %{}, socket) do
    push socket, "game:update", %{state: Game.reset_game_state(socket.assigns.game_name)}
    {:noreply, socket}
  end

  @doc """
  Handle a move made by the player.
  """
  def handle_in("game:move", %{"game_index" => game_index}, socket) do
    new_state = Game.determine_visibility_stateless(socket.assigns.game_name, game_index)
    if elem(new_state, 0) == :publish do
      push socket, "game:intermediate", %{state: elem(new_state, 1)}
      Process.send_after(self(), {:after_delay, game_index}, 1000)
    else
      push socket, "game:update", %{state: Game.recompute_game_state(socket.assigns.game_name, game_index)}
    end
    {:noreply, socket}
  end

  @doc """
  Handle delayed response from the server.
  """
  def handle_info({:after_delay, game_index}, socket) do
    push socket, "game:update", %{state: Game.recompute_game_state(socket.assigns.game_name, game_index)}
    {:noreply, socket}
  end


end

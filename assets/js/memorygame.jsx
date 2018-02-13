import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'reactstrap';
import socket from './socket';

export default function start_game(root, game_name) {
    ReactDOM.render(<GameBoard gameName={game_name}/>, root);
}

/*
Component that represents a memory gameboard.
 */
class GameBoard extends React.Component {
    //Constructor for Game board
    constructor(props) {
        super(props);
        this.state = {
            values: [],
            visibility: [],
            clickCount: 0,
            gamestatus: 0,
        };
        this.channel = null;
        this.ongoingRequest = false;
    }

    /* setup channels on component mount */
    componentDidMount() {
        let channel = socket.channel("game:" + this.props.gameName, {});
        this.channel = channel;
        channel.join()
            .receive("ok", resp => {
                console.log("Joined successfully", resp);
                this.setupChannelMessageHandling();
                this.updateStateFromResponse(resp);
            })
            .receive("error", resp => {
                console.log("Unable to join", resp);
            });

    }

    /* Setup listening to channels for message*/
    setupChannelMessageHandling() {
        // update state from response
        this.channel.on("game:update", (resp) => {
            this.ongoingRequest = false;
            this.updateStateFromResponse(resp)
        });

        this.channel.on("game:intermediate", (resp) =>
            this.updateStateFromResponse(resp)
        );
    }

    /* Update state based o nthe response from server */
    updateStateFromResponse(resp) {
        this.setState({
            values: resp.state.values,
            visibility: resp.state.visibility,
            clickCount: resp.state.click_count,
            gamestatus: resp.state.gamestatus
        })
    }

    /*
    Render the square component
     */
    drawSquare(i) {
        return <Square alphabet={this.state.values[i]}
                       visibility={this.state.visibility[i]}
                       clickHandler={() => this.handleClick(i)}/>
    }

    /*
    Function to handle the clicks on the board.
     */
    handleClick(i) {
        if (this.ongoingRequest == false) {
            this.channel.push("game:move", {game_index: i});
            this.ongoingRequest = true;
        }
    }

    /*
    Function to display the current status of the game
     */
    gameStatus() {
        if (this.state.gamestatus == 1) {
            //ongoing game
            return 'Ongoing Game - ' + this.props.gameName;
        } else if (this.state.gamestatus == 2) {
            return this.props.gameName + ' - Game completed.';
        } else if (this.state.gamestatus == 0) {
            // game over
            return 'Wait while we load Game -' + this.props.gameName;
        } else {
            return ' Game status -' + this.state.gamestatus + '.' + this.props.gameName;
        }
    }

    /*
    Function to get game-board to render
     */
    renderGameBoard() {
        if (this.state.gamestatus == 1 || this.state.gamestatus == 2) {
            return <div className="game-board">
                <div className="board-row">
                    {this.drawSquare(0)}
                    {this.drawSquare(1)}
                    {this.drawSquare(2)}
                    {this.drawSquare(3)}
                </div>
                <div className="board-row">
                    {this.drawSquare(4)}
                    {this.drawSquare(5)}
                    {this.drawSquare(6)}
                    {this.drawSquare(7)}
                </div>
                <div className="board-row">
                    {this.drawSquare(8)}
                    {this.drawSquare(9)}
                    {this.drawSquare(10)}
                    {this.drawSquare(11)}
                </div>
                <div className="board-row">
                    {this.drawSquare(12)}
                    {this.drawSquare(13)}
                    {this.drawSquare(14)}
                    {this.drawSquare(15)}
                </div>
            </div>;
        } else {
            return <div className="game-board"></div>;
        }
    }


    /*
    Render function to display the game board on the we page.
     */
    render() {
        const currGameStatus = this.gameStatus();
        return (
            <div>
                <div className="game">
                    {this.renderGameBoard()}
                </div>
                <div className="card text-center">
                    <div className="card-header">
                        {currGameStatus}
                    </div>
                    <div className="card-block">
                        <h4 className="card-title">{this.state.clickCount}</h4>
                        <p className="card-text">Clicks</p>
                    </div>
                    <div className="card-footer text-muted">
                        <button className="btn btn-primary"
                                onClick={() => this.channel.push("game:reset", {})}>Restart Game
                        </button>
                    </div>
                </div>
            </div>

        )
    }
}


/*
Component that represents the squares/tiles of the game board.
 */
class Square extends React.Component {
    render() {
        return (
            <button className="square"
                    onClick={this.props.clickHandler}
                    disabled={this.props.visibility == -1}>
                {this.props.visibility == 0 ? "" : this.props.alphabet}
            </button>

        );
    }
}

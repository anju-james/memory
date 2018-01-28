import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'reactstrap';

export default function start_game(root) {
    ReactDOM.render(<GameBoard gridSize={16}/>, root);
}

/*
Component that represents a memory gameboard.
 */
class GameBoard extends React.Component {
    //Constructor for Game board
    constructor(props) {
        super(props);
        this.state = this.boardInitialize(this.props.gridSize);

    }

    /*
    Function to initialize the game board based on the grid size.
     */
    boardInitialize(gridSize) {
        const squareValues = Array(gridSize);
        const squareVisibility = Array(gridSize).fill(0);
        let startAlpha = 'A';
        let i = 0;
        //Filling in the alphabet values in the state array
        for (; i < gridSize;) {
            squareValues[i] = startAlpha;
            squareValues[i + 1] = startAlpha;
            startAlpha = String.fromCharCode(startAlpha.charCodeAt(0) + 1);
            i = i + 2;
        }

        //Shuffling the alphabet values in the array
        for (let i = squareValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [squareValues[i], squareValues[j]] = [squareValues[j], squareValues[i]];
        }
        this.intervalTimer = null;
        //returns the initialized start state of the board.
        return {values: squareValues, visibility: squareVisibility, clickCount: 0};
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
        const newVisibility = this.state.visibility.slice();
        if (newVisibility[i] == 1 || newVisibility[i] == -1 || this.intervalTimer != null) {
            return;
        }
        newVisibility[i] = 1;
        let newClickCount = this.state.clickCount + 1;

        //Managing clicked tiles
        if (newClickCount % 2 == 0) {
            const currAlphas = this.state.values.slice();
            let foundMatch = false;
            for (let j = 0; j < currAlphas.length; j++) {
                if (currAlphas[j] == currAlphas[i] && i != j && newVisibility[j] == 1) {
                    //On finding matched tiles, they are disabled from further clicks
                    // by changing their visibility value
                    newVisibility[i] = -1;
                    newVisibility[j] = -1;
                    foundMatch = true;
                    break;
                }
            }
            //On clicking unmatched tiles
            if (!foundMatch) {
                //Set Timer
                this.intervalTimer = setInterval(() => this.hideVisibleSquares(), 1000);
            }
        }

        this.setState({visibility: newVisibility, clickCount: newClickCount});

    }

    /*
     Hides the clicked tiles that are not matching in value
      */
    hideVisibleSquares() {
        const currentVisibility = this.state.visibility.slice();
        currentVisibility.forEach((o, i, a) => a[i] = (a[i] == 1) ? 0 : a[i]);
        this.setState({visibility: currentVisibility});
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
    }

    /*
    Function to display the current status of the game
     */
    gameStatus() {
        if (this.state.visibility.some(squareVisible => squareVisible != -1)) {
            //ongoing game
            return {status: 'Ongoing Game'}
        } else {
            // game over
            return {status: 'Game completed'}
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
                    <div className="game-board">
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
                    </div>
                </div>
                <div className="card text-center">
                    <div className="card-header">
                        {currGameStatus.status}
                    </div>
                    <div className="card-block">
                        <h4 className="card-title">{this.state.clickCount}</h4>
                        <p className="card-text">Clicks</p>
                    </div>
                    <div className="card-footer text-muted">
                        <button className="btn btn-primary"
                                onClick={() => this.setState(this.boardInitialize(this.props.gridSize))}>Restart Game
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

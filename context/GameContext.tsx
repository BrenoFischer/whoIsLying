import { Game } from "@/types/Game";
import { Player } from "@/types/Player";
import { Round } from "@/types/Round";
import { createContext, useState } from "react";

interface GameContextType {
    game: Game
    createGame: (players: Player[]) => void
  }

export const GameContext = createContext({} as GameContextType);

export const GameContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [game, setGame] = useState<Game>({ players: [], currentRound: 0, rounds: [] });

    const shuffleRounds = (rounds: Round[]) => {
        for (let i = rounds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rounds[i], rounds[j]] = [rounds[j], rounds[i]]; // Swap elements
        }
        return rounds;
    }

    const setAllRounds = (newPlayers: Player[]): Round[] => {
        //the order of questions will always follow the crescent order of Players on the array
        //a 3 player game will have 1 round of questions: A->B, B->C, C->A
        //the next round of questions will be: A->C, C->B, B->A
        //after that, all rounds order will be randomized.
        const numberOfPlayers = newPlayers.length;
        let rounds: Round[] = []
        let auxRoundsArray: Round[] = []

        //insert frist set of rounds and shuffle
        for(let i=0; i < numberOfPlayers; i++) {
            const playerThatAsks = newPlayers[i]
            const playerThatAnswers = i === (numberOfPlayers - 1) ? newPlayers[0] : newPlayers[i+1]
            const round: Round = {playerThatAsks, playerThatAnswers }

            rounds.push(round);
        }

        rounds = shuffleRounds(rounds)

        //insert second set of rounds
        for(let i=(numberOfPlayers - 1); i >= 0; i--) {
            const playerThatAsks = newPlayers[i]
            const playerThatAnswers = i === 0 ? newPlayers[numberOfPlayers - 1] : newPlayers[i - 1]
            const round: Round = {playerThatAsks, playerThatAnswers}

            auxRoundsArray.push(round);
        }

        auxRoundsArray = shuffleRounds(auxRoundsArray)
        rounds = rounds.concat(auxRoundsArray)

        return rounds;
    }

    const createGame = (newPlayers: Player[]) => {
        const rounds = setAllRounds(newPlayers);
        setGame({ players: newPlayers, currentRound: 0, rounds });
    }
 
    return(
        <GameContext.Provider value={{ game, createGame }}>
            {children}
        </GameContext.Provider>
    )
}
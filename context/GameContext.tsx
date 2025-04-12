import { Game } from "@/types/Game";
import { Player } from "@/types/Player";
import { Round } from "@/types/Round";
import questions from "@/data/questions.json";
import allCategories from "@/data/categories.json";
import { createContext, useState } from "react";

interface GameContextType {
    game: Game
    createGame: (players: Player[]) => void
    setGameWord: (word: string) => void 
    nextRound: () => void
    showWordToNextPlayer: () => void
  }

export const GameContext = createContext({} as GameContextType);

export const GameContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [game, setGame] = useState<Game>({ players: [], currentRound: 1, rounds: [], lyingPlayer: {id: '', name: '', gender: '', character: ''}, word: undefined, showingWordToPlayer: 0 });

    const shuffleRounds = (rounds: Round[]) => {
        for (let i = rounds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rounds[i], rounds[j]] = [rounds[j], rounds[i]]; // Swap elements
        }
        return rounds;
    }

    const getRandomQuestionFromSet = (setOfQuestions: string[]) => {
        const setLength = setOfQuestions.length;

        const randomQuestion = setOfQuestions[Math.floor(Math.random() * setLength)]

        setOfQuestions = setOfQuestions.filter(q => q !== randomQuestion)

        return randomQuestion
    }

    const setAllRounds = (newPlayers: Player[]): Round[] => {
        //the order of questions will always follow the crescent order of Players on the array
        //a 3 player game will have 1 round of questions: A->B, B->C, C->A
        //the next round of questions will be: A->C, C->B, B->A
        //after that, all rounds order will be randomized.
        const numberOfPlayers = newPlayers.length;
        let rounds: Round[] = []
        let auxRoundsArray: Round[] = []
        let {firstSetOfQuestions, secondSetOfQuestions} = questions;
        
        //insert frist set of rounds and shuffle
        for(let i=0; i < numberOfPlayers; i++) {
            const playerThatAsks = newPlayers[i]
            const playerThatAnswers = i === (numberOfPlayers - 1) ? newPlayers[0] : newPlayers[i+1]
            const question = getRandomQuestionFromSet(firstSetOfQuestions)
            
            const round: Round = {playerThatAsks, playerThatAnswers, question }

            rounds.push(round);
        }

        rounds = shuffleRounds(rounds)

        //insert second set of rounds
        for(let i=(numberOfPlayers - 1); i >= 0; i--) {
            const playerThatAsks = newPlayers[i]
            const playerThatAnswers = i === 0 ? newPlayers[numberOfPlayers - 1] : newPlayers[i - 1]
            const question = getRandomQuestionFromSet(secondSetOfQuestions)

            const round: Round = {playerThatAsks, playerThatAnswers, question}

            auxRoundsArray.push(round);
        }

        auxRoundsArray = shuffleRounds(auxRoundsArray)
        rounds = rounds.concat(auxRoundsArray)

        return rounds;
    }

    const setGameWord = (category: string) => {
        const categories: any = allCategories
        const categoryWords: string[] = categories[category].content
        const word = categoryWords[Math.floor(Math.random() * categoryWords.length)]
        setGame({...game, word})
    }

    const createGame = (newPlayers: Player[]) => {
        const rounds = setAllRounds(newPlayers);
        const lyingPlayer: Player = newPlayers[Math.floor(Math.random() * newPlayers.length)] //get a random player to be out of the round 
        setGame({...game, players: newPlayers, currentRound: 1, rounds, lyingPlayer, showingWordToPlayer: 0 });
    }

    const nextRound = () => {
        const newRound = game.currentRound + 1
        setGame({...game, currentRound: newRound})
    }

    const showWordToNextPlayer = () => {
        const nextPlayer = game.showingWordToPlayer + 1
        setGame({...game, showingWordToPlayer: nextPlayer})
    }
 
    return(
        <GameContext.Provider value={{ game, createGame, setGameWord, nextRound, showWordToNextPlayer }}>
            {children}
        </GameContext.Provider>
    )
}
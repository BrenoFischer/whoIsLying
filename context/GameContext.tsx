import { Game } from "@/types/Game";
import { Player } from "@/types/Player";
import { Round } from "@/types/Round";
import questions from "@/data/questions.json";
import allCategories from "@/data/categories.json";
import { createContext, useState } from "react";

interface GameContextType {
    game: Game
    createGame: (players: Player[]) => void
    createNewGame: () => void
    setMaximumMatches: (maxQtd: number) => void
    addNewMatch: () => void
    setGameWord: (word: string) => void 
    getRandomWord: (category: string) => string
    setSelectedWord: (newWord: string) => void
    nextRound: () => void
    previousRound: () => void
    showWordToNextPlayer: () => void
    addVote: (playerThatVoted: Player, playerVoted: Player) => void
    updatePlayers: (players: Player[]) => void
    updatePointsToPlayer: (player: Player, points: number) => Player[]
  }

export const GameContext = createContext({} as GameContextType);

export const GameContextProvider = ({ children }: {children: React.ReactNode}) => {
    const newGame: Game = {
        players: [], 
        currentRound: 1, 
        rounds: [], 
        lyingPlayer: {id: '', name: '', gender: '', character: '', score: 0}, 
        category: undefined, 
        word: undefined, 
        selectedWord: undefined,
        showingWordToPlayer: 0,
        votes: [],
        maximumMatches: 2,
        currentMatch: 1
    }

    const [game, setGame] = useState<Game>(newGame);

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

        return {question: randomQuestion, questions: setOfQuestions}
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
            const set = getRandomQuestionFromSet(firstSetOfQuestions)
            const question = set.question
            firstSetOfQuestions = set.questions
            
            const round: Round = {playerThatAsks, playerThatAnswers, question }

            rounds.push(round);
        }

        rounds = shuffleRounds(rounds)

        //insert second set of rounds
        for(let i=(numberOfPlayers - 1); i >= 0; i--) {
            const playerThatAsks = newPlayers[i]
            const playerThatAnswers = i === 0 ? newPlayers[numberOfPlayers - 1] : newPlayers[i - 1]
            const set = getRandomQuestionFromSet(secondSetOfQuestions)
            const question = set.question
            secondSetOfQuestions = set.questions

            const round: Round = {playerThatAsks, playerThatAnswers, question}

            auxRoundsArray.push(round);
        }

        auxRoundsArray = shuffleRounds(auxRoundsArray)
        rounds = rounds.concat(auxRoundsArray)

        return rounds;
    }

    const setMaximumMatches = (maxQtd: number) => {
        setGame({...game, maximumMatches: maxQtd})
    }

    const addNewMatch = () => {
        const newMatch = game.currentMatch + 1
        setGame({...game, currentMatch: newMatch})
    }

    const getRandomWord = (category: string) => {
        const categories: any = allCategories
        const categoryWords: string[] = categories[category].content
        return categoryWords[Math.floor(Math.random() * categoryWords.length)]
    }

    const setGameWord = (category: string) => {
        const word = getRandomWord(category)
        setGame({...game, word, category})
    }

    const setSelectedWord = (newWord: string) => {
        setGame({...game, selectedWord: newWord})
    }

    const resetGameWithExistingPlayers = () => {
        const newGame = {
            ...game,
            currentRound: 1, 
            rounds: [], 
            lyingPlayer: {id: '', name: '', gender: '', character: '', score: 0}, 
            category: undefined, 
            word: undefined, 
            selectedWord: undefined,
            showingWordToPlayer: 0,
            votes: []
        }
        return newGame
    }

    const createNewGame = () => {
        const players = game.players.map(p => {
            return(
                {...p, score: 0}
            )
        })

        setGame({
            ...game, 
            players, 
            currentRound: 1,
            rounds: [], 
            lyingPlayer: {id: '', name: '', gender: '', character: '', score: 0},
            category: undefined, 
            word: undefined, 
            selectedWord: undefined,
            showingWordToPlayer: 0,
            votes: []
        })
    }

    const createGame = (newPlayers: Player[]) => {
        const newGame = resetGameWithExistingPlayers()
        const rounds = setAllRounds(newPlayers);
        const lyingPlayer: Player = newPlayers[Math.floor(Math.random() * newPlayers.length)] //get a random player to be out of the round 
        setGame({...newGame, players: newPlayers, rounds, lyingPlayer });
    }

    const nextRound = () => {
        const newRound = game.currentRound + 1
        setGame({...game, currentRound: newRound})
    }

    const previousRound = () => {
        const newRound = game.currentRound - 1
        setGame({...game, currentRound: newRound})
    }

    const showWordToNextPlayer = () => {
        const nextPlayer = game.showingWordToPlayer + 1
        setGame({...game, showingWordToPlayer: nextPlayer})
    }

    const updatePlayers = (players: Player[]) => {
        setGame({...game, players})
    }

    const updatePointsToPlayer = (player: Player, points: number) => {
        const updatedPlayers = game.players.map(p => {
            if(player.id === p.id) {
                return {...player, score: player.score + points}
            } else {
                return p
            }
        })

        return updatedPlayers
    }
    
    const addVote = (playerThatVoted: Player, playerVoted: Player) => {
        const newVotes = [...game.votes, {playerThatVoted, playerVoted}]

        //add 50 points if player voted correctly on the impostor
        if(playerVoted.id === game.lyingPlayer.id) {
            const updatedPlayers = updatePointsToPlayer(playerThatVoted, 50)
            setGame({...game, votes: newVotes, players: updatedPlayers})
        }
        else {
            setGame({...game, votes: newVotes})
        }
    } 

    return(
        <GameContext.Provider value={
            { 
                game, 
                setMaximumMatches,
                addNewMatch,
                createGame,
                createNewGame,
                setGameWord, 
                getRandomWord, 
                setSelectedWord, 
                nextRound, 
                previousRound, 
                showWordToNextPlayer, 
                addVote, 
                updatePointsToPlayer,
                updatePlayers, 
            }}>
            {children}
        </GameContext.Provider>
    )
}
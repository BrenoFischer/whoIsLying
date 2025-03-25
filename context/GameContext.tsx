import { Game } from "@/types/Game";
import { Player } from "@/types/Player";
import { createContext, useState } from "react";

interface GameContextType {
    game: Game
    createGame: (players: Player[]) => void
  }

export const GameContext = createContext({} as GameContextType);

export const GameContextProvider = ({ children }: {children: React.ReactNode}) => {
    const [game, setGame] = useState<Game>({ players: [] });

    const createGame = (newPlayers: Player[]) => {
        setGame({ players: newPlayers });
        console.log("game created")
    }

    return(
        <GameContext.Provider value={{ game, createGame }}>
            {children}
        </GameContext.Provider>
    )
}
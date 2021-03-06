import { Player, PositionId, SymbolData } from "../interfaces/GameData"
import GameData from "./GameData";

export const findNextSymbol = (gameData: GameData) => {

    let symbolX = 0;
    let symbolO = 0;

    for (let row = 0; row < gameData.dimensions; row++) {
        for (let column = 0; column < gameData.dimensions; column++) {

            const symbolData = gameData.data[row][column];

            if (symbolData === SymbolData.X) symbolX++;

            if (symbolData === SymbolData.O) symbolO++;

        }
    }

    return symbolX - symbolO === 1 ? SymbolData.O : SymbolData.X;

};

export const isBoardFull = (gameData: GameData) => {

    for (let row = 0; row < gameData.dimensions; row++) {
        for (let column = 0; column < gameData.dimensions; column++) {

            if (gameData.data[row][column] === SymbolData.None)
                return false;

        }
    }

    return true;

}

export const convertSymbolDataToPlayer = (symbolData: SymbolData | null) => (
    symbolData === null
        ? null
        : symbolData === SymbolData.None
            ? Player.None
            : symbolData === SymbolData.O
                ? Player.Computer
                : Player.Human
);

export const findWhoWon = (gameData: GameData): Player | null => {
    const findWinnerSymbolData = () => {

        let symbolDataMainHorizontal: SymbolData | undefined = undefined;
        let symbolDataSecondaryHorizontal: SymbolData | undefined = undefined;

        for (let index1 = 0; index1 < gameData.dimensions; index1++) {

            if (symbolDataMainHorizontal === undefined || gameData.data[index1][index1] === symbolDataMainHorizontal)
                symbolDataMainHorizontal = gameData.data[index1][index1];

            else
                symbolDataMainHorizontal = null;


            if (symbolDataSecondaryHorizontal === undefined || gameData.data[index1][gameData.dimensions - 1 - index1] === symbolDataSecondaryHorizontal)
                symbolDataSecondaryHorizontal = gameData.data[index1][gameData.dimensions - 1 - index1];

            else
                symbolDataSecondaryHorizontal = null;


            let symbolDataHorizontal: SymbolData | undefined = undefined;
            let symbolDataVertical: SymbolData | undefined = undefined;

            for (let index2 = 0; index2 < gameData.dimensions; index2++) {

                if (symbolDataHorizontal === undefined || gameData.data[index1][index2] === symbolDataHorizontal)
                    symbolDataHorizontal = gameData.data[index1][index2];

                else
                    symbolDataHorizontal = null;


                if (symbolDataVertical === undefined || gameData.data[index2][index1] === symbolDataVertical)
                    symbolDataVertical = gameData.data[index2][index1];

                else
                    symbolDataVertical = null;

            }

            if (symbolDataHorizontal)
                return symbolDataHorizontal;

            if (symbolDataVertical)
                return symbolDataVertical;

        }

        if (symbolDataMainHorizontal)
            return symbolDataMainHorizontal;

        if (symbolDataSecondaryHorizontal)
            return symbolDataSecondaryHorizontal;


        return isBoardFull(gameData) ? SymbolData.None : null;
    }

    const winnerSymbolData = findWinnerSymbolData()

    return convertSymbolDataToPlayer(winnerSymbolData);
};

let scores = {};

export const findBestMove = (gameData: GameData, humanWins: boolean) => {
    scores[Player.Human] = humanWins ? 1 : -1;
    scores[Player.Computer] = humanWins ? -1 : 1;
    scores[Player.None] = 0;

    let bestScore = -Infinity;
    let bestPosition: PositionId | undefined;

    for (let row = 0; row < gameData.dimensions; row++) {
        for (let column = 0; column < gameData.dimensions; column++) {

            const symbolData = gameData.data[row][column];

            if (symbolData === SymbolData.None) {
                let newGameData = copyGameData(gameData);

                newGameData.data[row][column] = SymbolData.O;

                const score = minMax(newGameData);

                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = [row, column];
                }
            }

        }
    }

    return bestPosition;

};

const minMax = (gameData: GameData, maxDepth?: number, depth: number = 0): number => {

    if (maxDepth && depth > maxDepth) {
        // console.log('Reached maxDepth')
        return 0;
    }

    const whoWon = findWhoWon(gameData);

    if (whoWon)
        return scores[whoWon];

    const nextSymbol = findNextSymbol(gameData);

    if (nextSymbol === SymbolData.O) {
        let bestScore = -Infinity;
        for (let row = 0; row < gameData.dimensions; row++) {
            for (let column = 0; column < gameData.dimensions; column++) {
    
                const symbolData = gameData.data[row][column];
    
                if (symbolData === SymbolData.None) {
                    let newGameData = copyGameData(gameData);
    
                    newGameData.data[row][column] = SymbolData.O;
    
                    const score = minMax(newGameData, maxDepth, depth + 1);
    
                    bestScore = Math.max(score, bestScore);
                }
    
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let row = 0; row < gameData.dimensions; row++) {
            for (let column = 0; column < gameData.dimensions; column++) {
    
                const symbolData = gameData.data[row][column];
    
                if (symbolData === SymbolData.None) {
                    let newGameData = copyGameData(gameData);
    
                    newGameData.data[row][column] = SymbolData.X;
    
                    const score = minMax(newGameData, maxDepth, depth + 1);
    
                    bestScore = Math.min(score, bestScore);
                }
    
            }
        }
        return bestScore;
    }

};

export const copyGameData = (gameData: GameData): GameData => (
    new GameData([...gameData.data.map(row => [...row])])
);
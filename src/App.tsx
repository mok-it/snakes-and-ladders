import { Board } from './components/Board';
import { GameMasterControls } from './components/GameMasterControls';
import {useEffect, useState} from 'react';
import {ladders, snakes} from "./data/snakesAndLadders.ts";

export type Piece = {
    id: number;
    name: string;
    position: number;
    color: string;
};

export default function App() {
    const [pieces, setPieces] = useState<Piece[]>([]);

    const movePiece = (id: number, points: number) => {
        setPieces((prev) =>
            prev.map((piece) => {
                if (piece.id !== id) return piece;

                let oldPosition = piece.position;
                let newPosition = oldPosition + points;
                if (newPosition > 100) newPosition = 100;

                // Check if passed over any star fields
                const range = points > 0
                    ? Array.from({ length: newPosition - oldPosition + 1 }, (_, i) => oldPosition + i)
                    : Array.from({ length: oldPosition - newPosition + 1 }, (_, i) => oldPosition - i);

                for (const pos of range) {
                    if (starTiles.includes(pos)) {
                        console.log(`⭐ ${piece.name} passed or landed on star at ${pos}`);
                        break;
                    }
                }

                newPosition = applySnakesAndLadders(newPosition);

                return { ...piece, position: newPosition };
            })
        );
    };



    const addPiece = (name: string, color: string) => {
        const newId = Math.max(0, ...pieces.map((p) => p.id)) + 1;
        setPieces((prev) => [...prev, { id: newId, name, position: 1, color }]);
    };

    useEffect(() => {
        const handler = (e: any) => {
            const { pieceId, targetTile } = e.detail;
            setPieces((prev) =>
                prev.map((piece) => {
                    if (piece.id !== pieceId) return piece;

                    if (starTiles.includes(targetTile)) {
                        console.log(`⭐ ${piece.name} landed on star at ${targetTile}`);
                    }

                    const finalTile = applySnakesAndLadders(targetTile);
                    return { ...piece, position: finalTile };
                })
            );
        };

        window.addEventListener('pieceMove', handler);
        return () => window.removeEventListener('pieceMove', handler);
    }, []);

    const [starTiles, setStarTiles] = useState<number[]>([5, 23, 32, 37, 59, 88, 96]);

    useEffect(() => {
        const stars: number[] = [];
        while (stars.length < 12) {
            const randomTile = Math.floor(Math.random() * 99) + 2; // avoid 1 and 100
            if (!stars.includes(randomTile)) {
                stars.push(randomTile);
            }
        }
        setStarTiles(stars);
    }, []);


    return (
        <div className="flex h-screen">
            <div className="flex-grow flex items-center justify-center bg-gray-100 p-2">
                <Board pieces={pieces} starTiles={starTiles} />
            </div>
            <div className="w-80 border-l border-gray-300 p-2 bg-white">
                <GameMasterControls
                    pieces={pieces}
                    onMove={movePiece}
                    onAddPiece={addPiece}
                />
            </div>
        </div>
    );
}

const applySnakesAndLadders = (position: number) => {
    if (ladders[position]) {
        return ladders[position];
    }
    if (snakes[position]) {
        return snakes[position];
    }
    return position;
};


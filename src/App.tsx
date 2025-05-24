import {Board} from './components/Board';
import {GameMasterControls} from './components/GameMasterControls';
import {useEffect, useState} from 'react';
import {ladders, snakes} from "./data/snakesAndLadders.ts";

export type Piece = {
    id: number;
    name: string;
    position: number;
    color: string;
};

export default function App() {
    const [pieces, setPieces] = useState<Piece[]>(() => {
        const stored = localStorage.getItem('pieces');
        return stored ? JSON.parse(stored) : [];
    });

    const handleMovePiece = (id: number, points: number) => {
        setPieces((prev) =>
            prev.map((piece) => {
                if (piece.id !== id) return piece;

                let oldPosition = piece.position;
                let newPosition = oldPosition + points;
                if (newPosition > 100) newPosition = 100;

                // Check if passed over any star fields
                const range = points > 0
                    ? Array.from({length: newPosition - oldPosition + 1}, (_, i) => oldPosition + i)
                    : Array.from({length: oldPosition - newPosition + 1}, (_, i) => oldPosition - i);

                for (const pos of range) {
                    if (starTiles.includes(pos)) {
                        console.log(`⭐ ${piece.name} passed or landed on star at ${pos}`);
                        break;
                    }
                }

                newPosition = applySnakesAndLadders(newPosition);

                return {...piece, position: newPosition};
            })
        );
    };

    const handleAddPiece = (name: string, color: string) => {
        const newId = Math.max(0, ...pieces.map((p) => p.id)) + 1;
        setPieces((prev) => [...prev, {id: newId, name, position: 1, color}]);
    };

    useEffect(() => {
        localStorage.setItem('pieces', JSON.stringify(pieces));
    }, [pieces]);

    useEffect(() => {
        const handler = (e: any) => {
            const {pieceId, targetTile} = e.detail;
            setPieces((prev) =>
                prev.map((piece) => {
                    if (piece.id !== pieceId) return piece;

                    if (starTiles.includes(targetTile)) {
                        console.log(`⭐ ${piece.name} landed on star at ${targetTile}`);
                    }

                    const finalTile = applySnakesAndLadders(targetTile);
                    return {...piece, position: finalTile};
                })
            );
        };

        window.addEventListener('pieceMove', handler);
        return () => window.removeEventListener('pieceMove', handler);
    }, []);

    const [starTiles, setStarTiles] = useState<number[]>(() => {
        const stored = localStorage.getItem('starTiles');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('starTiles', JSON.stringify(starTiles));
    }, [starTiles]);

    const handleAddStars = (tiles: number[]) => {
        setStarTiles([...starTiles, ...tiles].sort((a, b) => a - b));
    };
    const handleReplaceStars = (tiles: number[]) => setStarTiles(tiles.sort((a, b) => a - b));

    const handleClearAllStars = () => setStarTiles([]);

    const handleResetTeams = () => {
        const confirmed = window.confirm('Biztos, hogy véglegesen törlöd az összes csapatot?');
        if (confirmed) {
            setPieces([]);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="flex-grow flex items-center justify-center bg-gray-100 p-2">
                <Board pieces={pieces} starTiles={starTiles}/>
            </div>
            <div className="w-80 border-l border-gray-300 p-2 bg-white">
                <GameMasterControls
                    pieces={pieces}
                    onMove={handleMovePiece}
                    onAddPiece={handleAddPiece}
                    onAddStars={handleAddStars}
                    onReplaceStars={handleReplaceStars}
                    starTiles={starTiles}
                    onRemoveStar={(tile) => setStarTiles(starTiles.filter((t) => t !== tile))}
                    onClearAllStars={handleClearAllStars}
                    onResetTeams={handleResetTeams}
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


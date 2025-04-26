import { useState } from 'react';

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

type GameMasterControlsProps = {
    pieces: { id: number; name: string; position: number; color: string }[];
    onMove: (id: number, points: number) => void;
    onAddPiece: (name: string, color: string) => void;
};

export function GameMasterControls({ pieces, onMove, onAddPiece }: GameMasterControlsProps) {
    const [selectedPieceId, setSelectedPieceId] = useState<number>(pieces[0]?.id ?? 1);
    const [pointsInput, setPointsInput] = useState<string>("1");
    const [newPieceName, setNewPieceName] = useState('');
    const [newPieceColor, setNewPieceColor] = useState(getRandomColor());

    const handleMove = () => {
        const parsedPoints = Number(pointsInput);
        if (!isNaN(parsedPoints)) {
            onMove(selectedPieceId, parsedPoints);
        }
    };

    const handleAddPiece = () => {
        if (newPieceName.trim()) {
            onAddPiece(newPieceName.trim(), newPieceColor);
            setNewPieceName('');
            setNewPieceColor(getRandomColor()); // 🎯 generate a new random color for the next one!
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-lg font-semibold mb-2">Bábu mozgatása</h2>
                <h3 className="text-md font-semibold mb-2">Melyik bábut?</h3>
                <select
                    className="border p-2 w-full mb-2"
                    value={selectedPieceId}
                    onChange={(e) => setSelectedPieceId(Number(e.target.value))}
                >
                    {pieces.map((piece) => (
                        <option key={piece.id} value={piece.id}>
                            {piece.name}
                        </option>
                    ))}
                </select>
                <h3 className="text-md font-semibold mb-2">Mennyivel?</h3>
                <input
                    type="number"
                    className="border p-2 w-full mb-2"
                    placeholder="Points to move"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                />
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded w-full"
                    onClick={handleMove}
                >
                    Mozgat
                </button>
            </div>

            <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-2">Új csapat hozzáadása</h2>
                <input
                    type="text"
                    className="border p-2 w-full mb-2"
                    placeholder="Csapatnév"
                    value={newPieceName}
                    onChange={(e) => setNewPieceName(e.target.value)}
                />
                <input
                    type="color"
                    className="border p-1 w-full mb-2"
                    value={newPieceColor}
                    onChange={(e) => setNewPieceColor(e.target.value)}
                />
                <button
                    className="bg-green-500 hover:bg-green-600 text-white py-2 rounded w-full"
                    onClick={handleAddPiece}
                >Hozzáad</button>
            </div>
        </div>
    );
}

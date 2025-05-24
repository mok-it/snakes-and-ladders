import {useRef, useState} from 'react';
import {FaChevronDown, FaChevronUp, FaDice, FaPlus} from 'react-icons/fa';

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
    onAddStars: (tiles: number[]) => void;
    onReplaceStars: (tiles: number[]) => void;
    starTiles: number[];
    onRemoveStar: (tile: number) => void;
    onClearAllStars: () => void;
    onResetTeams: () => void;
};

export function GameMasterControls({
                                       pieces,
                                       onMove,
                                       onAddPiece,
                                       onAddStars,
                                       onReplaceStars,
                                       starTiles,
                                       onRemoveStar,
                                       onClearAllStars,
                                       onResetTeams
                                   }: GameMasterControlsProps) {
    const [selectedPieceId, setSelectedPieceId] = useState<number>(pieces[0]?.id ?? 1);
    const [pointsInput, setPointsInput] = useState<string>("1");
    const [newPieceName, setNewPieceName] = useState('');
    const [newPieceColor, setNewPieceColor] = useState(getRandomColor());
    const [showStarAdder, setShowStarAdder] = useState(false);
    const [newStar, setNewStar] = useState<number | ''>('');

    const teamNameInputRef = useRef<HTMLInputElement>(null);

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
            setNewPieceColor(getRandomColor());

            teamNameInputRef.current?.focus();
        }
    };

    const randomGenerateStars = () => {
        const stars: number[] = [];

        while (stars.length < 10) {
            const randomTile = Math.floor(Math.random() * 99) + 2;
            if (!stars.includes(randomTile)) {
                stars.push(randomTile);
            }
        }

        onReplaceStars(stars);
    };
    return (
        <div className="flex flex-col gap-6">
            <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Csillag hozzáadása</h2>
                    <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => setShowStarAdder((prev) => !prev)}
                    >
                        {showStarAdder ? <FaChevronUp/> : <FaChevronDown/>}
                    </button>
                </div>

                {showStarAdder && (
                    <>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                min={2}
                                max={99}
                                className="border p-2 w-full"
                                placeholder="Mező sorszáma (2–99)"
                                value={newStar}
                                onChange={(e) => setNewStar(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                            <button
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 rounded py-3"
                                onClick={() => {
                                    if (typeof newStar === 'number' && newStar >= 2 && newStar <= 99) {
                                        onAddStars([newStar]);
                                        setNewStar('');
                                    }
                                }}
                            >
                                <FaPlus/>
                            </button>
                            <button
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded py-3"
                                onClick={randomGenerateStars}
                            >
                                <FaDice/>
                            </button>
                        </div>
                        {starTiles.length > 0 ? (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {starTiles.map((tile) => (
                                            <div
                                                key={tile}
                                                className="flex items-center gap-1 border px-2 py-1 rounded bg-yellow-100 text-sm"
                                            >
                                                <span>{tile}</span>
                                                <button
                                                    onClick={() => onRemoveStar(tile)}
                                                    className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) :
                            <p className='text-sm mt-2'>Még nem adtál hozzá egyetlen csillagot sem.</p>}
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white py-2 rounded w-full mt-2 disabled:bg-red-300"
                            onClick={onClearAllStars}
                            disabled={starTiles.length == 0}
                        >Összes csillag törlése
                        </button>
                    </>
                )}
            </div>

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
                    ref={teamNameInputRef}
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
                >Hozzáad
                </button>
                <button
                    className="bg-red-500 hover:bg-red-600 text-white py-2 mt-2 rounded w-full"
                    onClick={onResetTeams}
                >Összes csapat és bábu törlése
                </button>
            </div>
        </div>
    )
        ;
}

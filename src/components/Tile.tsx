import {Piece} from "../App.tsx";

type TileProps = {
    number: number;
    pieces: Piece[];
    onDropPiece?: (pieceId: number, targetTile: number) => void;
    isStar?: boolean;
};

export function Tile({ number, pieces, onDropPiece, isStar }: TileProps) {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pieceId = Number(e.dataTransfer.getData('text/plain'));
        if (onDropPiece) {
            onDropPiece(pieceId, number);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    if(isStar)
    console.log("ima star on this field: ", number);
    return (
        <div
            className="relative flex items-center justify-center overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {isStar && (
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="green"
                        className="w-12 h-12 opacity-60"
                    >
                        <path d="M12 2l2.39 7.26H22l-5.92 4.3 2.39 7.26L12 16.9l-6.47 4.92 2.39-7.26L2 9.26h7.61z" />
                    </svg>
                </div>
            )}

            {pieces.map((piece, index) => {
                const offset = 8;
                const angle = (index / pieces.length) * 2 * Math.PI;
                const offsetX = Math.cos(angle) * offset;
                const offsetY = Math.sin(angle) * offset;

                return (
                    <div
                        key={piece.id}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', piece.id.toString());
                        }}
                        className="absolute w-12 h-12 cursor-grab active:scale-110 transition-transform z-10" // ⬅️ pieces are now z-10
                        style={{
                            top: `calc(50% + ${offsetY}px)`,
                            left: `calc(50% + ${offsetX}px)`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-full h-full drop-shadow-md"
                        >
                            <path
                                d="M12 2a3 3 0 0 0-3 3c0 1.24.75 2.28 1.8 2.7a5 5 0 0 0-3.8 4.8V16h10v-3.5a5 5 0 0 0-3.8-4.8A3 3 0 0 0 15 5a3 3 0 0 0-3-3z"
                                fill={piece.color}
                                stroke="black"
                                strokeWidth="1"
                            />
                        </svg>
                    </div>
                );
            })}
        </div>
    );
}

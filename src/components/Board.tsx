import type { Piece } from "../App.tsx";
import { Tile } from "./Tile";

type BoardProps = {
	pieces: Piece[];
	selectedPieceId: number;
	starTiles: number[];
};

export function Board({ pieces, selectedPieceId, starTiles }: BoardProps) {
	const tiles = [];

	for (let row = 9; row >= 0; row--) {
		const rowTiles = [];
		for (let col = 0; col < 10; col++) {
			const tileNumber = row * 10 + col + 1;
			rowTiles.push(tileNumber);
		}
		// Reverse every other row
		if (row % 2 === 1) {
			rowTiles.reverse();
		}
		tiles.push(...rowTiles);
	}

	const movePieceDirectly = (pieceId: number, targetTile: number) => {
		const event = new CustomEvent("pieceMove", {
			detail: { pieceId, targetTile },
		});
		window.dispatchEvent(event);
	};

	return (
		<div
			className="relative w-[min(90vh,90vw)] h-[min(90vh,90vw)] grid grid-cols-10 grid-rows-10 bg-white border-4 border-black"
			style={{
				backgroundImage: "url(/assets/board2.png)",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			{tiles.map((number) => (
				<Tile
					key={number}
					number={number}
					pieces={pieces.filter((p) => p.position === number)}
					selectedPieceId={selectedPieceId}
					onDropPiece={movePieceDirectly}
					isStar={starTiles.includes(number)}
				/>
			))}
		</div>
	);
}

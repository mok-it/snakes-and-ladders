/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: explanation */

import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { Board } from "./components/Board";
import { GameMasterControls } from "./components/GameMasterControls";
import { ladders, snakes } from "./data/snakesAndLadders.ts";

export type Piece = {
	id: number;
	name: string;
	position: number;
	color: string;
};

type Move = { pieceId: number; position: number };

export default function App() {
	const [pieces, setPieces] = useLocalStorage<Piece[]>("pieces", []);

	const [selectedPieceId, setSelectedPieceId] = useState<number>(-1);

	const [recentMoves, setRecentMoves] = useState<Move[]>([]);

	const handleMovePiece = (id: number, points: number) => {
		setPieces((prev) =>
			prev.map((piece) => {
				if (piece.id !== id) return piece;

				const oldPosition = piece.position;
				let newPosition = oldPosition + points;
				if (newPosition > 100) newPosition = 100;
				if (newPosition < 1) newPosition = 1;

				// Check if passed over any star fields in case of regular movement (ie not dnd)
				const range =
					points > 0
						? Array.from(
								{ length: newPosition - oldPosition + 1 },
								(_, i) => oldPosition + i,
							)
						: Array.from(
								{ length: oldPosition - newPosition + 1 },
								(_, i) => oldPosition - i,
							);

				for (const pos of range) {
					if (starTiles.includes(pos)) {
						console.log(`⭐ ${piece.name} passed or landed on star at ${pos}`);
						break;
					}
				}

				newPosition = applySnakesAndLadders(newPosition);

				setRecentMoves((prev) => [
					...prev,
					{ pieceId: id, position: piece.position },
				]);

				return { ...piece, position: newPosition };
			}),
		);
	};

	const handleAddPiece = (name: string, color: string) => {
		const newId = Math.max(0, ...pieces.map((p) => p.id)) + 1;
		setPieces((prev) => [...prev, { id: newId, name, position: 1, color }]);
	};

	const handleEditPiece = (id: number, name: string, color: string) => {
		const editedPiece = pieces.find((p) => p.id === id);
		if (editedPiece) {
			const newPieces = pieces.map((p) =>
				p.id === id ? { ...p, name, color } : p,
			);
			setPieces(newPieces);
		} else {
			console.error("Piece not found");
		}
	};

	const handleRemovePiece = (id: number) => {
		setPieces((prev) => prev.filter((p) => p.id !== id));
	};

	const [starTiles, setStarTiles] = useLocalStorage<number[]>("starTiles", []);

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

					setRecentMoves((prev) => [
						...prev,
						{ pieceId, position: piece.position },
					]);

					return { ...piece, position: finalTile };
				}),
			);
		};

		window.addEventListener("pieceMove", handler);
		return () => window.removeEventListener("pieceMove", handler);
	}, [starTiles, setPieces]);

	const handleAddStars = (tiles: number[]) => {
		setStarTiles([...starTiles, ...tiles].sort((a, b) => a - b));
	};
	const handleReplaceStars = (tiles: number[]) =>
		setStarTiles(tiles.sort((a, b) => a - b));

	const handleClearAllStars = () => setStarTiles([]);

	const handleResetTeams = () => {
		const confirmed = window.confirm(
			"Biztos, hogy véglegesen törlöd az összes csapatot?",
		);
		if (confirmed) {
			setPieces([]);
			setRecentMoves([]);
			setSelectedPieceId(-1);
		}
	};

	const handleUndoLastMove = () => {
		const lastMove = recentMoves.pop();

		console.log({ recentMoves });
		if (lastMove) {
			const { pieceId, position } = lastMove;
			setPieces((prev) =>
				prev.map((piece) => {
					if (piece.id !== pieceId) return piece;
					return { ...piece, position: position };
				}),
			);
		}
	};

	return (
		<div className="flex flex-col md:flex-row h-screen">
			<div className="flex-grow flex items-center justify-center bg-gray-100 p-2">
				<Board
					pieces={pieces}
					starTiles={starTiles}
					selectedPieceId={selectedPieceId}
				/>
			</div>
			<div className="w-full md:max-w-80 border-l border-gray-300 p-2 bg-white">
				<GameMasterControls
					pieces={pieces}
					isUndoDisabled={recentMoves.length === 0}
					onMove={handleMovePiece}
					onAddPiece={handleAddPiece}
					onEditPiece={handleEditPiece}
					onRemovePiece={handleRemovePiece}
					onSelectPiece={(id) => setSelectedPieceId(id)}
					onAddStars={handleAddStars}
					onReplaceStars={handleReplaceStars}
					starTiles={starTiles}
					onRemoveStar={(tile) =>
						setStarTiles(starTiles.filter((t) => t !== tile))
					}
					onClearAllStars={handleClearAllStars}
					onResetTeams={handleResetTeams}
					onUndoLastMove={handleUndoLastMove}
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

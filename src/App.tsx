/** biome-ignore-all lint/suspicious/noExplicitAny: explanation */

import { useLocalStorage } from "@uidotdev/usehooks";
import { useRef, useState } from "react";
import {
	FaCheck,
	FaChevronDown,
	FaChevronUp,
	FaDice,
	FaPen,
	FaPlus,
	FaTrash,
} from "react-icons/fa";
import { FaArrowRotateLeft } from "react-icons/fa6";
import Select from "react-select";
import { Board } from "./components/Board";
import { ladders, snakes } from "./data/snakesAndLadders.ts";

function getRandomColor() {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

export type Piece = {
	id: number;
	name: string;
	position: number;
	color: string;
};

type Move = { pieceId: number; position: number };

export default function App() {
	const [pieces, setPieces] = useLocalStorage<Piece[]>("pieces", []);

	const [selectedPieceId, setSelectedPieceId] = useState<number>(
		pieces[0]?.id ?? -1,
	);

	const [recentMoves, setRecentMoves] = useState<Move[]>([]);

	const onMovePiece = (id: number, points: number) => {
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

	const onAddPiece = (name: string, color: string) => {
		const newId = Math.max(0, ...pieces.map((p) => p.id)) + 1;
		setPieces((prev) => [...prev, { id: newId, name, position: 1, color }]);
	};

	const onEditPiece = (id: number, name: string, color: string) => {
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

	const onRemovePiece = (id: number) => {
		setPieces((prev) => prev.filter((p) => p.id !== id));
	};

	const [starTiles, setStarTiles] = useLocalStorage<number[]>("starTiles", []);

	const onPieceDndEnd = (pieceId: number, targetTile: number) => {
		setPieces((prev) =>
			prev.map((piece) => {
				if (piece.id !== pieceId) return piece;

				if (starTiles.includes(targetTile)) {
					//todo the app is currently not detecting the passing of a star if the move happened via drag-and-drop
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

	const onAddStars = (tiles: number[]) => {
		setStarTiles([...starTiles, ...tiles].sort((a, b) => a - b));
	};
	const onReplaceStars = (tiles: number[]) =>
		setStarTiles(tiles.sort((a, b) => a - b));

	const onClearAllStars = () => setStarTiles([]);

	const onResetTeams = () => {
		const confirmed = window.confirm(
			"Biztos, hogy véglegesen törlöd az összes csapatot?",
		);
		if (confirmed) {
			setPieces([]);
			setRecentMoves([]);
			setSelectedPieceId(-1);
		}
	};

	const onUndoLastMove = () => {
		const lastMove = recentMoves.pop();

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

	const [isEditingTeam, setIsEditingTeam] = useState(false);
	const [pointsInput, setPointsInput] = useState<string>("1");
	const [editedPiece, setEditedPiece] = useState<Piece>({
		id: 0,
		name: "",
		position: 1,
		color: getRandomColor(),
	});

	//sections
	const [showStarAdder, setShowStarAdder] = useState(false);
	const [showTeamManager, setShowTeamManager] = useState(true);

	const [newStar, setNewStar] = useState<number | "">("");

	const teamNameInputRef = useRef<HTMLInputElement>(null);

	const handleMove = () => {
		const parsedPoints = Number(pointsInput);
		if (!Number.isNaN(parsedPoints)) {
			onMovePiece(selectedPieceId, parsedPoints);
		}
	};

	const handleAddPiece = () => {
		if (editedPiece.name.trim()) {
			onAddPiece(editedPiece.name.trim(), editedPiece.color);

			teamNameInputRef.current?.focus();
			setEditedPiece({ id: 0, name: "", position: 0, color: getRandomColor() });
		}
	};

	const handleEditPiece = () => {
		if (editedPiece.name.trim()) {
			setIsEditingTeam(false);

			onEditPiece(editedPiece.id, editedPiece.name.trim(), editedPiece.color);
			setEditedPiece({ id: 0, name: "", position: 0, color: getRandomColor() });
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

	type PieceOption = {
		value: number;
		label: string;
		name: string;
		color: string;
		position: number;
	};

	const OptionContent = (option: PieceOption) => (
		<div className="flex items-center gap-2 min-w-0">
			<span
				className="inline-block h-3 w-3 rounded-full border"
				style={{ backgroundColor: option.color }}
			/>
			<span className="truncate">
				{option.name}
				<span className="text-xs text-gray-500 ml-2">
					(mező: {option.position})
				</span>
			</span>
		</div>
	);

	const pieceOptions: PieceOption[] = pieces.map((p) => ({
		value: p.id,
		label: p.name,
		name: p.name,
		color: p.color,
		position: p.position,
	}));

	return (
		<div className="flex flex-col md:flex-row h-screen">
			<div className="flex-grow flex items-center justify-center bg-gray-100 p-2">
				<Board
					pieces={pieces}
					starTiles={starTiles}
					selectedPieceId={selectedPieceId}
					onPieceMove={onPieceDndEnd}
				/>
			</div>
			<div className="w-full md:max-w-80 border-l border-gray-300 p-2 bg-white">
				<div className="flex flex-col gap-2 w-full">
					{/*Movement*/}
					<div className="bg-blue-200 shadow-md rounded p-2">
						<div className="flex items-center justify-between mb-2">
							<h2 className="text-lg font-semibold mb-2">Mozgás</h2>
							<button
								onClick={onUndoLastMove}
								disabled={recentMoves.length === 0}
								className="rounded-2xl p-2 bg-blue-500 hover:bg-blue-600 disabled:hover:bg-gray-400 disabled:bg-gray-400 text-white transition-colors duration-300"
							>
								<FaArrowRotateLeft />
							</button>
						</div>
						<h3 className="text-md font-semibold mb-2">Melyik csapatot?</h3>
						<Select<PieceOption>
							options={pieceOptions}
							formatOptionLabel={(opt) => OptionContent(opt)}
							className="w-full mb-2"
							value={
								pieceOptions.find((o) => o.value === selectedPieceId) ?? null
							}
							onChange={(opt) => {
								if (opt?.value) {
									setSelectedPieceId(opt.value);
								}
							}}
							placeholder="Válassz csapatot"
						/>
						<h3 className="text-md font-semibold mb-2">Mennyivel?</h3>
						<input
							type="number"
							className="p-2 w-full mb-2 bg-white"
							placeholder="Hány mezőt lépjen?"
							value={pointsInput}
							onChange={(e) => setPointsInput(e.target.value)}
						/>
						<button
							className="bg-blue-500 hover:bg-blue-600 disabled:hover:bg-gray-400 disabled:bg-gray-400 text-white py-2 rounded w-full"
							disabled={pieces.length === 0 || Number(pointsInput) === 0}
							onClick={handleMove}
						>
							Mozgat
						</button>
					</div>

					{/*Manage teams*/}
					<div className="pt-6">
						<div className="flex items-center justify-between mb-2">
							<h2 className="text-lg font-semibold mb-2">Csapatok</h2>
							<button
								type="button"
								className="text-sm text-blue-600 hover:underline"
								onClick={() => setShowTeamManager((prev) => !prev)}
							>
								{showTeamManager ? <FaChevronUp /> : <FaChevronDown />}
							</button>
						</div>

						{showTeamManager && (
							<>
								<div className="flex flex-row mb-2 gap-1 h-12">
									<input
										ref={teamNameInputRef}
										type="text"
										className="border w-full py-2"
										placeholder="Csapatnév"
										value={editedPiece.name}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleAddPiece();
											}
										}}
										onChange={(e) =>
											setEditedPiece({ ...editedPiece, name: e.target.value })
										}
									/>
									<input
										type="color"
										className="border h-12 rounded"
										value={editedPiece.color}
										onChange={(e) =>
											setEditedPiece({ ...editedPiece, color: e.target.value })
										}
									/>
									<button
										type="button"
										className="bg-green-500 hover:bg-green-600
								disabled:bg-green-300 disabled:hover:bg-green-300
								text-white rounded h-12 w-12 flex items-center justify-center"
										disabled={!editedPiece.name}
										onClick={isEditingTeam ? handleEditPiece : handleAddPiece}
									>
										{isEditingTeam ? (
											<FaCheck className="h-6" />
										) : (
											<FaPlus className="h-6" />
										)}
									</button>
								</div>
								<div className="border rounded max-h-48 overflow-y-auto divide-y">
									{pieces.map((piece) => (
										<div
											key={piece.id}
											className="flex items-center justify-between gap-2 px-2 py-2"
										>
											<div className="flex items-center gap-2 min-w-0">
												<span
													className="inline-block h-3 w-3 rounded-full border"
													style={{ backgroundColor: piece.color }}
												/>
												<span className="truncate">
													{piece.name}
													<span className="text-xs text-gray-500 ml-2">
														(mező: {piece.position})
													</span>
												</span>
											</div>
											<div className="flex items-center gap-2 shrink-0 pr-2">
												<button
													type="button"
													className="text-gray-500 hover:text-blue-600"
													title="Szerkesztés"
													onClick={() => {
														setIsEditingTeam(true);
														setEditedPiece(piece);
													}}
												>
													<FaPen />
												</button>
												<button
													type="button"
													className="text-gray-500 hover:text-red-600"
													title="Törlés"
													onClick={() => {
														if (
															window.confirm(
																`Biztos, hogy véglegesen törlöd a(z) ${piece.name} nevű csapatot?`,
															)
														) {
															onRemovePiece(piece.id);
														}
													}}
												>
													<FaTrash />
												</button>
											</div>
										</div>
									))}
								</div>
								<button
									type="button"
									className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:hover:bg-red-300 py-2 my-2 rounded w-full text-white"
									disabled={pieces.length === 0}
									onClick={onResetTeams}
								>
									Összes csapat és bábu törlése
								</button>
							</>
						)}
					</div>

					{/*Add stars*/}
					<div className="pb-4">
						<div className="flex items-center justify-between mb-2">
							<h2 className="text-lg font-semibold">Csillag hozzáadása</h2>
							<button
								type="button"
								className="text-sm text-blue-600 hover:underline"
								onClick={() => setShowStarAdder((prev) => !prev)}
							>
								{showStarAdder ? <FaChevronUp /> : <FaChevronDown />}
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
										onChange={(e) =>
											setNewStar(
												e.target.value === "" ? "" : Number(e.target.value),
											)
										}
									/>
									<button
										className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 rounded py-3"
										onClick={() => {
											if (
												typeof newStar === "number" &&
												newStar >= 2 &&
												newStar <= 99
											) {
												onAddStars([newStar]);
												setNewStar("");
											}
										}}
									>
										<FaPlus />
									</button>
									{/** biome-ignore : <explanation> */}
									<button
										className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded py-3"
										onClick={randomGenerateStars}
									>
										<FaDice />
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
														onClick={() =>
															setStarTiles(starTiles.filter((t) => t !== tile))
														}
														className="text-red-500 hover:text-red-700 font-bold"
													>
														×
													</button>
												</div>
											))}
										</div>
									</div>
								) : (
									<p className="text-sm mt-2">
										Még nem adtál hozzá egyetlen csillagot sem.
									</p>
								)}
								<button
									className="bg-red-500 hover:bg-red-600 text-white py-2 rounded w-full mt-2 disabled:bg-red-300"
									onClick={onClearAllStars}
									disabled={starTiles.length === 0}
								>
									Összes csillag törlése
								</button>
							</>
						)}
					</div>
				</div>
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

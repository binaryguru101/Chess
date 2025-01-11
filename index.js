let legalmoves = [];
const Board_Coordinates = document.getElementsByClassName('square');
const pieces = document.getElementsByClassName('piece');
const peiceimg = document.getElementsByTagName('img');

let currentWhitesMove = true;

Draw_All_Squares();
SetupBoard();

function Draw_All_Squares() {
    for (let i = 0; i < Board_Coordinates.length; i++) {
        Board_Coordinates[i].addEventListener("dragover", allowDrop);
        Board_Coordinates[i].addEventListener("drop", drop);

        let row = 8 - Math.floor(i / 8);
        let col = String.fromCharCode(97 + (i % 8));
        let square = Board_Coordinates[i];
        square.id = col + row;
    }
}

function SetupBoard() {
    for (let i = 0; i < pieces.length; i++) {
        pieces[i].addEventListener("dragstart", drag);
        pieces[i].setAttribute("draggable", true);
        pieces[i].id = pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
    }

    for (let i = 0; i < peiceimg.length; i++) {
        peiceimg[i].setAttribute("draggable", false);
    }
}

function allowDrop(e) {
    e.preventDefault();
}

function getPossibleMoves(startingSquareID, currentPiece) {
    const pieceColor = currentPiece.getAttribute("color");

    if (currentPiece.classList.contains("pawn")) {
        getPawnMoves(startingSquareID, pieceColor);
    }
    if(currentPiece.classList.contains("knight")) {
        getKnightMoves(startingSquareID, pieceColor);
    }
    if(currentPiece.classList.contains("bishop")) {
        getBishopMoves(startingSquareID, pieceColor);
    }
    if(currentPiece.classList.contains("rook")) {
        getRookMoves(startingSquareID, pieceColor);
    }
    if(currentPiece.classList.contains("queen")) {
        getQueenMoves(startingSquareID, pieceColor);
        console.log("ITS THE QUEEN")
    }
    if(currentPiece.classList.contains("king")) {
        getKingMoves(startingSquareID, pieceColor);
    }
}

function getPawnMoves(startingSquareID, pieceColor) {
    const curr_file = startingSquareID.charAt(0);
    const curr_rank = parseInt(startingSquareID.charAt(1));

    const direction = pieceColor === "white" ? 1 : -1;

    // Forward move
    const nextRank = curr_rank + direction;
    const nextSquareID = curr_file + nextRank;
    if (isSquareEmpty(nextSquareID)) {
        legalmoves.push(nextSquareID);

        // Double move from initial position
        if ((curr_rank === 2 && pieceColor === "white") || (curr_rank === 7 && pieceColor === "black")) {
            const doubleMoveRank = curr_rank + 2 * direction;
            const doubleMoveSquareID = curr_file + doubleMoveRank;
            if (isSquareEmpty(doubleMoveSquareID)) {
                legalmoves.push(doubleMoveSquareID);
            }
        }
    }

    // Diagonal captures
    for (let j = -1; j <= 1; j += 2) {
        const diagonalFile = String.fromCharCode(curr_file.charCodeAt(0) + j);
        const diagonalSquareID = diagonalFile + nextRank;

        if (isValidSquare(diagonalSquareID)) {
            const occupyingPiece = Occupied(document.getElementById(diagonalSquareID));
            if (occupyingPiece !== "Empty" && occupyingPiece !== pieceColor) {
                legalmoves.push(diagonalSquareID);
            }
        }
    }
}
function getKnightMoves(startingSquareID, pieceColor) {
    const curr_file = startingSquareID.charAt(0).charCodeAt(0) - 97; // Convert letter to index (a = 0, b = 1, ...)
    const curr_rank = parseInt(startingSquareID.charAt(1));  // Rank (1-8)

    const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1], // Vertical + Horizontal moves
        [1, 2], [1, -2], [-1, 2], [-1, -2]  // Horizontal + Vertical moves
    ];

    // Loop through all possible knight moves
    knightMoves.forEach(move => {
        const newFile = curr_file + move[0];  // Calculate new file
        const newRank = curr_rank + move[1];  // Calculate new rank

        // Check if the new position is within the board's bounds
        if (newFile >= 0 && newFile <= 7 && newRank >= 1 && newRank <= 8) {
            const newSquareID = String.fromCharCode(newFile + 97) + newRank;  // Get the new square ID (e.g., 'd4')
            const newSquare = document.getElementById(newSquareID);  // Get the square element
            const squareStatus = Occupied(newSquare);  // Check if the square is occupied

            // If the square is empty or occupied by an opponent's piece, add the move
            if (squareStatus === "Empty" || squareStatus !== pieceColor) {
                legalmoves.push(newSquareID);  // Add valid move to legal moves
            }
        }
    });
}

function getBishopMoves(startingSquareID, pieceColor) {
    const curr_file = startingSquareID.charAt(0).charCodeAt(0) - 97;
    const curr_rank = parseInt(startingSquareID.charAt(1));

    const directions=[
        [-1,1],[1,1],[1,-1],[-1,-1]
    ]

    directions.forEach(direction => {
        let file = curr_file;
        let rank=curr_rank;

        while(true){
            file+=direction[0];
            rank+=direction[1];

            if(file<0 || file>7 || rank<1 || rank>8){
                break;
            }
            const currentSquareID=String.fromCharCode(file+97)+rank;
            const currentSquare=document.getElementById(currentSquareID);
            const currentStatus=Occupied(currentSquare);

            if(currentStatus==="Empty" || currentStatus!==pieceColor){
                legalmoves.push(currentSquareID);
                if(currentStatus!=="Empty"){
                    break;
                }
            }else{
                break;
            }
        }
    })
}

function getRookMoves(startingSquareID, pieceColor) {
    const curr_file = startingSquareID.charAt(0).charCodeAt(0) - 97;
    const curr_rank = parseInt(startingSquareID.charAt(1));

    const directions=[
       [0,1],[0,-1],[1,0],[-1,0]
    ]

    directions.forEach(direction => {
        let file = curr_file;
        let rank=curr_rank;

        while(true){
            file+=direction[0];
            rank+=direction[1];

            if(file<0 || file>7 || rank<0 || rank>8){
                break;
            }
            const currentSquareID=String.fromCharCode(file+97)+rank;
            const currentSquare=document.getElementById(currentSquareID);
            const currentStatus=Occupied(currentSquare);

            if(currentStatus==="Empty" || currentStatus!==pieceColor){
                legalmoves.push(currentSquareID);
                if(currentStatus!=="Empty"){
                    break;
                }
            }else{
                break;
            }
        }
    })
}

function getQueenMoves(startingSquareID, pieceColor) {
    const curr_file = startingSquareID.charAt(0).charCodeAt(0) - 97;
    const curr_rank = parseInt(startingSquareID.charAt(1));

    const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],  // Horizontal & Vertical
        [1, 1], [1, -1], [-1, -1], [-1, 1]  // Diagonals
    ];

    directions.forEach(direction => {
        let file = curr_file;
        let rank = curr_rank;

        while (true) {
            file += direction[0];
            rank += direction[1];

            // Check if the square is within bounds (0-7 for file, 1-8 for rank)
            if (file < 0 || file > 7 || rank < 1 || rank > 8) {
                break;
            }

            const currentSquareID = String.fromCharCode(file + 97) + rank;
            const currentSquare = document.getElementById(currentSquareID);

            // Log the moves being calculated for the queen
            console.log("Checking", currentSquareID);

            // Skip if currentSquare is null (which should not happen if IDs are correct)
            if (!currentSquare) {
                break;
            }

            const currentStatus = Occupied(currentSquare);

            if (currentStatus === "Empty" || currentStatus !== pieceColor) {
                legalmoves.push(currentSquareID);
                if (currentStatus !== "Empty") {
                    break;
                }
            } else {
                break;
            }
        }
    });

    console.log("Legal Moves:", legalmoves);  // Log legal moves for white queen
}

function getKingMoves(startingSquareID, pieceColor) {
    const curr_file = startingSquareID.charAt(0).charCodeAt(0) - 97;
    const curr_rank = parseInt(startingSquareID.charAt(1));

    const directions=[
        [1,0],[-1,0],
        [0,1],[0,-1],
        [1,1],[1,-1],
        [-1,1],[-1,-1]
    ]

    directions.forEach(direction => {
        let file = curr_file;
        let rank=curr_rank;

        while(true){
            file+=direction[0];
            rank+=direction[1];

            if(file<0 || file>7 || rank<1 || rank>8){
                break;
            }
            const currentSquareID=String.fromCharCode(file+97)+rank;
            const currentSquare=document.getElementById(currentSquareID);
            const currentStatus=Occupied(currentSquare);

            if(currentStatus==="Empty" || currentStatus!==pieceColor){
                legalmoves.push(currentSquareID);
                if(currentStatus!=="Empty"){
                    break;
                }
            }else{
                break;
            }
        }
    })
}


// function getQueenMoves(startingSquareID, pieceColor) {
//     const curr_file = startingSquareID.charAt(0).charCodeAt(0) - 97;
//     const curr_rank = parseInt(startingSquareID.charAt(1));
//
//     const directions=[
//         [0,1],[0,-1],[1,0],[-1,0],
//         [1,1],[1,-1],[-1,-1],[-1,1]
//     ]
//
//     directions.forEach(direction => {
//         let file = curr_file;
//         let rank=curr_rank;
//
//         while(true){
//             file+=direction[0];
//             rank+=direction[1];
//
//             if(file<0 || file>7 || rank<0 || rank>8){
//                 break;
//             }
//             const currentSquareID=String.fromCharCode(file+97)+rank;
//             const currentSquare=document.getElementById(currentSquareID);
//             const currentStatus=Occupied(currentSquare);
//
//             if(currentStatus==="Empty" || currentStatus!==pieceColor){
//                 legalmoves.push(currentSquareID);
//                 if(currentStatus!=="Empty"){
//                     break;
//                 }
//             }else{
//                 break;
//             }
//         }
//     })
// }



function drag(e) {
    const currentPiece = e.target;
    const pieceColor = currentPiece.getAttribute("color");

    if ((currentWhitesMove && pieceColor === "white") || (!currentWhitesMove && pieceColor === "black")) {
        e.dataTransfer.setData("text", currentPiece.id);
        const startingSquareID = currentPiece.parentNode.id;
        getPossibleMoves(startingSquareID, currentPiece);
    }
}

function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    const currentPiece = document.getElementById(data);
    const DestinationSquare = e.currentTarget;
    const DestinationSquareID = DestinationSquare.id;

    if (legalmoves.includes(DestinationSquareID)) {
        while (DestinationSquare.firstChild) {
            DestinationSquare.removeChild(DestinationSquare.firstChild);
        }
        DestinationSquare.appendChild(currentPiece);
        currentWhitesMove = !currentWhitesMove;
        legalmoves.length = 0;
    }
}

function Occupied(Square) {
    if (Square.querySelector(".piece")) {
        return Square.querySelector(".piece").getAttribute("color");
    } else {
        return "Empty";
    }
}

function isSquareEmpty(squareID) {
    const square = document.getElementById(squareID);
    return square && !square.querySelector(".piece");
}

function isValidSquare(squareID) {
    return squareID.length === 2 && squareID.charAt(0) >= "a" && squareID.charAt(0) <= "h" && squareID.charAt(1) >= "1" && squareID.charAt(1) <= "8";
}

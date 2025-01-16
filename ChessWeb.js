let Current_Board_Array=[]
let isWhitesTurn=true;
let White_King_Position="e1";
let Black_King_Poisition="e8";

let hasWhiteKingMoved = false;
let hasBlackKingMoved = false;
let hasWhiteKingsideRookMoved = false;
let hasWhiteQueensideRookMoved = false;
let hasBlackKingsideRookMoved = false;
let hasBlackQueensideRookMoved = false;


const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");


function Load_Board(){
    const boardSquares = document.getElementsByClassName("square");
    for (let i = 0; i < boardSquares.length; i++) {
        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i % 8));
        let square = boardSquares[i];
        square.id = column + row;
        let Piece_color = "";
        let Piece_Type = "";
        let Piece_Id="";
        if (square.querySelector(".piece")) {
            Piece_color = square.querySelector(".piece").getAttribute("color");
            Piece_Type = square.querySelector(".piece").classList[1];
            Piece_Id=square.querySelector(".piece").id;
        } else {
            Piece_color = "Empty";
            Piece_Type = "Empty";
            Piece_Id ="Empty";
        }
        let arrayElement = {
            squareId: square.id,
            pieceColor: Piece_color,
            pieceType: Piece_Type,
            pieceId:Piece_Id
        };
        Current_Board_Array.push(arrayElement);
    }
}


function Update_Board(Current_Square,Destination_Square,Current_Board_Array){
    let Curr_Square = Current_Board_Array.find(
        (element) => element.squareId === Current_Square
    );
    let Dest_Square = Current_Board_Array.find(
        (element) => element.squareId === Destination_Square
    );
    let Piece_Color = Curr_Square.pieceColor;
    let Piece_Type = Curr_Square.pieceType;
    let Piece_Id= Curr_Square.pieceId;

    Dest_Square.pieceColor = Piece_Color;
    Dest_Square.pieceType = Piece_Type;
    Dest_Square.pieceId=Piece_Id;

    Curr_Square.pieceColor = "Empty";
    Curr_Square.pieceType = "Empty";
    Curr_Square.pieceId = "Empty";

}

function Board_Clearance(array){
    let arrayCopy=array.map(element=>{
        return {...element}
    });
    return arrayCopy;
}

Set_Up_Board();
Set_Pieces();
Load_Board();

function Set_Up_Board(){
    for (let i = 0; i < boardSquares.length; i++) {
        boardSquares[i].addEventListener("dragover", After_Drop);
        boardSquares[i].addEventListener("drop", Curr_Drop);
        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i % 8));
        let square = boardSquares[i];
        square.id = column + row;
    }
}

function Set_Pieces(){
    for (let i = 0; i < pieces.length; i++) {
        pieces[i].addEventListener("dragstart", drag);
        pieces[i].setAttribute("draggable", true);
        pieces[i].id =
            pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
    }
    for (let i = 0; i < piecesImages.length; i++) {
        piecesImages[i].setAttribute("draggable", false);
    }
}

function After_Drop(event){
    event.preventDefault();
}

function drag(event){
    const piece = event.target;
    const pieceColor = piece.getAttribute("color");
    const pieceType = piece.classList[1];
    const pieceId=piece.id;
    if (
        (isWhitesTurn&& pieceColor === "white") ||
        (!isWhitesTurn&& pieceColor === "black")
    ) {
        const startingSquareId = piece.parentNode.id;
        event.dataTransfer.setData("text", piece.id+"|"+startingSquareId);
        const pieceObject={pieceColor:pieceColor,pieceType:pieceType,pieceId:pieceId}
        let legalSquares= getPossibleMoves(startingSquareId, pieceObject,Current_Board_Array);
        let legalSquaresJson=JSON.stringify(legalSquares);
        event.dataTransfer.setData("application/json",legalSquaresJson );

    }
}

function Curr_Drop(event){
    event.preventDefault();
    console.log("Drop event triggered");  // Add this to check if the function is entered

    let data = event.dataTransfer.getData("text");
    let [pieceId, startingSquareId] = data.split("|");
    let legalSquaresJson = event.dataTransfer.getData("application/json");
    if (legalSquaresJson.length===0) return;
    let legalSquares = JSON.parse(legalSquaresJson);

    const piece = document.getElementById(pieceId);
    const pieceColor = piece.getAttribute("color");
    const pieceType = piece.classList[1];

    const destinationSquare = event.currentTarget;
    let   destinationSquareId = destinationSquare.id;

    legalSquares=isMoveValidAgainstCheck(legalSquares,startingSquareId,pieceColor,pieceType);



    if(pieceType==="king"){
        if(pieceColor==="white"){
            hasWhiteKingMoved=true;
        }else{
            hasBlackKingMoved=true;
        }
    }
    if(pieceType==="rook"){
        if(pieceColor==="white"){
            if(startingSquareId==="a1"){
                hasWhiteQueensideRookMoved=true;
            }else{
                hasWhiteKingMoved=true;
            }
        }else{
            if(pieceColor==="black"){
                if(startingSquareId==="a8"){
                    hasBlackQueensideRookMoved=true;
                }else{
                    hasBlackKingsideRookMoved=true;
                }
            }
        }
    }


    if (pieceType === "king") {
        let isCheck = isKingInCheck(
            destinationSquareId,
            pieceColor,
            Current_Board_Array
        );
        if (isCheck) return;
        isWhitesTurn  ? (White_King_Position=destinationSquareId) : (Black_King_Poisition=destinationSquareId);
    }
    console.log(CanCastle(startingSquareId,destinationSquareId,pieceColor));
    if(pieceType==="king" && CanCastle(startingSquareId,destinationSquareId,pieceColor)){
        performCastling(startingSquareId,destinationSquareId,pieceColor);
        isWhitesTurn=!isWhitesTurn;
        Update_Board(startingSquareId,destinationSquareId,Current_Board_Array);
        checkForCheckMate();
        return;
    }


    let squareContent=getPieceAtSquare(destinationSquareId,Current_Board_Array);
    console.log(`Moved ${pieceType} from ${startingSquareId} to ${destinationSquareId}`);
    let moveText=`Moved ${pieceType} from ${startingSquareId} to ${destinationSquareId}`;
    let moveElement = document.createElement("li");
    moveElement.textContent = moveText;
    document.getElementById("moveHistoryList").appendChild(moveElement);
    if (squareContent.pieceColor !== "Empty") {
        console.log(`${pieceType} at ${startingSquareId} captured ${squareContent.pieceType} at ${destinationSquareId}`);
    }
    if (
        squareContent.pieceColor === "Empty" &&
        legalSquares.includes(destinationSquareId)
    ) {
        destinationSquare.appendChild(piece);
        isWhitesTurn= !isWhitesTurn;
        Update_Board(
            startingSquareId,
            destinationSquareId,
            Current_Board_Array
        );
        checkForCheckMate();
        return;
    }
    if (
        squareContent.pieceColor!== "Empty" &&
        legalSquares.includes(destinationSquareId)
    ) {
        let children = destinationSquare.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].classList.contains('coordinate')) {
                destinationSquare.removeChild(children[i]);
            }
        }
        // while (destinationSquare.firstChild) {
        //   destinationSquare.removeChild(destinationSquare.firstChild);
        // }
        destinationSquare.appendChild(piece);
        isWhitesTurn= !isWhitesTurn;
        Update_Board(
            startingSquareId,
            destinationSquareId,
            Current_Board_Array
        );
        console.log("HELLLO");


        checkForCheckMate();

        return;
    }
}

function CanCastle(KingPosition,RookPosition,Color){
    if(Color==="white"){
        if(KingPosition==="e1" && RookPosition==="a1" && !hasWhiteKingMoved && !hasWhiteQueensideRookMoved){
            return isSquareEmpty("f1") && isSquareEmpty("g1");
        }
        if(KingPosition==="e1" && RookPosition==="h1" && !hasWhiteKingMoved && !hasWhiteKingsideRookMoved){
            return isSquareEmpty("b1")&&isSquareEmpty("c1")&&isSquareEmpty("d1");
        }
    } else if (Color==="black"){
        if(KingPosition==="e8" && RookPosition==="a8" && !hasWhiteKingMoved && !hasWhiteQueensideRookMoved){
            return isSquareEmpty("f8") && isSquareEmpty("g8");
        }
        if(KingPosition==="e8" && RookPosition==="h8" && !hasWhiteKingMoved && !hasWhiteKingsideRookMoved){
            return isSquareEmpty("b8")&&isSquareEmpty("c8")&&isSquareEmpty("d8");
        }
    }
    return false;
}

function performCastling(kingPosition, rookPosition, color) {
    if (canCastle(kingPosition, rookPosition, color)) {
        let kingSquare = document.getElementById(kingPosition);
        let rookSquare = document.getElementById(rookPosition);

        // Move the King to the appropriate square
        if (color === "white") {
            if (rookPosition === "h1") {
                movePiece("e1", "g1"); // Move King to g1
                movePiece("h1", "f1"); // Move Rook to f1
            } else if (rookPosition === "a1") {
                movePiece("e1", "c1"); // Move King to c1
                movePiece("a1", "d1"); // Move Rook to d1
            }
        } else {
            if (rookPosition === "h8") {
                movePiece("e8", "g8"); // Move King to g8
                movePiece("h8", "f8"); // Move Rook to f8
            } else if (rookPosition === "a8") {
                movePiece("e8", "c8"); // Move King to c8
                movePiece("a8", "d8"); // Move Rook to d8
            }
        }
    }
}

function movePiece(startingSquareId, destinationSquareId) {
    let piece = document.getElementById(startingSquareId).children[0];
    let destinationSquare = document.getElementById(destinationSquareId);

    destinationSquare.appendChild(piece);
    Update_Board(startingSquareId, destinationSquareId, Current_Board_Array);
}


function getPossibleMoves(startingSquareId, piece,Current_Board_Array) {
    const pieceColor = piece.pieceColor;
    const pieceType=piece.pieceType;
    let legalSquares=[];
    if (pieceType==="rook") {
        legalSquares=getRookMoves(startingSquareId, pieceColor,Current_Board_Array);
        return legalSquares;
    }
    if (pieceType==="bishop") {
        legalSquares=getBishopMoves(startingSquareId, pieceColor,Current_Board_Array);
        return legalSquares;
    }
    if (pieceType==="queen") {
        legalSquares=getQueenMoves(startingSquareId, pieceColor,Current_Board_Array);
        return legalSquares;
    }
    if (pieceType==="knight") {
        legalSquares=getKnightMoves(startingSquareId, pieceColor,Current_Board_Array);
        return legalSquares;
    }

    if (pieceType==="pawn") {
        legalSquares=getPawnMoves(startingSquareId, pieceColor,Current_Board_Array);
        return legalSquares;
    }
    if (pieceType==="king") {
        legalSquares=getKingMoves(startingSquareId, pieceColor,Current_Board_Array);
        return legalSquares;
    }


}
function getKnightMoves(startingSquareId, pieceColor, Current_Board_Array) {
    const file = startingSquareId.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
    const rank = parseInt(startingSquareId.charAt(1)); // Convert rank to a number
    let legalSquares = [];


    const moves = [
        [-2, 1], [-1, 2], [1, 2], [2, 1],
        [2, -1], [1, -2], [-1, -2], [-2, -1]
    ];


    moves.forEach(([fileChange, rankChange]) => {
        const newFile = file + fileChange;
        const newRank = rank + rankChange;

        if (newFile >= 0 && newFile <= 7 && newRank >= 1 && newRank <= 8) {
            const newSquareId = String.fromCharCode(newFile + 97) + newRank;
            const currentSquare = Current_Board_Array.find(
                element => element.squareId === newSquareId
            );

            if (!currentSquare) return;

            const squareContent = currentSquare.pieceColor;
            if (squareContent === "Empty" || squareContent !== pieceColor) {
                legalSquares.push(newSquareId);
            }
        }
    });

    return legalSquares;
}

function getPawnMoves(startingSquareId, pieceColor, Current_Board_Array) {
    const file = startingSquareId.charAt(0);
    const rank = parseInt(startingSquareId.charAt(1));
    const direction = pieceColor === "white" ? 1 : -1;
    let legalSquares = [];

    let forwardSquareId = file + (rank + direction);
    let forwardSquare = Current_Board_Array.find(square => square.squareId === forwardSquareId);
    if (forwardSquare && forwardSquare.pieceColor === "Empty") {
        legalSquares.push(forwardSquareId);

        if ((rank === 2 && pieceColor === "white") || (rank === 7 && pieceColor === "black")) {
            let doubleForwardSquareId = file + (rank + 2 * direction);
            let doubleForwardSquare = Current_Board_Array.find(square => square.squareId === doubleForwardSquareId);
            if (doubleForwardSquare && doubleForwardSquare.pieceColor === "Empty") {
                legalSquares.push(doubleForwardSquareId);
            }
        }
    }

    [-1, 1].forEach(offset => {
        let diagonalFile = String.fromCharCode(file.charCodeAt(0) + offset);
        let diagonalSquareId = diagonalFile + (rank + direction);
        let diagonalSquare = Current_Board_Array.find(square => square.squareId === diagonalSquareId);
        if (diagonalSquare && diagonalSquare.pieceColor !== "Empty" && diagonalSquare.pieceColor !== pieceColor) {
            legalSquares.push(diagonalSquareId);
        }
    });

    return legalSquares;
}

function getSlidingPieceMoves(startingSquareId, pieceColor, Current_Board_Array, directions) {
    const file = startingSquareId.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
    const rank = parseInt(startingSquareId.charAt(1)); // Convert rank to a number
    let legalSquares = [];

    directions.forEach(([fileChange, rankChange]) => {
        let currentFile = file;
        let currentRank = rank;

        while (true) {
            currentFile += fileChange;
            currentRank += rankChange;

            if (currentFile < 0 || currentFile > 7 || currentRank < 1 || currentRank > 8) break;

            const currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
            const currentSquare = Current_Board_Array.find(
                (element) => element.squareId === currentSquareId
            );

            if (!currentSquare) break;

            const squareContent = currentSquare.pieceColor;

            if (squareContent === "Empty") {
                legalSquares.push(currentSquareId);
            } else {

                if (squareContent !== pieceColor) {
                    legalSquares.push(currentSquareId);
                }
                break;
            }
        }
    });

    return legalSquares;
}


function getRookMoves(startingSquareId, pieceColor, Current_Board_Array) {
    const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ];
    return getSlidingPieceMoves(startingSquareId, pieceColor, Current_Board_Array, directions);
}

function getBishopMoves(startingSquareId, pieceColor, Current_Board_Array) {
    const directions = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
    ];
    return getSlidingPieceMoves(startingSquareId, pieceColor, Current_Board_Array, directions);
}


function getQueenMoves(startingSquareId, pieceColor, Current_Board_Array) {
    const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],   // Rook directions
        [1, 1], [1, -1], [-1, 1], [-1, -1], // Bishop directions
    ];
    return getSlidingPieceMoves(startingSquareId, pieceColor, Current_Board_Array, directions);
}


function getPieceAtSquare(squareId, Current_Board_Array) {
    let currentSquare = Current_Board_Array.find(
        (element) => element.squareId === squareId
    );
    const color = currentSquare.pieceColor;
    const pieceType = currentSquare.pieceType;
    const pieceId=currentSquare.pieceId;
    return { pieceColor: color, pieceType: pieceType,pieceId:pieceId};
}

function isKingInCheck(squareId, pieceColor, Current_Board_Array) {
    // Check for Rook or Queen threats
    let legalSquares = getRookMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            (pieceProperties.pieceType === "rook" || pieceProperties.pieceType === "queen") &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    // Check for Bishop or Queen threats
    legalSquares = getBishopMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            (pieceProperties.pieceType === "bishop" || pieceProperties.pieceType === "queen") &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    // Check for Pawn threats
    legalSquares = getPawnMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            pieceProperties.pieceType === "pawn" &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    // Check for Knight threats
    legalSquares = getKnightMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            pieceProperties.pieceType === "knight" &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    // Check for King threats
    legalSquares = getKingMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            pieceProperties.pieceType === "king" &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    return false;
}


function isMoveValidAgainstCheck(legalSquares,startingSquareId,pieceColor,pieceType){
    let kingSquare=isWhitesTurn ? White_King_Position : Black_King_Poisition;
    let Current_Board_ArrayCopy=Board_Clearance(Current_Board_Array);
    let legalSquaresCopy = legalSquares.slice();
    legalSquaresCopy.forEach((element)=>{
        let destinationId=element;
        Current_Board_ArrayCopy=Board_Clearance(Current_Board_Array);
        Update_Board(startingSquareId,destinationId,Current_Board_ArrayCopy);
        if(pieceType!=="king" && isKingInCheck(kingSquare,pieceColor,Current_Board_ArrayCopy)){
            legalSquares=legalSquares.filter((item)=>item!==destinationId);
        }
        if(pieceType==="king" && isKingInCheck(destinationId,pieceColor,Current_Board_ArrayCopy)){
            legalSquares=legalSquares.filter((item)=>item!==destinationId);
        }
    })
    return legalSquares;
}

function getKingMoves(startingSquareId, pieceColor,Current_Board_Array) {
    const file = startingSquareId.charCodeAt(0) - 97; // get the second character of the string
    const rank = startingSquareId.charAt(1); // get the second character of the string
    const rankNumber = parseInt(rank); // convert the second character to a number
    let currentFile = file;
    let currentRank = rankNumber;
    let legalSquares=[];
    const moves = [
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 0],
        [-1, 1],
        [-1, -1],
        [1, 0],
    ];

    moves.forEach((move) => {
        let currentFile = file + move[0];
        let currentRank = rankNumber + move[1];

        if (
            currentFile >= 0 &&
            currentFile <= 7 &&
            currentRank > 0 &&
            currentRank <= 8
        ) {
            let currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
            let currentSquare=Current_Board_Array.find((element)=>element.squareId===currentSquareId);
            let squareContent=currentSquare.pieceColor;
            if (squareContent != "Empty" && squareContent == pieceColor) {
                return legalSquares;
            }
            legalSquares.push(String.fromCharCode(currentFile + 97) + currentRank);
        }
    });
    return legalSquares;
}

function checkForCheckMate(){
    let kingSquare=isWhitesTurn ?White_King_Position:Black_King_Poisition;
    let pieceColor=isWhitesTurn ? "white" : "black";
    let Current_Board_ArrayCopy=Board_Clearance(Current_Board_Array);
    let kingIsCheck=isKingInCheck(kingSquare,pieceColor,Current_Board_ArrayCopy);
    if(!kingIsCheck)return;
    let possibleMoves=getAllPossibleMoves(Current_Board_ArrayCopy,pieceColor);
    if(possibleMoves.length>0) return;
    let message="";
    isWhitesTurn ? (message="Black Wins!") : (message="White Wins!");
}
function getAllPossibleMoves(squaresArray,color) {
    return squaresArray
        .filter((square)=>square.pieceColor===color).
        flatMap((square)=>{
            const {pieceColor,pieceType,pieceId} = getPieceAtSquare(square.squareId,squaresArray);
            if(pieceId==="Empty") return [];
            let squaresArrayCopy=Board_Clearance(squaresArray);
            const pieceObject={pieceColor:pieceColor,pieceType:pieceType,pieceId:pieceId}
            let legalSquares=getPossibleMoves(square.squareId,pieceObject,squaresArrayCopy);
            legalSquares=isMoveValidAgainstCheck(legalSquares,square.squareId,pieceColor,pieceType);
            return legalSquares;
        })
}
function showAlert(message) {
    const alert= document.getElementById("alert");
    alert.innerHTML=message;
    alert.style.display="block";

    setTimeout(function(){
        alert.style.display="none";
    },3000);
}


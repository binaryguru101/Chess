let Current_Board_Array=[]
let isWhitesTurn=true;
let White_King_Position="e1";
let Black_King_Poisition="e8";
let positionArray=[]
const castleingSquare=["g1","g8","c1","c8"];

let hasWhiteKingMoved = false;
let hasBlackKingMoved = false;
let hasWhiteKingsideRookMoved = false;
let hasWhiteQueensideRookMoved = false;
let hasBlackKingsideRookMoved = false;
let hasBlackQueensideRookMoved = false;

let moves=[];

let PromototionSquare=true;

const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");
const ChessB=document.querySelector(".ChessBoard");


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


        const piece=square.querySelector(".piece");
        if(piece){
            piece.addEventListener("click",()=>{
                console.log("Piece clicked:", piece.id); 
                const startingSquareId = square.id;
                const pieceColor = piece.getAttribute("color");
                const pieceType = piece.classList[1];
                const pieceId = piece.id;
                console.log("Starting Square ID:", startingSquareId);
                console.log("Piece Color:", pieceColor);
                console.log("Piece Type:", pieceType);
                console.log("Piece ID:", pieceId);

                let legalSquares = getPossibleMoves(startingSquareId, {
                    pieceColor: pieceColor,
                    pieceType: pieceType,
                    pieceId: pieceId
                }, Current_Board_Array);

                console.log("Legal Moves for piece:", legalSquares); 

                HighLightLegalMoves(legalSquares);
            })
        }
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
    console.log("UPDATED THE BOARD CHECK THE ARRAY");
    console.log(Current_Board_Array);



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






let currentPosition = generateFEN(Current_Board_Array);
getEvaluation(currentPosition,function(lines,evaluations,scoreString){
    displayEvaluation(lines,evaluations,scoreString,true,1);
})

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


function MakeMoves(startingSquareID,destinationalSquareID,pieceType,pieceColor,isCaptured){
    moves.push({
        from:startingSquareID,
        to:destinationalSquareID,
        pieceColor:pieceColor,
        pieceType:pieceType,
        isCaptured:isCaptured
    }
    )
}

function getKingsLastMove(color){
    let KingsLastMove=moves.findLast(element=>element.pieceType==="king" && element.pieceColor===color);
    if(KingsLastMove===undefined){
        return isWhitesTurn ? "e1" : "e8";
    }
    return KingsLastMove.to;
}

function After_Drop(event){
    event.preventDefault();
}























document.querySelectorAll('.piece').forEach(piece => {
    piece.addEventListener('click', (event) => {

        
        const startingSquareId = piece.parentElement.id;
        const pieceColor = piece.dataset.color;
        const pieceType = piece.dataset.type;
        const pieceId = piece.id;

        
        const pieceObject = { pieceColor, pieceType, pieceId };

        

        
        let legalSquares = getPossibleMoves(startingSquareId, pieceObject, Current_Board_Array);

        
        if (legalSquares && legalSquares.length > 0) {
            HighLightLegalMoves(legalSquares);
        }
    });
});


function drag(event){
    if(!PromototionSquare)return;

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
    console.log("Drop event triggered");

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
        
        checkForEndGame();
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
        let isCheck=false;
        if(pieceType==="king")
            isCheck=isKingInCheck(startingSquareId,pieceColor,Current_Board_Array);
        if(pieceType==="king" && !kingHasMoved(pieceColor) && castleingSquare.includes(destinationSquareId)&& !isCheck){
            performCastling(piece,pieceColor,startingSquareId,destinationSquareId,Current_Board_Array);
            return;
        }
        if(pieceType==="king" && !kingHasMoved(pieceColor) && castleingSquare.includes(destinationSquareId)&& isCheck){
            return;
        }
        console.log(destinationSquareId.charAt(1));
        console.log(pieceType);
        if(pieceType==="pawn" && (destinationSquareId.charAt(1)==8 || destinationSquareId.charAt(1)==1)){
            console.log("HERE BABY");
            PromototionSquare=false;
            showPromotionChices(pieceId,pieceColor,startingSquareId,destinationSquareId,false);
            updateBoardOpacity();
        }
        destinationSquare.appendChild(piece);
        isWhitesTurn= !isWhitesTurn;
        Update_Board(
            startingSquareId,
            destinationSquareId,
            Current_Board_Array
        );
        let isCaptured=false;
        MakeMoves(startingSquareId,destinationSquareId,pieceType,pieceColor,isCaptured);
        
        checkForEndGame();
        return;
    }
    if (
        squareContent.pieceColor!== "Empty" &&
        legalSquares.includes(destinationSquareId)
    ) {
        console.log(destinationSquareId);
        if(pieceType==="pawn" && (destinationSquareId.charAt(1)===8 || destinationSquareId.charAt(1)===1)){
            PromototionSquare=false;
            showPromotionChices(pieceId,pieceColor,startingSquareId,destinationSquareId,true);

            updateBoardOpacity();
        }
        let children = destinationSquare.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].classList.contains('coordinate')) {
                destinationSquare.removeChild(children[i]);
            }
        }
        
        
        
        destinationSquare.appendChild(piece);
        isWhitesTurn= !isWhitesTurn;
        Update_Board(
            startingSquareId,
            destinationSquareId,
            Current_Board_Array
        );
        console.log("HELLLO");

        let isCaptured=true;
        MakeMoves(startingSquareId,destinationSquareId,pieceType,pieceColor,isCaptured);

        checkForCheckMateDraw();

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



























function performCastling(piece,pieceColor,startingSquareId,destinationSquareId,boardSquaresArray){
    let rookId,rookDetinationSquareId,checkSquareId;
    if(destinationSquareId==="g1"){
        rookId="rookh1";
        rookDetinationSquareId="f1";
        checkSquareId="f1";
    }
    else if(destinationSquareId==="c1"){
        rookId="rooka1";
        rookDetinationSquareId="d1";
        checkSquareId="d1";
    }
    else if(destinationSquareId==="g8"){
        rookId="rookh8";
        rookDetinationSquareId="f8";
        checkSquareId="f8";
    }
    else if(destinationSquareId==="c8"){
        rookId="rooka8";
        rookDetinationSquareId="d8";
        checkSquareId="d8";
    }
    if(isKingInCheck(checkSquareId,pieceColor,boardSquaresArray))return;
    let rook=document.getElementById(rookId);
    let rookDetinationSquare=document.getElementById(rookDetinationSquareId);
    rookDetinationSquare.appendChild(rook);
    Update_Board(
        rook.id.slice(-2),
        rookDetinationSquare.id,
        boardSquaresArray
    );
    const destinationSquare=document.getElementById(destinationSquareId);
    destinationSquare.appendChild(piece);
    isWhitesTurn=!isWhitesTurn;
    Update_Board(
        startingSquareId,
        destinationSquareId,
        boardSquaresArray
    );
    let captured=false;
    MakeMoves(startingSquareId,destinationSquareId,"king",pieceColor,captured);
    
    checkForEndGame()
    return;
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
    const file = startingSquareId.charCodeAt(0) - 97; 
    const rank = parseInt(startingSquareId.charAt(1)); 
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
    const file = startingSquareId.charCodeAt(0) - 97; 
    const rank = parseInt(startingSquareId.charAt(1)); 
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
        [0, 1], [0, -1], [1, 0], [-1, 0],   
        [1, 1], [1, -1], [-1, 1], [-1, -1], 
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
    
    let legalSquares = getRookMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            (pieceProperties.pieceType === "rook" || pieceProperties.pieceType === "queen") &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    
    legalSquares = getBishopMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            (pieceProperties.pieceType === "bishop" || pieceProperties.pieceType === "queen") &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    
    legalSquares = getPawnMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            pieceProperties.pieceType === "pawn" &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    
    legalSquares = getKnightMoves(squareId, pieceColor, Current_Board_Array);
    for (let squareId of legalSquares) {
        let pieceProperties = getPieceAtSquare(squareId, Current_Board_Array);
        if (
            pieceProperties.pieceType === "knight" &&
            pieceColor !== pieceProperties.pieceColor
        ) return true;
    }

    
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
    
    let kingSquare=isWhitesTurn ? getKingsLastMove("white") : getKingsLastMove("black");

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
    const file = startingSquareId.charCodeAt(0) - 97; 
    const rank = startingSquareId.charAt(1); 
    const rankNumber = parseInt(rank); 
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

    let shortCastleSquare=isShortCastlePossible(pieceColor,Current_Board_Array);
    let longCastlesquare=isLongCastlePossible(pieceColor,Current_Board_Array);
    if(shortCastleSquare!=="Empty"){
        legalSquares.push(shortCastleSquare);
    }
    if(longCastlesquare!=="Empty"){
        legalSquares.push(longCastlesquare);
    }
    return legalSquares;
}

function checkForCheckMateDraw(){
    
    let kingSquare=isWhitesTurn ? getKingsLastMove("white") : getKingsLastMove("black");

    let pieceColor=isWhitesTurn ? "white" : "black";
    let Current_Board_ArrayCopy=Board_Clearance(Current_Board_Array);
    let kingIsCheck=isKingInCheck(kingSquare,pieceColor,Current_Board_ArrayCopy);

    let possibleMoves=getAllPossibleMoves(Current_Board_ArrayCopy,pieceColor);
    if(possibleMoves.length>0) return;
    if(kingIsCheck)
        isWhitesTurn ? (message = "Black Wins!") : (message = "White Wins!");
    else
        message="Draw";
    console.log(message);
    showAlert(message);
}

function getFiftyMovesRuleCount(){
    let count=0;
    for (let i=0;i<moves.length;i++){
        count++;
        if(moves[i].isCaptured || moves[i].pieceType ==="pawn" || moves[i].promotedTo!=="Empty")
            count=0;
    }
    return count;
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

function isShortCastlePossible(pieceColor,Current_Board_Array) {
    let rank = pieceColor === "white" ? "1" : "8";
    let fSquare=Current_Board_Array.find(element=>element.squareId===`f${rank}`);
    let gSquare=Current_Board_Array.find(element=>element.squareId===`g${rank}`);
    if(fSquare.pieceColor !=="Empty" || gSquare.pieceColor!=="Empty" || kingHasMoved(pieceColor)||rookHasMoved(pieceColor,`h${rank}`)){
        return "Empty";
    }
    return `g${rank}`;
}

function isLongCastlePossible(pieceColor,Current_Board_Array) {
    let rank = pieceColor === "white" ? "1" : "8";
    let dSquare=Current_Board_Array.find(element=>element.squareId===`d${rank}`);
    let cSquare=Current_Board_Array.find(element=>element.squareId===`c${rank}`);
    let bSquare=Current_Board_Array.find(element=>element.squareId===`b${rank}`);

    if(dSquare.pieceColor !=="Empty" || cSquare.pieceColor!=="Empty"||bSquare.pieceColor!=="Empty" || kingHasMoved(pieceColor)||rookHasMoved(pieceColor,`a${rank}`)){
        return "Empty";
    }
    return `c${rank}`;
}

function kingHasMoved(pieceColor){
    let result=moves.find((element)=>(element.pieceColor===pieceColor)&&(element.pieceType==="king"));
    if(result!==undefined) return true;
    return false;
}
function rookHasMoved(pieceColor,startingSquareId){
    let result=moves.find((element)=>(element.pieceColor===pieceColor)&&(element.pieceType==="rook")&&(element.from===startingSquareId));
    if(result!==undefined) return true;
    return false;
}

function showPromotionChices(pieceID,pieceColor,StartingSquare,DestSquare,Captured){
    console.log("function promotion one accessed");
        let file = DestSquare[0];
        let rank = parseInt(DestSquare[1]);
        let rank1 = pieceColor === "white" ? rank - 1 : rank + 1;
        let rank2 = pieceColor === "white" ? rank - 2 : rank + 2;
        let rank3 = pieceColor === "white" ? rank - 3 : rank + 3;

        let squareBehindId1 = file + rank1;
        let squareBehindId2 = file + rank2;
        let squareBehindId3 = file + rank3;

        const destinationSquare = document.getElementById(DestSquare);
        const squareBehind1 = document.getElementById(squareBehindId1);
        const squareBehind2 = document.getElementById(squareBehindId2);
        const squareBehind3 = document.getElementById(squareBehindId3);

        let piece1 = createChessPiece("queen", pieceColor, "promotionOption");
        let piece2 = createChessPiece("knight", pieceColor, "promotionOption");
        let piece3 = createChessPiece("rook", pieceColor, "promotionOption");
        let piece4 = createChessPiece("bishop", pieceColor, "promotionOption");

        destinationSquare.appendChild(piece1);
        squareBehind1.appendChild(piece2);
        squareBehind2.appendChild(piece3);
        squareBehind3.appendChild(piece4);

        console.log(destinationSquare, squareBehind1, squareBehind2, squareBehind3);

    let promotionOptions = document.getElementsByClassName("promotionOption");
        for (let i = 0; i < promotionOptions.length; i++) {
            let pieceType = promotionOptions[i].classList[1];
            promotionOptions[i].addEventListener("click", function () {
                performPromotion(
                    pieceID,
                    pieceType,
                    pieceColor,
                    StartingSquare,
                    DestSquare,
                    Captured
                );
            });
        }
}

function createChessPiece(pieceType, color, pieceClass) {
    let pieceName ="pieces-basic-png/"+
        color.charAt(0).toLowerCase() +
        color.slice(1) +
        "-" +
        pieceType.charAt(0).toLowerCase() +
        pieceType.slice(1) +
        ".png";

    let pieceDiv = document.createElement("div");
    pieceDiv.className = `${pieceClass} ${pieceType}`;
    pieceDiv.setAttribute("color", color);
    let img = document.createElement("img");
    img.src = pieceName;
    img.alt = pieceType;
    img.setAttribute("width","90%");
    img.setAttribute("height","90%");
    pieceDiv.appendChild(img);
    return pieceDiv;
}

ChessB.addEventListener("click",clearPromotion);

function clearPromotion() {
    for (let i = 0; i < boardSquares.length; i++) {
        let style = getComputedStyle(boardSquares[i]);
        let backgroundColor = style.backgroundColor;
        let rgbaColor = backgroundColor.replace("0.5)", "1)");
        boardSquares[i].style.backgroundColor = rgbaColor;
        boardSquares[i].style.opacity = 1;

        if (boardSquares[i].querySelector(".piece"))
            boardSquares[i].querySelector(".piece").style.opacity = 1;
    }
    let elementsToRemove = ChessB.querySelectorAll(".promotionOption");
    elementsToRemove.forEach(function (element) {
        element.parentElement.removeChild(element);
    });
    PromototionSquare = true;
}

function updateBoardOpacity(startingSquareId) {
    for (let i = 0; i < boardSquares.length; i++) {

        if(boardSquares[i].id===startingSquareId)
            boardSquares[i].querySelector(".piece").style.opacity = 0;

        if (!boardSquares[i].querySelector(".promotionOption")) {
            boardSquares[i].style.opacity = 0.5;
        } else {
            let style = getComputedStyle(boardSquares[i]);
            let backgroundColor = style.backgroundColor;
            let rgbaColor = backgroundColor
                .replace("rgb", "rgba")
                .replace(")", ",0.5)");
            boardSquares[i].style.backgroundColor = rgbaColor;

            if (boardSquares[i].querySelector(".piece"))
                boardSquares[i].querySelector(".piece").style.opacity = 0;
        }
    }
}

function performPromotion(
    pieceId,
    pieceType,
    pieceColor,
    startingSquareId,
    destinationSquareId,
    captured
) {
    clearPromotion();
    promotionPiece = pieceType;
    piece = createChessPiece(pieceType, pieceColor, "piece");

    piece.addEventListener("dragstart", drag);
    piece.setAttribute("draggable", true);
    piece.firstChild.setAttribute("draggable", false);
    piece.id = pieceType + pieceId;

    const startingSquare = document.getElementById(startingSquareId);
    while (startingSquare.firstChild) {
        startingSquare.removeChild(startingSquare.firstChild);
    }
    const destinationSquare = document.getElementById(destinationSquareId);

    if (captured) {
        let children = destinationSquare.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].classList.contains("coordinate")) {
                destinationSquare.removeChild(children[i]);
            }
        }
    }
    while(destinationSquare.firstChild){
      destinationSquare.removeChild(destinationSquare.firstChild);
    }
    destinationSquare.appendChild(piece);
    isWhitesTurn = !isWhitesTurn;
    Update_Board(
        startingSquareId,
        destinationSquareId,
        Current_Board_Array,
        pieceType
    );
    MakeMoves(
        startingSquareId,
        destinationSquareId,
        pieceType,
        pieceColor,
        captured,
        pieceType
    );
    
    checkForEndGame();
    return;
}

function generateFEN(boardSquares){
    let fen="";
    let rank=8;
    while(rank>=1){
        for(let file="a";file<="h";file=String.fromCharCode(file.charCodeAt(0)+1)){
            const square = boardSquares.find((element)=>element.squareId===`${file}${rank}`);
            if(square && square.pieceType){
                let pieceNotation ="";
                switch (square.pieceType){
                    case "pawn":
                        pieceNotation = "p";
                        break;
                    case "bishop":
                        pieceNotation = "b";
                        break;
                    case "knight":
                        pieceNotation = "n";
                        break;
                    case "rook":
                        pieceNotation = "r";
                        break;
                    case "queen":
                        pieceNotation = "q";
                        break;
                    case "king":
                        pieceNotation = "k";
                        break;
                    case "Empty":
                        pieceNotation = "Empty";
                        break;
                }
                fen+=square.pieceColor === "white" ? pieceNotation.toUpperCase() : pieceNotation;
            }
        }
        if(rank>1) {
            fen+="/";
        }
        rank--;
    }
    fen=fen.replace(new RegExp("EmptyEmptyEmptyEmptyEmptyEmptyEmptyEmpty","g"),"8");
    fen=fen.replace(new RegExp("EmptyEmptyEmptyEmptyEmptyEmptyEmpty","g"),"7");
    fen=fen.replace(new RegExp("EmptyEmptyEmptyEmptyEmptyEmpty","g"),"6");
    fen=fen.replace(new RegExp("EmptyEmptyEmptyEmptyEmpty","g"),"5");
    fen=fen.replace(new RegExp("EmptyEmptyEmptyEmpty","g"),"4");
    fen=fen.replace(new RegExp("EmptyEmptyEmpty","g"),"3");
    fen=fen.replace(new RegExp("EmptyEmpty","g"),"2");
    fen=fen.replace(new RegExp("Empty","g"),"1");

    fen+= isWhitesTurn ? " w " : " b ";

    let castlingString="";

    let shortCastlePossibleForWhite = !kingHasMoved("white") &&!rookHasMoved("white","h1");
    let longCastlePossibleForWhite = !kingHasMoved("white") &&!rookHasMoved("white","a1");
    let shortCastlePossibleForBlack = !kingHasMoved("black") &&!rookHasMoved("black","h8");
    let longCastlePossibleForBlack = !kingHasMoved("black") &&!rookHasMoved("black","a8");

    if(shortCastlePossibleForWhite) castlingString+="K";
    if(longCastlePossibleForWhite) castlingString+="Q";
    if(shortCastlePossibleForBlack) castlingString+="k";
    if(longCastlePossibleForBlack) castlingString+="q";
    if(castlingString==="") castlingString+="-";
    castlingString+=" ";
    fen+=castlingString;

    fen+="-"

    let fiftyMovesRuleCount=getFiftyMovesRuleCount();
    fen+=" "+fiftyMovesRuleCount;
    let moveCount=Math.floor(moves.length/2)+1;
    fen+=" "+moveCount;
    console.log(fen);
    return fen;


}


function checkForEndGame(){
    checkForCheckMateDraw();
    let currentPosition = generateFEN(Current_Board_Array);
    let moveCount = Math.floor(moves.length/2)+1;
    getEvaluation(currentPosition,function(lines,evaluations,scoreString){
        displayEvaluation(lines,evaluations,scoreString,isWhitesTurn,moveCount);
    });
    positionArray.push(currentPosition);

}



























































































































































function getEvaluation(fen, callback) {
    let engine = new Worker("./node_modules/stockfish/src/stockfish-nnue-16.js");
    let evaluations = [];
    let lines = [];
    let possibleMoves =3;
    engine.onmessage = function (event) {
        let message = event.data;

        if (message.startsWith("info depth 10")) {

            let multipvIndex = message.indexOf("multipv");
            if (multipvIndex !== -1) {
                let multipvString = message.slice(multipvIndex).split(" ")[1];
                let multipv = parseInt(multipvString);
                let scoreIndex = message.indexOf("score cp");
                if (scoreIndex !== -1) {
                    var scoreString = message.slice(scoreIndex).split(" ")[2];
                    let evaluation = parseInt(scoreString) / 100;
                    evaluation = isWhitesTurn ? evaluation : evaluation * -1;
                    evaluations[multipv - 1] = evaluation;
                } else {

                    scoreIndex = message.indexOf("score mate");
                    scoreString = message.slice(scoreIndex).split(" ")[2];
                    evaluation = parseInt(scoreString);
                    evaluation = Math.abs(evaluation);
                    evaluations[multipv - 1] = "#" + evaluation;
                }
                let pvIndex = message.indexOf(" pv ");
                if (pvIndex !== -1) {

                    let pvString = message.slice(pvIndex + 4).split(" ");
                    lines[multipv-1] = pvString.join(" ");
                    if (evaluations.length === possibleMoves && lines.length===possibleMoves) {
                        callback(lines,evaluations,scoreString);
                    }
                }
            }
        }
        if(message.startsWith("Nodes searched:")){
            let parts = message.split(" ");
            let numberOfMoves = parseInt(parts[2]);
            if(numberOfMoves<3) {
                possibleMoves = numberOfMoves;
                line1.innerHTML="";line2.innerHTML="";line3.innerHTML="";
                eval1.innerHTML=""; eval2.innerHTML=""; eval3.innerHTML="";
            }
        }

    };

    engine.postMessage("uci");
    engine.postMessage("isready");
    engine.postMessage("ucinewgame");
    engine.postMessage(`setoption name multipv value 3`);
    engine.postMessage("position fen " + fen);
    engine.postMessage("go perft 1");
    engine.postMessage("go depth 10");

}

function displayEvaluation (lines,evaluations,scoreString,whiteTurn=true,moveNumber=1) {
    let blackBar = document.querySelector(".blackBar");
    let blackBarHeight = 50 - (evaluations[0] / 15) * 100;
    blackBarHeight =
        blackBarHeight > 100 ? (blackBarHeight = 100) : blackBarHeight;
    blackBarHeight =
        blackBarHeight <0 ? (blackBarHeight = 0) : blackBarHeight;
    blackBar.style.height = blackBarHeight + "%";
    let evalNum =document.querySelector(".evalNum");
    evalNum.innerHTML = evaluations[0];
    for (let i=0;i<lines.length;i++) {
        let eval = document.getElementById("eval"+(i+1));
        let line =document.getElementById("line"+(i+1));
        eval.innerHTML = evaluations[i];
        line.innerHTML = convertStockfishToStandardNotation(lines[i],moveNumber,whiteTurn);
        line.innerHTML = lines[i];

        document.getElementById("eval").innerHTML = evaluations[0];
        if(evaluations[0]<0.5)
            document.getElementById("evalText").innerHTML = "Equal";
        if(evaluations[0]<1 && evaluations[0]>=0.5)
            document.getElementById("evalText").innerHTML = "White is slightly better";
        if(evaluations[0]> -1 && evaluations[0]<=-0.5)
            document.getElementById("evalText").innerHTML = "Black is slightly better";
        if(evaluations[0]<2 && evaluations[0]>=1)
            document.getElementById("evalText").innerHTML = "White is much better";
        if(evaluations[0]> -2 && evaluations[0]<= -1)
            document.getElementById("evalText").innerHTML = "Black is much better";
        if(evaluations[0]>2)
            document.getElementById("evalText").innerHTML = "White is winning";
        if(evaluations[0]< -2)
            document.getElementById("evalText").innerHTML = "Black is winning";

        if(evaluations[0].toString().includes("#")) {
            const mateInMoves = evaluations[0].slice(1);
            const isWhiteWinning = (parseInt(scoreString)>0 && isWhitesTurn) ||(parseInt(scoreString)<0 && !isWhitesTurn);
            const winningColor = isWhiteWinning ? "White" : "Black";
            document.getElementById("evalText").innerHTML = `${winningColor} can mate in ${mateInMoves} moves`;
            blackBarHeight = isWhiteWinning? 0 : 100;
            blackBar.style.height = blackBarHeight+"%";
        }
    }

}


function convertStockfishToStandardNotation(stockfishMoves,moveNumber,whiteTurn){
    let standardMoves = "";
    let moves = stockfishMoves.split(" ");
    console.log("MOVES ARE");
    console.log(moves);
    let boardSquaresArrayCopy = Board_Clearance(Current_Board_Array);
    for(let i=0;i<moves.length;i++) {
        let move = moves[i];
        let from = move.substring(0,2);
        let to =  move.substring(2,4);
        let promotion = move.length>4? move.charAt(4) : null;
        let fromSquare = boardSquaresArrayCopy.find(square=>square.squareId===from);
        let toSquare = getPieceAtSquare(to,boardSquaresArrayCopy);
        if(fromSquare&&toSquare) {
            let fromPiece = fromSquare.pieceType;
            switch(fromPiece.toLowerCase()) {
                case "pawn":
                    fromPiece="";
                    break;
                case "knight":
                    fromPiece="N";
                    break;
                case "bishop":
                    fromPiece="B";
                    break;
                case "rook":
                    fromPiece="R";
                    break;
                case "queen":
                    fromPiece="Q";
                    break;
                case "king":
                    fromPiece="K";
                    break;
            }
            let captureSymbol="";
            if((toSquare.pieceType !=="Empty") || (toSquare.pieceType==="Empty" && fromSquare.pieceType.toLowerCase()==="pawn" && from.charAt(0)!==to.charAt(0))){
                captureSymbol="x";
                if(fromSquare.pieceType.toLowerCase()==="pawn") {
                    fromPiece = from.charAt(0);
                }
            }
            let standardMove = `${fromPiece}${captureSymbol}${to}`;
            if(promotion){
                switch(promotion.toLowerCase()){
                    case "q":
                        standardMove+="=Q";
                        break;
                    case "r":
                        standardMove+="=R";
                        break;
                    case "b":
                        standardMove+="=B";
                        break;
                    case "n":
                        standardMove+="=N";
                        break;
                }
            }
            let kingColor = fromSquare.pieceColor === "white" ? "black":"white";
            let kingSquareId = getKingSquare(kingColor,boardSquaresArrayCopy);
            Update_Board(from,to,boardSquaresArrayCopy);

            if(isKingInCheck(kingSquareId,kingColor,boardSquaresArrayCopy)) {
                standardMove +="+";
            }
            if((standardMove ==="Kg8" && fromSquare.squareId==="e8")||(standardMove === "Kg1" && fromSquare.squareId==="e1")) {
                if(standardMove ==="Kg8")
                    Update_Board("h8","f8",boardSquaresArrayCopy);
                else
                    Update_Board("h1","f1",boardSquaresArrayCopy);
                standardMove = "O-O";

            }
            if((standardMove ==="Kc8" && fromSquare.squareId==="e8")||(standardMove === "Kc1" && fromSquare.squareId==="e1")) {
                if(standardMove ==="Kc8")
                    Update_Board("a8","d8",boardSquaresArrayCopy);
                else
                    Update_Board("a1","d1",boardSquaresArrayCopy);
                standardMove = "O-O-O";
            }
            standardMoves += `${(whiteTurn && i%2==0)||(!whiteTurn && i%2 ==1)? " "+moveNumber++ + "." : " "}${standardMove}`;

            if(!whiteTurn && i===0) standardMoves = `${moveNumber+". ... "}${standardMove} `;
        }
    }
    return standardMoves.trim();
}

function getKingSquare(color,squareArray) {
    let kingSquare = squareArray.find(square=>square.pieceType.toLowerCase()==="king" && square.pieceColor === color);

    return kingSquare ? kingSquare.squareId : null;
}




function HighLightLegalMoves(legalSquares) {
    console.log("Clearing previously highlighted moves");

    
    document.querySelectorAll('.legal-move').forEach(square => {
        square.classList.remove('legal-move');
        square.style.backgroundColor = ""; 
        square.style.opacity = ""; 
        console.log("Removed 'legal-move' class and reset styles from:", square.id);
    });

    
    if (legalSquares && Array.isArray(legalSquares)) {
        legalSquares.forEach(squareId => {
            const squareElement = document.getElementById(squareId);
            if (squareElement) {
                squareElement.classList.add('legal-move');
                squareElement.style.backgroundColor = "rgb(255, 255, 0)"; 
                squareElement.style.opacity = "1"; 
                console.log("Highlighting square:", squareId); 
            } else {
                console.log("Square not found:", squareId);
            }
        });
    }

    
    const legalSquaresHighlighted = document.querySelectorAll('.legal-move');
    legalSquaresHighlighted.forEach(square => {
        console.log("Square with 'legal-move' class:", square.id);
    });
}

document.getElementById("toggleButton").addEventListener("click", function () {
    var table = document.getElementById("topLines");
    console.log(table.classList);
    console.log("TOGGING IT DOWN ");
    table.classList.toggle("hidden");
});


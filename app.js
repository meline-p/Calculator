const calculatorData = {
  calculation: "",
  result: "",
  displayedResults: false
}

const buttons = [...document.querySelectorAll("[data-action]")]

//---------------------------------------------------------  NUMBERS  ---------------------------------------------------------

const digitsBtns = buttons.filter(button => /[0-9]/.test(button.getAttribute("data-action")))

digitsBtns.forEach(btn => btn.addEventListener("click", handleDigits))

const calculationDisplay = document.querySelector(".calculation");
const resultDisplay = document.querySelector(".result");

//dès que l'on clique sur un bouton chiffre
function handleDigits(e){
  const buttonValue = e.target.getAttribute("data-action");

  //si on est en train de montrer un résultat => on reset tout
  if(calculatorData.displayedResults){
    calculationDisplay.textContent = "";
    calculatorData.calculation = "";
    calculatorData.displayedResults = false;
  }
  //si on clique sur 0 => on affiche rien 
  else if(calculatorData.calculation === "0") calculatorData.calculation = "";

  calculatorData.calculation += buttonValue;
  resultDisplay.textContent = calculatorData.calculation;
}

//---------------------------------------------------------  OPERATORS  ---------------------------------------------------------

const operatorsBtns = buttons.filter(button => /[\/+*-]/.test(button.getAttribute("data-action")))

operatorsBtns.forEach(btn => btn.addEventListener("click", handleOperators))

//dès que l'on clique sur un opérateur
function handleOperators(e){
  const buttonValue = e.target.getAttribute("data-action");

  //si on est en train de montrer un résultat 
  if(calculatorData.displayedResults){
    calculationDisplay.textContent = ""; // calcul reset
    calculatorData.calculation = calculatorData.result += buttonValue; // on ajoute l'opérateur au calcul
    resultDisplay.textContent = calculatorData.calculation; // texte affiché = calcul
    calculatorData.displayedResults = false; // on affiche pas les résultats
    return;
  }
  //si le calcul est vide et que l'on appuie sur -
  else if(!calculatorData.calculation && buttonValue === "-"){
    calculatorData.calculation += buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
    return;
  }
  //si le calcul est vide ou que la dernière partie du calcul est un point => on ne retourne rien
  else if(!calculatorData.calculation || calculatorData.calculation.slice(-1) === ".") return;

  //si la dernière partie du calcul est un opérateur et que la longeur du calcul est différente de 1 (soit 2 élements, ex : -1+ etc..  -+ etc.. est impossible)
  else if(calculatorData.calculation.slice(-1).match(/[\/+*-]/) && calculatorData.calculation.length !== 1){
    // la dernière partie du calcul va être changé par l'opérateur
    calculatorData.calculation = calculatorData.calculation.slice(0, -1) + buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
  }
  //si la longeur du calcul est différente de 1
  else if(calculatorData.calculation.length !== 1) {
    calculatorData.calculation += buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
  }
  //si on ne rencontre pas d'opérateur dans le 1er premier élément
  else if (!/[\/+*-]/.test(calculatorData.calculation.slice(0, 1))){
    calculatorData.calculation += buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
  }
}

//---------------------------------------------------------  DECIMAL  ---------------------------------------------------------

const decimalButton = document.querySelector("[data-action='.']")

decimalButton.addEventListener("click", handleDecimal);

//dès que l'on clique sur bouton point
function handleDecimal (){
  //si le calcul est vide => on ne retourne rien
  if(!calculatorData.calculation) return;

  let lastSetOfNumbers = "";

  for(let i = calculatorData.calculation.length - 1; i >= 0; i--) {
    //si on tombe sur un opérateur
    if(/[\/+*-]/.test(calculatorData.calculation[i])){
      break;
    }
    else {
      lastSetOfNumbers += calculatorData.calculation[i];
    }
  }
  
  //si la dernière série de nombre n'inclut pas de point
  if(!lastSetOfNumbers.includes(".")) {
    calculatorData.calculation += ".";
    resultDisplay.textContent = calculatorData.calculation;
  }
}

//---------------------------------------------------------  EQUAL  ---------------------------------------------------------

const equalBtn = document.querySelector("[data-action='=']")

equalBtn.addEventListener("click", handleEqualBtn);

// dès que l'on clique sur le bouton égal
function handleEqualBtn(){
  // si le calcul se termine par un opérateur ou un point
  if(/[\/+*-.]/.test(calculatorData.calculation.slice(-1))){
    calculationDisplay.textContent = "Terminez le calcul par un chiffre.";
    setTimeout(() => {
      calculationDisplay.textContent = "";
    }, 2500)
    return;
  }
  //si les résultats ne sont pas affichés
  else if(!calculatorData.displayedResults){
    calculatorData.result = customEval(calculatorData.calculation)

    resultDisplay.textContent = calculatorData.result;
    calculationDisplay.textContent = calculatorData.calculation;
    calculatorData.displayedResults = true;
  }
}

//---------------------------------------------------------  FUNCTION CUSTOM EVAL  ---------------------------------------------------------

function customEval(calculation){
  //si on ne rencontre pas d'opérateurs à partir du 1er élément du calcul
  if(!/[\/+*-]/.test(calculation.slice(1))) return calculation;

  let operator;
  let operatorIndex;
  //si on rencontre un opérateur * ou / à partir du 1er élément du calcul
  if(/[\/*]/.test(calculation.slice(1))) {
    for(let i = 1; i < calculation.length; i++){
      if(/[\/*]/.test(calculation[i])){
        operator = calculation[i];
        operatorIndex = i;
        break;
      }
    }
  } else {
    for(let i = 1; i < calculation.length; i++){
      //si on rencontre un opérateur + ou - à partir du 1er élément du calcul
      if(/[+-]/.test(calculation[i])){
        operator = calculation[i];
        operatorIndex = i;
        break;
      }
    }
  }

  const operandsInfo = getIndexes(operatorIndex, calculation) 
  console.log(operandsInfo);

  let currentCalculationResult;
  switch(operator){
    case "+":
      currentCalculationResult = Number(operandsInfo.leftOperand) + Number(operandsInfo.rightOperand)
      break;
    case "-":
      currentCalculationResult = Number(operandsInfo.leftOperand) - Number(operandsInfo.rightOperand)
      break;      
    case "*":
      currentCalculationResult = Number(operandsInfo.leftOperand) * Number(operandsInfo.rightOperand)
      break;  
    case "/":
      currentCalculationResult = Number(operandsInfo.leftOperand) / Number(operandsInfo.rightOperand)
      break;  
  }
  

  let updatedCalculation = calculation.replace(calculation.slice(operandsInfo.startIntervalIndex, operandsInfo.lastRightOperandCharacter), currentCalculationResult.toString())

  //si on rencontre un opérateur à partir du 1er élément du calcul
  if(/[\/+*-]/.test(updatedCalculation.slice(1))) {
    customEval(updatedCalculation)
  }

  //si on rencontre un point 
  if(updatedCalculation.includes(".")) {
    // on split à partir du point et s'il y a un chiffre après le point
    if(updatedCalculation.split(".")[1].length === 1){
      return Number(updatedCalculation).toString();
    }
    // on split à partir du point et s'il y a plus d'un chiffre après le point
    else if(updatedCalculation.split(".")[1].length > 1) {
      return Number(updatedCalculation).toFixed(2).toString();
    }
  }
  else {
    return updatedCalculation;
  }
}

function getIndexes(operatorIndex, calculation){

  // opérand à droite
  let rightOperand = "";
  let lastRightOperandCharacter;

  // pour chaque index + 1 (élément à droite après l'opérateur)
  for(let i = operatorIndex + 1; i <= calculation.length; i++) {
    if(i === calculation.length) {
      lastRightOperandCharacter = calculation.length;
      break;
    }
    //si on rencontre un opérateur
    else if(/[\/+*-]/.test(calculation[i])) {
      lastRightOperandCharacter = i;
      break;
    }
    else {
      rightOperand += calculation[i];
    }
  }

  // opérand à gauche
  let leftOperand = "";
  let startIntervalIndex;

  // pour chaque index - 1 (élément à gauche avant l'opérateur)
  for(let i = operatorIndex - 1; i >= 0; i--) {
    //si on arive au 1er élément de gauche (=== 0) et que c'est un -
    if(i === 0 && /[-]/.test(calculation[i])) {
      startIntervalIndex = 0;
      leftOperand += "-";
      break;
    }
    //si on arrive au 1er élément de gauche (et que ce n'est pas un chiffre négatif)
    else if(i === 0){
      startIntervalIndex = 0;
      leftOperand += calculation[i];
      break;
    }
    //si on rencontre un opérateur
    else if(/[\/+*-]/.test(calculation[i])) {
      startIntervalIndex = i + 1;
      break;
    }
    else {
      leftOperand += calculation[i];
    }
  }

  //on reverse pour avoir les éléments dans le bon ordre
  leftOperand = leftOperand.split("").reverse().join("");

  return {
    leftOperand,
    rightOperand,
    startIntervalIndex,
    lastRightOperandCharacter
  }

}

//---------------------------------------------------------  CLEAR  ---------------------------------------------------------

const resetButton = document.querySelector("[data-action='c']")

resetButton.addEventListener("click", reset);

function reset(){
  calculatorData.calculation = "";
  calculatorData.displayedResults = false;
  calculatorData.result = "";
  resultDisplay.textContent = "0";
  calculationDisplay.textContent = "";
}

//---------------------------------------------------------  CLEAR ENTRY  ---------------------------------------------------------

const clearEntryButton = document.querySelector("[data-action='ce']")

clearEntryButton.addEventListener("click", clearEntry);

function clearEntry(){

  // si on est pas en train d'afficher un résultat
  if(!calculatorData.displayedResults){
    //si on a pas d'élement, il ne se passe rien
    if(resultDisplay.textContent[0] === "0") return;
    // si on a 1 élément, on le remplace par 0
    else if(resultDisplay.textContent.length === 1) {
      calculatorData.calculation = "0";
    }
    //sinon on reprend la chaine de caractère et on enlève le dernier
    else {
      calculatorData.calculation = calculatorData.calculation.slice(0,-1)
    }
    resultDisplay.textContent = calculatorData.calculation;
  }

}


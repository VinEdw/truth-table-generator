function logVariableLetter(e) {
  // stop the typical form submit behavior
  e.preventDefault();

  // get the input letter, add it to the array, clear the input field, and update the RegEx pattern
  const letter = letterInput.value;
  variableArr.push(letter);
  letterInput.value = '';
  letterInput.setAttribute('pattern', letterInput.getAttribute('pattern').replace(letter, ''));

  // create a list item with the input letter and add it to the variable list
  const listItem = document.createElement('li');
  listItem.textContent = letter;
  variableList.appendChild(listItem);
}

function continueButtonHandler(e) {
  // check that at least one variable has been added before continuing
  if (variableArr.length === 0) {
    alert('At least one variable must be added.');
    return;
  }

  // reveal the table and the section for expression input
  document.getElementById('expression-input-section').removeAttribute('hidden');
  truthTable.removeAttribute('hidden');

  // clear the letter input, disable the variable form elements, and stop the event listener
  letterInput.value = "";
  letterInput.setAttribute('disabled', 'disabled');
  document.getElementById('letter-submit-button').setAttribute('disabled', 'disabled');
  variableForm.removeEventListener('submit', logVariableLetter);

  // add a RegEx pattern to the expression input
  const pattern = `[${variableArr.join('')}∼•∨⊃()≡𝑡𝑓]+`;
  expressionInput.setAttribute('pattern', pattern);

  // add the columns for the variables to the truth table
  const thead = document.createElement('thead');
  thead.id = 'truth-table-head';
  const tr = document.createElement('tr');
  for (let j = 0; j < variableArr.length; j++) {
    const cell = document.createElement('th');
    cell.textContent = variableArr[j];
    cell.classList.add('top-th');

    if (j === variableArr.length - 1) {
      cell.classList.add('least-significant-letter');
    }

    tr.appendChild(cell);
  }
  thead.appendChild(tr);
  truthTable.appendChild(thead);

  const rowCount = 2 ** variableArr.length;
  for (let i = rowCount - 1; i > -1; i--) {
    const row = document.createElement('tr');
    if (i % 2 === 1) {
      row.classList.add('light-grey-background');
    }

    for (let j = variableArr.length - 1; j > -1; j--) {
      const text = ((i & 2 ** j) >> j) ? 'T' : 'F';
      const cell = document.createElement('td');
      cell.textContent = text;

      if (j === 0) {
        cell.classList.add('least-significant-letter');
      }

      cell.classList.add(text === 'T' ? 'true-cell' : 'false-cell');

      row.appendChild(cell);
    }
    truthTable.appendChild(row);
  }
  const tfoot = document.createElement('tfoot');
  const tfootRow = document.createElement('tr');
  const tfootHeading = document.createElement('th');

  tfoot.id = 'truth-table-foot';
  tfoot.classList.add('dark-grey-background');
  tfootHeading.setAttribute('colspan', `${variableArr.length}`);
  tfootHeading.classList.add('least-significant-letter');
  tfootHeading.textContent = 'Type:';
  tfootRow.appendChild(tfootHeading);
  tfoot.appendChild(tfootRow);
  truthTable.append(tfoot);

  // hide the continue button and remove its event listener
  continueButton.setAttribute('hidden', 'hidden');
  continueButton.removeEventListener('click', continueButtonHandler);
}

function removeItemCheckboxHandler(e) {
  if (this.checked) {
    if (continueButton.getAttribute('hidden') !== 'hidden') {
      letterInput.setAttribute('disabled', 'disabled');
      document.getElementById('letter-submit-button').setAttribute('disabled', 'disabled');
      continueButton.setAttribute('disabled', 'disabled');

      for (let i = 0; i < variableList.childElementCount; i++) {
        const listItem = variableList.children[i];
        listItem.classList.add('delete-indicator');
        listItem.addEventListener('click', removeVariableListItem);
      }

      removeItemInstruction.textContent = 'Click the items in the variables list you would like to remove.'
    }
    else {
      expressionInput.setAttribute('disabled', 'disabled');
      document.getElementById('expression-submit-button').setAttribute('disabled', 'disabled');

      const tableHeadings = document.getElementsByClassName('top-th');
      for (let i = variableArr.length; i < tableHeadings.length; i++) {
        const th = tableHeadings[i];
        th.classList.add('delete-indicator');
        th.addEventListener('click', removeColumn);
      }

      removeItemInstruction.textContent = 'Click the expressions in the table you would like to remove.'
    }
  }
  else {
    const deletableElements = document.getElementsByClassName('delete-indicator');
    for (let i = deletableElements.length - 1; i > -1; i--) {
      const element = deletableElements[i];
      element.classList.remove('delete-indicator');
      element.removeEventListener('click', removeVariableListItem);
      element.removeEventListener('click', removeColumn);
    }

    removeItemInstruction.textContent = '';

    if (continueButton.getAttribute('hidden') !== 'hidden') {
      letterInput.removeAttribute('disabled');
      document.getElementById('letter-submit-button').removeAttribute('disabled');
      continueButton.removeAttribute('disabled');
    }
    else {
      expressionInput.removeAttribute('disabled');
      document.getElementById('expression-submit-button').removeAttribute('disabled');
    }
  }
}

function removeVariableListItem(e) {
  const letter = this.textContent;
  variableArr.splice(variableArr.indexOf(letter), 1);
  letterInput.setAttribute('pattern', letterInput.getAttribute('pattern').slice(0, -1) + letter + ']');
  this.remove();
}

function removeColumn(e) {
  const theadRow = this.parentElement;
  // const theadRow = document.getElementById('truth-table-head').children[0];
  // figure out the column number of the clicked element
  let columnNumber = 0;
  for (let i = 0; i < theadRow.children.length; i++) {
    const cell = theadRow.children[i];
    if (cell === this) {
      columnNumber = i;
      break;
    }
  }

  // remove the table data at the columnNumber in each row
  for (let i = 1; i < truthTable.childElementCount - 1; i++) {
    const row = truthTable.children[i];
    row.children[columnNumber].remove();
  }
  document.getElementById('truth-table-foot').children[0].children[columnNumber - variableArr.length + 1].remove();
  this.remove();
}

function addExpression(e) {
  // stop the typical form submit behavior
  e.preventDefault();

  // get the expression from the expression input box
  const expression = expressionInput.value;
  // console.log(expression);

  // confirm that the expression is well formed; cancel if it is not
  if (!validateExpression(expression)) {
    alert('Expression is not well formed');
    return;
  }

  // add the expression as a header in the truth table head
  const heading = document.createElement('th');
  heading.textContent = expression;
  heading.classList.add('top-th');
  document.getElementById('truth-table-head').children[0].appendChild(heading);

  const outputArr = [];
  // evaluate the expression at the given row input and add the output to the table
  for (let i = 1; i < truthTable.childElementCount - 1; i++) {
    const row = truthTable.children[i];
    const rowChildren = row.children;
    const cell = document.createElement('td');

    // get the T/F values from the current row and put them in variableValues
    const variableValues = {};
    for (let j = 0; j < variableArr.length; j++) {
      variableValues[variableArr[j]] = rowChildren[j].textContent === 'T' ? true : false;
    }

    const result = evaluateExpression(expression, variableValues)
    outputArr.push(result);
    const text = result ? 'T' : 'F';
    cell.textContent = text;
    cell.classList.add(result ? 'true-cell' : 'false-cell');

    row.appendChild(cell);
  }

  //action to take for the tfoot
  const tfootCell = document.createElement('td');
  const hasTrue = outputArr.some(element => element);
  const hasFalse = outputArr.some(element => !element);
  if (hasTrue && hasFalse) {
    tfootCell.textContent = 'contingent';
  }
  else if (hasTrue) {
    tfootCell.textContent = 'tautologous';
  }
  else {
    tfootCell.textContent = 'self-contradictory';
  }
  document.getElementById('truth-table-foot').children[0].appendChild(tfootCell);

  // clear the expression input box
  expressionInput.value = '';
}

function monitorExpression(e) {
  // get the value of expression input box
  text = expressionInput.value;

  // replace certain lowercase letters with their corresponding operator
  text = text.replaceAll('~', '∼');
  text = text.replaceAll('n', '∼');
  text = text.replaceAll('a', '•');
  text = text.replaceAll('o', '∨');
  text = text.replaceAll('i', '⊃');
  text = text.replaceAll('e', '≡');
  text = text.replaceAll('t', '𝑡');
  text = text.replaceAll('f', '𝑓');

  // remove all disallowed characters
  const pattern = new RegExp(`[^${variableArr.join('')}∼•∨⊃()≡𝑡𝑓]+`, 'g');
  text = text.replaceAll(pattern, '');

  // update the expression input box
  expressionInput.value = text;
}

function validateExpression(expr) {
  expr = expr.replaceAll('𝑡', 't');
  expr = expr.replaceAll('𝑓', 'f');

  // confirm that the parentheses count and order makes sense for logical expressions
  let lParCount = 0;
  let rParCount = 0;
  for (let i = 0; i < expr.length; i++) {
    const letter = expr[i];
    if (letter === '(') {
      lParCount++;
      if (i !== expr.length - 1 && expr[i + 1] === ')') {
        return false;
      }
    }
    else if (letter === ')') {
      rParCount++;
      if (i !== expr.length - 1 && expr[i + 1] === '(') {
        return false;
      }
    }
    if (rParCount > lParCount) {
      return false;
    }
  }
  if (lParCount !== rParCount) {
    return false;
  }

  // make sure letters are not directly adjacent each other, left of (, left of ∼, or right of )
  const letterList = variableArr.join('') + 'tf';
  for (let i = 0; i < expr.length; i++) {
    const letter = expr[i];
    if (!letterList.includes(letter)) {
      continue;
    }
    if (i !== expr.length - 1) {
      const nextLetter = expr[i + 1];
      if ((letterList + '(∼').includes(nextLetter)) {
        return false;
      }
    }
    if (i !== 0) {
      const previousLetter = expr[i - 1];
      if (previousLetter === ')') {
        return false;
      }
    }
  }

  // make sure ∼ are not left of ), left of any other operator •⊃∨≡, or at the end of the expression
  for (let i = 0; i < expr.length; i++) {
    const letter = expr[i];
    if (letter === '∼') {
      if (i === expr.length - 1) {
        return false;
      }
      const nextLetter = expr[i + 1];
      if (')•⊃∨≡'.includes(nextLetter)) {
        return false;
      }
    }
  }

  // make sure the operators •⊃∨≡ are not next to each other, left of ), right of (, or at the start/end of the expression
  for (let i = 0; i < expr.length; i++) {
    const letter = expr[i];
    if (!'•⊃∨≡'.includes(letter)) {
      continue;
    }
    if (i === expr.length - 1 || i === 0) {
      return false;
    }

    if (i !== expr.length - 1) {
      const nextLetter = expr[i + 1];
      if ('•⊃∨≡)'.includes(nextLetter)) {
        return false;
      }
    }
    if (i !== 0) {
      const previousLetter = expr[i - 1];
      if (previousLetter === '(') {
        return false;
      }
    }
  }

  // make sure the operators •⊃∨≡ cannot "see" another operator •⊃∨≡ without passing through ( or ) first
  for (let i = 0; i < expr.length; i++) {
    const letter = expr[i];
    if (!'•⊃∨≡'.includes(letter)) {
      continue;
    }
    const exprPortion = expr.slice(i + 1);
    const nextOperatorIndex = exprPortion.search(/[•⊃∨≡]/g);
    const nextParenIndex = exprPortion.search(/[()]/g);
    if (nextOperatorIndex !== -1) {
      if (nextParenIndex === -1) {
        return false;
      }
      if (nextOperatorIndex < nextParenIndex) {
        return false;
      }
    }
  }

  // if none of the checks return false, then return true
  return true;
}

function evaluateExpression(expr, inputs) {
  // // the line below returns a random value of either 0 or 1
  // return Math.round(Math.random());
  expr = expr.replaceAll('𝑡', 't');
  expr = expr.replaceAll('𝑓', 'f');
  const letterList = variableArr.join('') + 'tf';

  if (expr.length === 1) {
    if (variableArr.includes(expr)) {
      return inputs[expr];
    }
    else if (expr === 't') {
      return true;
    }
    else {
      return false;
    }
  }

  let operator = '';
  let statement1 = '';
  let statement1Negation = false;
  let i = 0
  while (true) {
    let letter = expr[i];
    if (letter === '∼') {
      statement1Negation = !statement1Negation;
      i++;
      continue;
    }

    if (letter === '(') {
      const closingParIndex = findCorresponingClosingParen(expr, i);
      statement1 = expr.slice(i + 1, closingParIndex);
      i = closingParIndex;
    }
    else if (letterList.includes(letter)) {
      statement1 = letter;
    }

    if (i === expr.length - 1) {
      let result = evaluateExpression(statement1, inputs);
      return statement1Negation ? !result : result;
    }
    else {
      operator = expr[i + 1];
      i += 2;
      break;
    }
  }

  let statement2 = '';
  let statement2Negation = false;
  while (true) {
    let letter = expr[i];
    if (letter === '∼') {
      statement2Negation = !statement2Negation;
      i++;
      continue;
    }

    if (letter === '(') {
      const closingParIndex = findCorresponingClosingParen(expr, i);
      statement2 = expr.slice(i + 1, closingParIndex);
      i = closingParIndex;
    }
    else if (letterList.includes(letter)) {
      statement2 = letter;
    }
    break;
  }

  if (operator === '•') {
    return (statement1Negation ? !evaluateExpression(statement1, inputs) : evaluateExpression(statement1, inputs)) && (statement2Negation ? !evaluateExpression(statement2, inputs) : evaluateExpression(statement2, inputs));
  }
  else if (operator === '∨') {
    return (statement1Negation ? !evaluateExpression(statement1, inputs) : evaluateExpression(statement1, inputs)) || (statement2Negation ? !evaluateExpression(statement2, inputs) : evaluateExpression(statement2, inputs));
  }
  else if (operator === '⊃') {
    if (statement1Negation ? !evaluateExpression(statement1, inputs) : evaluateExpression(statement1, inputs)) {
      if (statement2Negation ? !evaluateExpression(statement2, inputs) : evaluateExpression(statement2, inputs)) {
        return true;
      }
      return false;
    }
    return true;
  }
  else if (operator === '≡') {
    return (statement1Negation ? !evaluateExpression(statement1, inputs) : evaluateExpression(statement1, inputs)) === (statement2Negation ? !evaluateExpression(statement2, inputs) : evaluateExpression(statement2, inputs));
  }
}

function findCorresponingClosingParen(expr, start) {
  let lParCount = 0;
  let rParCount = 0;
  for (let i = start; i < expr.length; i++) {
    let letter = expr[i];
    if (letter === '(') {
      lParCount++;
    }
    else if (letter === ')') {
      rParCount++;
    }
    if (lParCount === rParCount) {
      return i;
    }
  }
}

// create variables for all the important document elements
const variableForm = document.getElementById('variable-form');
const letterInput = document.getElementById('letter-input');
const variableList = document.getElementById('variable-list');
const continueButton = document.getElementById('continue-button');
const expressionForm = document.getElementById('expression-form');
const expressionInput = document.getElementById('expression-input');
const truthTable = document.getElementById('truth-table');
const removeItemCheckbox = document.getElementById('remove-item-checkbox');
const removeItemInstruction = document.getElementById('remove-item-instructions');

// add the needed event listeners to the elements
variableForm.addEventListener('submit', logVariableLetter);
continueButton.addEventListener('click', continueButtonHandler);
expressionForm.addEventListener('submit', addExpression);
expressionInput.addEventListener('input', monitorExpression);
removeItemCheckbox.addEventListener('input', removeItemCheckboxHandler);

const variableArr = [];
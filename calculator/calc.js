document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContainer = document.getElementById('mainContainer');
    const progressBar = document.getElementById('loadingProgressBar');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingFeatures = document.getElementById('loadingFeatures');
   
    const features = [
        "Scientific Calculator", "Matrix Operations", "Equation Solver",
        "3×3 System Solver", "Calculus Tools", "Statistics & Probability",
        "Unit Converter", "History Tracking", "Keyboard Support",
        "Dark Theme", "Responsive Design", "Real-time Calculations"
    ];
   
    let progress = 0;
    let featureIndex = 0;
   
    function showNextFeature() {
        if (featureIndex < features.length) {
            const featureTag = document.createElement('div');
            featureTag.className = 'feature-tag';
            featureTag.textContent = features[featureIndex];
            featureTag.style.animationDelay = `${featureIndex * 100}ms`;
            loadingFeatures.appendChild(featureTag);
            featureIndex++;
            setTimeout(showNextFeature, 100);
        }
    }
   
    const statusMessages = [
        "Initializing CalcLab...",
        "Loading advanced calculator...",
        "Setting up scientific calculator...",
        "Initializing matrix operations...",
        "Configuring equation solver...",
        "Loading 3×3 system algorithms...",
        "Setting up calculus tools...",
        "Preparing statistics module...",
        "Loading unit converter...",
        "Finalizing CalcLab..."
    ];
   
    let statusIndex = 0;
   
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
       
        if (progress >= (statusIndex + 1) * (100 / statusMessages.length)) {
            if (statusIndex < statusMessages.length) {
                loadingStatus.textContent = statusMessages[statusIndex];
                statusIndex++;
            }
        }
       
        if (progress >= 30 && featureIndex === 0) {
            showNextFeature();
        }
       
        if (progress >= 100) {
            clearInterval(interval);
            loadingStatus.textContent = "Ready! Launching CalcLab...";
           
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                mainContainer.classList.add('loaded');
                initCalculator();
                showNotification('CalcLab Loaded!', 'success');
            }, 800);
        }
    }, 100);
   
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
       
        container.appendChild(notification);
       
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
       
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
   
    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
               
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
               
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
               
                showNotification(`Switched to ${button.textContent.trim()}`, 'info');
            });
        });
    }
   
    function setupAngleMode() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const mode = button.dataset.mode;
                window.calculatorAngleMode = mode;
                showNotification(`Angle mode: ${mode.toUpperCase()}`, 'info');
            });
        });
    }
   
    function initCalculator() {
        const calculator = {
            displayValue: '0',
            expression: '',
            firstOperand: null,
            waitingForSecondOperand: false,
            operator: null,
            memory: 0,
            history: [],
            previousAnswer: 0
        };
       
        const displayElement = document.getElementById('display');
        const expressionElement = document.getElementById('expression');
        const buttonsContainer = document.getElementById('buttons');
        const historyListElement = document.getElementById('historyList');
        const clearHistoryButton = document.getElementById('clearHistory');
       
        const buttonConfig = [
            { text: '2nd', class: 'mode', action: 'secondFunction' },
            { text: 'π', class: 'const', action: 'pi' },
            { text: 'e', class: 'const', action: 'e' },
            { text: 'C', class: 'clear', action: 'clear' },
            { text: 'CE', class: 'clear', action: 'clearEntry' },
            { text: '⌫', class: 'clear', action: 'backspace' },
            { text: '%', class: 'operator', action: 'percent' },
            { text: '(', class: 'function', action: 'parenthesis', value: '(' },
            { text: ')', class: 'function', action: 'parenthesis', value: ')' },
            { text: '÷', class: 'operator', action: 'operator', value: '/' },
           
            { text: 'x²', class: 'function', action: 'power', value: '2' },
            { text: 'x³', class: 'function', action: 'power', value: '3' },
            { text: 'xʸ', class: 'function', action: 'power', value: '^' },
            { text: '10ˣ', class: 'function', action: 'tenPower' },
            { text: 'eˣ', class: 'function', action: 'ePower' },
            { text: '√', class: 'function', action: 'sqrt' },
            { text: '∛', class: 'function', action: 'cbrt' },
            { text: '1/x', class: 'function', action: 'reciprocal' },
            { text: '|x|', class: 'function', action: 'abs' },
            { text: 'ANS', class: 'memory', action: 'answer' },
           
            { text: 'sin', class: 'function', action: 'sin' },
            { text: 'cos', class: 'function', action: 'cos' },
            { text: 'tan', class: 'function', action: 'tan' },
            { text: '7', class: '', action: 'number', value: '7' },
            { text: '8', class: '', action: 'number', value: '8' },
            { text: '9', class: '', action: 'number', value: '9' },
            { text: '×', class: 'operator', action: 'operator', value: '*' },
            { text: 'MC', class: 'memory', action: 'memoryClear' },
            { text: 'MR', class: 'memory', action: 'memoryRecall' },
            { text: 'M+', class: 'memory', action: 'memoryAdd' },
           
            { text: 'sin⁻¹', class: 'function', action: 'asin' },
            { text: 'cos⁻¹', class: 'function', action: 'acos' },
            { text: 'tan⁻¹', class: 'function', action: 'atan' },
            { text: '4', class: '', action: 'number', value: '4' },
            { text: '5', class: '', action: 'number', value: '5' },
            { text: '6', class: '', action: 'number', value: '6' },
            { text: '-', class: 'operator', action: 'operator', value: '-' },
            { text: 'M-', class: 'memory', action: 'memorySubtract' },
            { text: 'MS', class: 'memory', action: 'memoryStore' },
            { text: 'sinh', class: 'function', action: 'sinh' },
           
            { text: 'cosh', class: 'function', action: 'cosh' },
            { text: 'tanh', class: 'function', action: 'tanh' },
            { text: 'log', class: 'function', action: 'log' },
            { text: '1', class: '', action: 'number', value: '1' },
            { text: '2', class: '', action: 'number', value: '2' },
            { text: '3', class: '', action: 'number', value: '3' },
            { text: '+', class: 'operator', action: 'operator', value: '+' },
            { text: 'ln', class: 'function', action: 'ln' },
            { text: 'log₂', class: 'function', action: 'log2' },
            { text: 'EXP', class: 'function', action: 'exp' },
           
            { text: 'x!', class: 'function', action: 'factorial' },
            { text: 'Rand', class: 'function', action: 'random' },
            { text: 'EE', class: 'function', action: 'scientific' },
            { text: '0', class: '', action: 'number', value: '0' },
            { text: '.', class: '', action: 'decimal' },
            { text: '±', class: 'function', action: 'plusMinus' },
            { text: '=', class: 'equals', action: 'equals' },
            { text: 'mod', class: 'function', action: 'mod' }
        ];
       
        function createButtons() {
            buttonsContainer.innerHTML = '';
            buttonConfig.forEach(button => {
                const buttonElement = document.createElement('button');
                buttonElement.className = `btn ${button.class}`;
                buttonElement.textContent = button.text;
                buttonElement.dataset.action = button.action;
                if (button.value) buttonElement.dataset.value = button.value;
               
                buttonsContainer.appendChild(buttonElement);
            });
        }
       
        function inputNumber(num) {
            if (calculator.waitingForSecondOperand) {
                calculator.displayValue = num;
                calculator.waitingForSecondOperand = false;
            } else {
                calculator.displayValue = calculator.displayValue === '0' ? num : calculator.displayValue + num;
            }
           
            if (calculator.expression === '' || calculator.operator) {
                calculator.expression = calculator.displayValue;
            } else {
                calculator.expression += num;
            }
           
            updateDisplay();
        }
       
        function inputOperator(op) {
            const inputValue = parseFloat(calculator.displayValue);
           
            if (calculator.operator && calculator.waitingForSecondOperand) {
                calculator.operator = op;
                return;
            }
           
            if (calculator.firstOperand === null) {
                calculator.firstOperand = inputValue;
            } else if (calculator.operator) {
                const result = performCalculation(calculator.firstOperand, inputValue, calculator.operator);
                calculator.displayValue = String(result);
                calculator.firstOperand = result;
            }
           
            calculator.waitingForSecondOperand = true;
            calculator.operator = op;
            calculator.expression += ` ${op} `;
            updateDisplay();
        }
       
        function performCalculation(first, second, operator) {
            switch (operator) {
                case '+': return first + second;
                case '-': return first - second;
                case '×': return first * second;
                case '/': return first / second;
                case '^': return Math.pow(first, second);
                case 'mod': return first % second;
                default: return second;
            }
        }
       
        function calculateEquals() {
            const inputValue = parseFloat(calculator.displayValue);
           
            if (calculator.firstOperand !== null && calculator.operator) {
                const result = performCalculation(calculator.firstOperand, inputValue, calculator.operator);
                calculator.displayValue = String(result);
                calculator.previousAnswer = result;
                addToHistory(`${calculator.firstOperand} ${calculator.operator} ${inputValue}`, result);
                calculator.firstOperand = null;
                calculator.operator = null;
                calculator.waitingForSecondOperand = false;
                calculator.expression = String(result);
                updateDisplay();
            }
        }
       
        function clearCalculator() {
            calculator.displayValue = '0';
            calculator.expression = '';
            calculator.firstOperand = null;
            calculator.waitingForSecondOperand = false;
            calculator.operator = null;
            updateDisplay();
            showNotification('Calculator cleared', 'info');
        }
       
        function backspace() {
            if (calculator.displayValue.length > 1) {
                calculator.displayValue = calculator.displayValue.slice(0, -1);
                calculator.expression = calculator.expression.slice(0, -1);
            } else {
                calculator.displayValue = '0';
                calculator.expression = '';
            }
            updateDisplay();
        }
       
        function updateDisplay() {
            displayElement.textContent = calculator.displayValue;
            expressionElement.textContent = calculator.expression || ' ';
        }
       
        function addToHistory(expression, result) {
            const historyItem = {
                expression,
                result,
                timestamp: new Date().toLocaleTimeString()
            };
           
            calculator.history.unshift(historyItem);
            if (calculator.history.length > 50) calculator.history.pop();
           
            updateHistoryDisplay();
        }
       
        function updateHistoryDisplay() {
            historyListElement.innerHTML = '';
           
            calculator.history.forEach((item, index) => {
                const historyItemElement = document.createElement('div');
                historyItemElement.className = 'history-item';
                historyItemElement.innerHTML = `
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">= ${item.result}</div>
                    <div class="history-time">${item.timestamp}</div>
                `;
               
                historyItemElement.addEventListener('click', () => {
                    calculator.displayValue = item.result;
                    calculator.expression = item.result;
                    updateDisplay();
                });
               
                historyListElement.appendChild(historyItemElement);
            });
        }
       
        function setupCalculatorEvents() {
            createButtons();
           
            buttonsContainer.addEventListener('click', (e) => {
                const button = e.target.closest('.btn');
                if (!button) return;
               
                const action = button.dataset.action;
                const value = button.dataset.value || button.textContent;
               
                switch(action) {
                    case 'number':
                        inputNumber(value);
                        break;
                    case 'operator':
                        inputOperator(value);
                        break;
                    case 'equals':
                        calculateEquals();
                        break;
                    case 'clear':
                        clearCalculator();
                        break;
                    case 'backspace':
                        backspace();
                        break;
                    case 'decimal':
                        if (!calculator.displayValue.includes('.')) {
                            calculator.displayValue += '.';
                            calculator.expression += '.';
                            updateDisplay();
                        }
                        break;
                    case 'pi':
                        calculator.displayValue = Math.PI.toString();
                        calculator.expression = 'π';
                        updateDisplay();
                        break;
                    case 'e':
                        calculator.displayValue = Math.E.toString();
                        calculator.expression = 'e';
                        updateDisplay();
                        break;
                    case 'sqrt':
                        const sqrtValue = Math.sqrt(parseFloat(calculator.displayValue));
                        calculator.displayValue = sqrtValue.toString();
                        calculator.expression = `√(${calculator.expression}) = ${sqrtValue}`;
                        updateDisplay();
                        break;
                    case 'sin':
                        const angle = parseFloat(calculator.displayValue);
                        const radians = window.calculatorAngleMode === 'deg' ? angle * Math.PI / 180 : angle;
                        const sinValue = Math.sin(radians);
                        calculator.displayValue = sinValue.toString();
                        calculator.expression = `sin(${angle}) = ${sinValue}`;
                        updateDisplay();
                        break;
                    case 'cos':
                        const angle2 = parseFloat(calculator.displayValue);
                        const radians2 = window.calculatorAngleMode === 'deg' ? angle2 * Math.PI / 180 : angle2;
                        const cosValue = Math.cos(radians2);
                        calculator.displayValue = cosValue.toString();
                        calculator.expression = `cos(${angle2}) = ${cosValue}`;
                        updateDisplay();
                        break;
                    case 'tan':
                        const angle3 = parseFloat(calculator.displayValue);
                        const radians3 = window.calculatorAngleMode === 'deg' ? angle3 * Math.PI / 180 : angle3;
                        const tanValue = Math.tan(radians3);
                        calculator.displayValue = tanValue.toString();
                        calculator.expression = `tan(${angle3}) = ${tanValue}`;
                        updateDisplay();
                        break;
                    case 'log':
                        const logValue = Math.log10(parseFloat(calculator.displayValue));
                        calculator.displayValue = logValue.toString();
                        calculator.expression = `log(${calculator.displayValue}) = ${logValue}`;
                        updateDisplay();
                        break;
                    case 'ln':
                        const lnValue = Math.log(parseFloat(calculator.displayValue));
                        calculator.displayValue = lnValue.toString();
                        calculator.expression = `ln(${calculator.displayValue}) = ${lnValue}`;
                        updateDisplay();
                        break;
                    case 'factorial':
                        const num = parseInt(calculator.displayValue);
                        let fact = 1;
                        for (let i = 2; i <= num; i++) fact *= i;
                        calculator.displayValue = fact.toString();
                        calculator.expression = `${num}! = ${fact}`;
                        updateDisplay();
                        break;
                    case 'random':
                        const randomValue = Math.random();
                        calculator.displayValue = randomValue.toString();
                        calculator.expression = `Random = ${randomValue}`;
                        updateDisplay();
                        break;
                    case 'plusMinus':
                        const currentValue = parseFloat(calculator.displayValue);
                        calculator.displayValue = (-currentValue).toString();
                        calculator.expression = `-(${currentValue}) = ${-currentValue}`;
                        updateDisplay();
                        break;
                    case 'percent':
                        const percentValue = parseFloat(calculator.displayValue) / 100;
                        calculator.displayValue = percentValue.toString();
                        calculator.expression = `${calculator.displayValue}% = ${percentValue}`;
                        updateDisplay();
                        break;
                }
            });
           
            document.addEventListener('keydown', (e) => {
                if (e.key >= '0' && e.key <= '9') {
                    inputNumber(e.key);
                } else if (e.key === '+') {
                    inputOperator('+');
                } else if (e.key === '-') {
                    inputOperator('-');
                } else if (e.key === '*') {
                    inputOperator('×');
                } else if (e.key === '/') {
                    inputOperator('/');
                } else if (e.key === 'Enter' || e.key === '=') {
                    calculateEquals();
                } else if (e.key === 'Escape') {
                    clearCalculator();
                } else if (e.key === 'Backspace') {
                    backspace();
                } else if (e.key === '.') {
                    if (!calculator.displayValue.includes('.')) {
                        calculator.displayValue += '.';
                        calculator.expression += '.';
                        updateDisplay();
                    }
                }
            });
           
            clearHistoryButton.addEventListener('click', () => {
                calculator.history = [];
                updateHistoryDisplay();
                showNotification('History cleared', 'success');
            });
        }
       
        setupCalculatorEvents();
        updateDisplay();
    }
   
    function initMatrixCalculator() {
        const matrixAGrid = document.getElementById('matrixAGrid');
        const matrixBGrid = document.getElementById('matrixBGrid');
        const matrixResult = document.getElementById('matrixResult');
       
        let matrixA = [];
        let matrixB = [];
        let rowsA = 2, colsA = 2;
        let rowsB = 2, colsB = 2;
       
        function createMatrix(grid, rows, cols, matrixArray) {
            grid.innerHTML = '';
            grid.style.gridTemplateColumns = `repeat(${cols}, auto)`;
           
            matrixArray.length = rows;
            for (let i = 0; i < rows; i++) {
                matrixArray[i] = new Array(cols).fill(0);
                for (let j = 0; j < cols; j++) {
                    const cell = document.createElement('input');
                    cell.type = 'number';
                    cell.className = 'matrix-cell';
                    cell.value = matrixArray[i][j];
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    cell.addEventListener('input', (e) => {
                        const row = parseInt(e.target.dataset.row);
                        const col = parseInt(e.target.dataset.col);
                        matrixArray[row][col] = parseFloat(e.target.value) || 0;
                    });
                    grid.appendChild(cell);
                }
            }
        }
       
        function updateMatrixA() {
            rowsA = parseInt(document.getElementById('rowsA').value);
            colsA = parseInt(document.getElementById('colsA').value);
            createMatrix(matrixAGrid, rowsA, colsA, matrixA);
        }
       
        function updateMatrixB() {
            rowsB = parseInt(document.getElementById('rowsB').value);
            colsB = parseInt(document.getElementById('colsB').value);
            createMatrix(matrixBGrid, rowsB, colsB, matrixB);
        }
       
        function addMatrices() {
            if (rowsA !== rowsB || colsA !== colsB) {
                matrixResult.innerHTML = '<pre>Error: Matrices must have same dimensions</pre>';
                return;
            }
           
            const result = [];
            for (let i = 0; i < rowsA; i++) {
                result[i] = [];
                for (let j = 0; j < colsA; j++) {
                    result[i][j] = matrixA[i][j] + matrixB[i][j];
                }
            }
            displayMatrixResult('A + B =', result);
        }
       
        function multiplyMatrices() {
            if (colsA !== rowsB) {
                matrixResult.innerHTML = '<pre>Error: Columns of A must equal rows of B</pre>';
                return;
            }
           
            const result = [];
            for (let i = 0; i < rowsA; i++) {
                result[i] = [];
                for (let j = 0; j < colsB; j++) {
                    result[i][j] = 0;
                    for (let k = 0; k < colsA; k++) {
                        result[i][j] += matrixA[i][k] * matrixB[k][j];
                    }
                }
            }
            displayMatrixResult('A × B =', result);
        }
       
        function transposeMatrix(matrix, rows, cols, name) {
            const result = [];
            for (let i = 0; i < cols; i++) {
                result[i] = [];
                for (let j = 0; j < rows; j++) {
                    result[i][j] = matrix[j][i];
                }
            }
            displayMatrixResult(`${name}ᵀ =`, result);
        }
       
        function determinant2x2(matrix) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }
       
        function calculateDeterminant(matrix, rows, cols, name) {
            if (rows !== cols) {
                matrixResult.innerHTML = `<pre>Error: Matrix ${name} must be square</pre>`;
                return;
            }
           
            let det;
            if (rows === 2) {
                det = determinant2x2(matrix);
            } else {
                det = 'Not supported for matrices larger than 2x2';
            }
           
            matrixResult.innerHTML = `<pre>det(${name}) = ${det}</pre>`;
        }
       
        function displayMatrixResult(label, matrix) {
            let result = label + '\n';
            matrix.forEach(row => {
                result += '[' + row.map(num => num.toFixed(2)).join(', ') + ']\n';
            });
            matrixResult.innerHTML = `<pre>${result}</pre>`;
        }
       
        document.getElementById('generateA').addEventListener('click', updateMatrixA);
        document.getElementById('generateB').addEventListener('click', updateMatrixB);
        document.getElementById('clearA').addEventListener('click', () => {
            matrixA = [];
            createMatrix(matrixAGrid, rowsA, colsA, matrixA);
        });
        document.getElementById('clearB').addEventListener('click', () => {
            matrixB = [];
            createMatrix(matrixBGrid, rowsB, colsB, matrixB);
        });
       
        document.querySelectorAll('.matrix-op-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const op = e.target.closest('.matrix-op-btn').dataset.op;
               
                switch(op) {
                    case 'add':
                        addMatrices();
                        break;
                    case 'subtract':
                        if (rowsA !== rowsB || colsA !== colsB) {
                            matrixResult.innerHTML = '<pre>Error: Matrices must have same dimensions</pre>';
                            return;
                        }
                        const subResult = [];
                        for (let i = 0; i < rowsA; i++) {
                            subResult[i] = [];
                            for (let j = 0; j < colsA; j++) {
                                subResult[i][j] = matrixA[i][j] - matrixB[i][j];
                            }
                        }
                        displayMatrixResult('A - B =', subResult);
                        break;
                    case 'multiply':
                        multiplyMatrices();
                        break;
                    case 'transposeA':
                        transposeMatrix(matrixA, rowsA, colsA, 'A');
                        break;
                    case 'transposeB':
                        transposeMatrix(matrixB, rowsB, colsB, 'B');
                        break;
                    case 'determinantA':
                        calculateDeterminant(matrixA, rowsA, colsA, 'A');
                        break;
                    case 'determinantB':
                        calculateDeterminant(matrixB, rowsB, colsB, 'B');
                        break;
                    case 'scalarA':
                        const scalar = parseFloat(document.getElementById('scalarValue').value);
                        const scalarResultA = matrixA.map(row => row.map(val => val * scalar));
                        displayMatrixResult(`${scalar} × A =`, scalarResultA);
                        break;
                    case 'scalarB':
                        const scalar2 = parseFloat(document.getElementById('scalarValue').value);
                        const scalarResultB = matrixB.map(row => row.map(val => val * scalar2));
                        displayMatrixResult(`${scalar2} × B =`, scalarResultB);
                        break;
                }
            });
        });
       
        updateMatrixA();
        updateMatrixB();
    }
   
    function initEquationSolver() {
        const eqTypeButtons = document.querySelectorAll('.eq-type-btn');
        const solveButton = document.getElementById('solveEquation');
        const equationResult = document.getElementById('equationResult');
       
        eqTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                eqTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
               
                const type = btn.dataset.eqType;
                document.getElementById('eq2x2').style.display = type === '2x2' ? 'flex' : 'none';
                document.getElementById('eq3x3').style.display = type === '3x3' ? 'flex' : 'none';
                document.getElementById('eqQuadratic').style.display = type === 'quadratic' ? 'flex' : 'none';
            });
        });
       
        solveButton.addEventListener('click', () => {
            const activeType = document.querySelector('.eq-type-btn.active').dataset.eqType;
           
            switch(activeType) {
                case '2x2':
                    solve2x2System();
                    break;
                case '3x3':
                    solve3x3System();
                    break;
                case 'quadratic':
                    solveQuadratic();
                    break;
            }
        });
       
        function solve2x2System() {
            const inputs = document.querySelectorAll('#eq2x2 .equation-input-field');
            const a1 = parseFloat(inputs[0].value) || 0;
            const b1 = parseFloat(inputs[1].value) || 0;
            const c1 = parseFloat(inputs[2].value) || 0;
            const a2 = parseFloat(inputs[3].value) || 0;
            const b2 = parseFloat(inputs[4].value) || 0;
            const c2 = parseFloat(inputs[5].value) || 0;
           
            const determinant = a1 * b2 - a2 * b1;
           
            if (determinant === 0) {
                if (a1/a2 === b1/b2 && a1/a2 === c1/c2) {
                    equationResult.innerHTML = '<div class="solution-step"><strong>Infinite Solutions</strong><br>The system has infinitely many solutions (dependent equations).</div>';
                } else {
                    equationResult.innerHTML = '<div class="solution-step"><strong>No Solution</strong><br>The system has no solution (inconsistent equations).</div>';
                }
                return;
            }
           
            const x = (c1 * b2 - c2 * b1) / determinant;
            const y = (a1 * c2 - a2 * c1) / determinant;
           
            equationResult.innerHTML = `
                <div class="solution-step">
                    <strong>Equations:</strong><br>
                    ${a1}x + ${b1}y = ${c1}<br>
                    ${a2}x + ${b2}y = ${c2}
                </div>
                <div class="solution-step">
                    <strong>Solution using Cramer's Rule:</strong><br>
                    Determinant D = ${determinant}<br>
                    Dx = ${c1 * b2 - c2 * b1}<br>
                    Dy = ${a1 * c2 - a2 * c1}
                </div>
                <div class="solution-step">
                    <strong>Solution:</strong><br>
                    x = Dx/D = ${x.toFixed(4)}<br>
                    y = Dy/D = ${y.toFixed(4)}
                </div>
                <div class="solution-step">
                    <strong>Verification:</strong><br>
                    Eq1: ${a1}(${x.toFixed(2)}) + ${b1}(${y.toFixed(2)}) = ${(a1*x + b1*y).toFixed(2)} ≈ ${c1}<br>
                    Eq2: ${a2}(${x.toFixed(2)}) + ${b2}(${y.toFixed(2)}) = ${(a2*x + b2*y).toFixed(2)} ≈ ${c2}
                </div>
            `;
        }
       
        function solve3x3System() {
            const a11 = parseFloat(document.getElementById('a11').value) || 0;
            const a12 = parseFloat(document.getElementById('a12').value) || 0;
            const a13 = parseFloat(document.getElementById('a13').value) || 0;
            const d1 = parseFloat(document.getElementById('d1').value) || 0;
           
            const a21 = parseFloat(document.getElementById('a21').value) || 0;
            const a22 = parseFloat(document.getElementById('a22').value) || 0;
            const a23 = parseFloat(document.getElementById('a23').value) || 0;
            const d2 = parseFloat(document.getElementById('d2').value) || 0;
           
            const a31 = parseFloat(document.getElementById('a31').value) || 0;
            const a32 = parseFloat(document.getElementById('a32').value) || 0;
            const a33 = parseFloat(document.getElementById('a33').value) || 0;
            const d3 = parseFloat(document.getElementById('d3').value) || 0;
           
            const determinant =
                a11 * (a22 * a33 - a23 * a32) -
                a12 * (a21 * a33 - a23 * a31) +
                a13 * (a21 * a32 - a22 * a31);
           
            if (Math.abs(determinant) < 0.000001) {
                equationResult.innerHTML = '<div class="solution-step"><strong>No Unique Solution</strong><br>The determinant is zero. The system may have no solution or infinitely many solutions.</div>';
                return;
            }
           
            const detX =
                d1 * (a22 * a33 - a23 * a32) -
                a12 * (d2 * a33 - a23 * d3) +
                a13 * (d2 * a32 - a22 * d3);
           
            const detY =
                a11 * (d2 * a33 - a23 * d3) -
                d1 * (a21 * a33 - a23 * a31) +
                a13 * (a21 * d3 - d2 * a31);
           
            const detZ =
                a11 * (a22 * d3 - d2 * a32) -
                a12 * (a21 * d3 - d2 * a31) +
                d1 * (a21 * a32 - a22 * a31);
           
            const x = detX / determinant;
            const y = detY / determinant;
            const z = detZ / determinant;
           
            equationResult.innerHTML = `
                <div class="solution-step">
                    <strong>3×3 System:</strong><br>
                    ${a11}x + ${a12}y + ${a13}z = ${d1}<br>
                    ${a21}x + ${a22}y + ${a23}z = ${d2}<br>
                    ${a31}x + ${a32}y + ${a33}z = ${d3}
                </div>
                <div class="solution-step">
                    <strong>Step 1: Calculate Main Determinant (D):</strong><br>
                    D = ${determinant.toFixed(4)}
                </div>
                <div class="solution-step">
                    <strong>Step 2: Calculate Dx, Dy, Dz:</strong><br>
                    Dx = ${detX.toFixed(4)}<br>
                    Dy = ${detY.toFixed(4)}<br>
                    Dz = ${detZ.toFixed(4)}
                </div>
                <div class="solution-step">
                    <strong>Step 3: Calculate Solutions:</strong><br>
                    x = Dx/D = ${x.toFixed(4)}<br>
                    y = Dy/D = ${y.toFixed(4)}<br>
                    z = Dz/D = ${z.toFixed(4)}
                </div>
            `;
        }
       
        function solveQuadratic() {
            const a = parseFloat(document.getElementById('quadA').value) || 0;
            const b = parseFloat(document.getElementById('quadB').value) || 0;
            const c = parseFloat(document.getElementById('quadC').value) || 0;
           
            if (a === 0) {
                equationResult.innerHTML = '<div class="solution-step"><strong>Not a Quadratic Equation</strong><br>Coefficient a cannot be zero for a quadratic equation.</div>';
                return;
            }
           
            const discriminant = b * b - 4 * a * c;
           
            let solutionHTML = `
                <div class="solution-step">
                    <strong>Quadratic Equation:</strong><br>
                    ${a}x² + ${b}x + ${c} = 0
                </div>
                <div class="solution-step">
                    <strong>Step 1: Calculate Discriminant:</strong><br>
                    Δ = b² - 4ac = ${b}² - 4×${a}×${c} = ${discriminant.toFixed(4)}
                </div>
            `;
           
            if (discriminant > 0) {
                const sqrtD = Math.sqrt(discriminant);
                const x1 = (-b + sqrtD) / (2 * a);
                const x2 = (-b - sqrtD) / (2 * a);
               
                solutionHTML += `
                    <div class="solution-step">
                        <strong>Step 2: Two Real Solutions (Δ > 0):</strong><br>
                        √Δ = ${sqrtD.toFixed(4)}<br>
                        x₁ = (-b + √Δ)/(2a) = ${x1.toFixed(4)}<br>
                        x₂ = (-b - √Δ)/(2a) = ${x2.toFixed(4)}
                    </div>
                `;
            } else if (discriminant === 0) {
                const x = -b / (2 * a);
                solutionHTML += `
                    <div class="solution-step">
                        <strong>Step 2: One Real Solution (Δ = 0):</strong><br>
                        x = -b/(2a) = ${x.toFixed(4)}
                    </div>
                `;
            } else {
                const real = -b / (2 * a);
                const imaginary = Math.sqrt(-discriminant) / (2 * a);
                solutionHTML += `
                    <div class="solution-step">
                        <strong>Step 2: Two Complex Solutions (Δ < 0):</strong><br>
                        x₁ = ${real.toFixed(4)} + ${imaginary.toFixed(4)}i<br>
                        x₂ = ${real.toFixed(4)} - ${imaginary.toFixed(4)}i
                    </div>
                `;
            }
           
            equationResult.innerHTML = solutionHTML;
        }
       
        document.querySelector('.eq-type-btn[data-eq-type="2x2"]').click();
    }
   
    function initCalculusTools() {
        document.getElementById('calculateLimit').addEventListener('click', () => {
            const func = document.getElementById('limitFunction').value;
            const point = document.getElementById('limitPoint').value;
            const direction = document.querySelector('.limit-dir-btn.active').dataset.direction;
           
            let resultText = '';
           
            try {
                if (func === 'sin(x)/x' && point === '0') {
                    resultText = 'lim<sub>x→0</sub> sin(x)/x = 1';
                } else if (func === '(x^2 - 1)/(x - 1)' && point === '1') {
                    resultText = 'lim<sub>x→1</sub> (x² - 1)/(x - 1) = 2';
                } else if (func === '1/x' && point === '0') {
                    if (direction === 'left') {
                        resultText = 'lim<sub>x→0⁻</sub> 1/x = -∞';
                    } else if (direction === 'right') {
                        resultText = 'lim<sub>x→0⁺</sub> 1/x = ∞';
                    } else {
                        resultText = 'lim<sub>x→0</sub> 1/x does not exist (different left and right limits)';
                    }
                } else {
                    resultText = `lim<sub>x→${point}</sub> ${func} - Symbolic calculation required`;
                }
            } catch (error) {
                resultText = `Error evaluating limit: ${error.message}`;
            }
           
            document.getElementById('limitResult').innerHTML = `
                <div class="solution-step">
                    <strong>Limit Result:</strong><br>
                    ${resultText}
                </div>
            `;
        });
       
        document.getElementById('calculateDerivative').addEventListener('click', () => {
            const func = document.getElementById('derivativeFunction').value;
            const order = parseInt(document.getElementById('derivativeOrder').value);
           
            let derivative = '';
           
            if (func === 'x^2') {
                derivative = order === 1 ? '2x' : order === 2 ? '2' : '0';
            } else if (func === 'x^3') {
                derivative = order === 1 ? '3x²' : order === 2 ? '6x' : order === 3 ? '6' : '0';
            } else if (func === 'sin(x)') {
                if (order % 4 === 1) derivative = 'cos(x)';
                else if (order % 4 === 2) derivative = '-sin(x)';
                else if (order % 4 === 3) derivative = '-cos(x)';
                else derivative = 'sin(x)';
            } else if (func === 'cos(x)') {
                if (order % 4 === 1) derivative = '-sin(x)';
                else if (order % 4 === 2) derivative = '-cos(x)';
                else if (order % 4 === 3) derivative = 'sin(x)';
                else derivative = 'cos(x)';
            } else if (func === 'e^x') {
                derivative = 'e^x';
            } else if (func === 'ln(x)') {
                derivative = order === 1 ? '1/x' : order === 2 ? '-1/x²' : '...';
            } else {
                derivative = 'Use math.js for complex derivatives';
            }
           
            document.getElementById('derivativeResult').innerHTML = `
                <div class="solution-step">
                    <strong>Derivative:</strong><br>
                    ${order === 1 ? 'd' : 'd' + '^' + order}/${order === 1 ? 'dx' : 'dx^' + order} (${func}) = ${derivative}
                </div>
            `;
        });
       
        document.getElementById('calculateIntegral').addEventListener('click', () => {
            const func = document.getElementById('integralFunction').value;
            const from = parseFloat(document.getElementById('integralFrom').value);
            const to = parseFloat(document.getElementById('integralTo').value);
           
            let integral = 0;
            let antiderivative = '';
           
            if (func === 'x^2') {
                antiderivative = 'x³/3';
                integral = (Math.pow(to, 3) - Math.pow(from, 3)) / 3;
            } else if (func === 'x') {
                antiderivative = 'x²/2';
                integral = (to*to - from*from) / 2;
            } else if (func === 'sin(x)') {
                antiderivative = '-cos(x)';
                integral = -Math.cos(to) + Math.cos(from);
            } else if (func === 'cos(x)') {
                antiderivative = 'sin(x)';
                integral = Math.sin(to) - Math.sin(from);
            } else if (func === 'e^x') {
                antiderivative = 'e^x';
                integral = Math.exp(to) - Math.exp(from);
            } else {
                antiderivative = 'Complex integral';
                integral = 'N/A';
            }
           
            document.getElementById('integralResult').innerHTML = `
                <div class="solution-step">
                    <strong>Integral:</strong><br>
                    ∫<sub>${from}</sub><sup>${to}</sup> ${func} dx = ${antiderivative} |<sub>${from}</sub><sup>${to}</sup> = ${typeof integral === 'number' ? integral.toFixed(4) : integral}
                </div>
            `;
        });
    }
   
    function initStatisticsTools() {
        const dataInput = document.getElementById('dataInput');
        const statsResults = document.getElementById('statsResults');
       
        function parseData() {
            const text = dataInput.value;
            return text.split(/[\s,]+/).filter(x => x).map(Number).filter(n => !isNaN(n));
        }
       
        function calculateStats() {
            const data = parseData();
            if (data.length === 0) return;
           
            const n = data.length;
            const sum = data.reduce((a, b) => a + b, 0);
            const mean = sum / n;
            const sorted = [...data].sort((a, b) => a - b);
           
            const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
            const stdDev = Math.sqrt(variance);
           
            const mid = Math.floor(n / 2);
            const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
           
            const freq = {};
            let maxFreq = 0;
            let mode = [];
            data.forEach(num => {
                freq[num] = (freq[num] || 0) + 1;
                if (freq[num] > maxFreq) {
                    maxFreq = freq[num];
                    mode = [num];
                } else if (freq[num] === maxFreq && !mode.includes(num)) {
                    mode.push(num);
                }
            });
           
            const min = Math.min(...data);
            const max = Math.max(...data);
           
            const range = max - min;
           
            const q1 = sorted[Math.floor(n * 0.25)];
            const q3 = sorted[Math.floor(n * 0.75)];
           
            statsResults.innerHTML = `
                <div class="stat-item">
                    <div class="stat-label">Count (n)</div>
                    <div class="stat-value">${n}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Mean (μ)</div>
                    <div class="stat-value">${mean.toFixed(4)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Median</div>
                    <div class="stat-value">${median.toFixed(4)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Mode</div>
                    <div class="stat-value">${mode.join(', ') || 'None'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Std Deviation (σ)</div>
                    <div class="stat-value">${stdDev.toFixed(4)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Variance (σ²)</div>
                    <div class="stat-value">${variance.toFixed(4)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Range</div>
                    <div class="stat-value">${range.toFixed(4)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Minimum</div>
                    <div class="stat-value">${min.toFixed(4)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Maximum</div>
                    <div class="stat-value">${max.toFixed(4)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Q1 (25%)</div>
                    <div class="stat-value">${q1 ? q1.toFixed(4) : 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Q3 (75%)</div>
                    <div class="stat-value">${q3 ? q3.toFixed(4) : 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Sum</div>
                    <div class="stat-value">${sum.toFixed(4)}</div>
                </div>
            `;
        }
       
        document.querySelectorAll('.calc-btn[data-stat]').forEach(btn => {
            btn.addEventListener('click', () => {
                calculateStats();
                showNotification('Statistics calculated', 'success');
            });
        });
       
        calculateStats();
       
        document.getElementById('calculateProbability').addEventListener('click', () => {
            const dist = document.getElementById('probabilityDist').value;
            let result = '';
           
            if (dist === 'normal') {
                const mean = parseFloat(document.getElementById('normalMean').value);
                const std = parseFloat(document.getElementById('normalStd').value);
                const x = parseFloat(document.getElementById('normalX').value);
                const z = (x - mean) / std;
                const pdf = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
                result = `PDF at x=${x}: ${pdf.toFixed(6)}<br>Z-score: ${z.toFixed(4)}`;
            } else if (dist === 'binomial') {
                const n = parseInt(document.getElementById('binomN').value);
                const p = parseFloat(document.getElementById('binomP').value);
                const k = parseInt(document.getElementById('binomK').value);
                const prob = math.combinations(n, k) * Math.pow(p, k) * Math.pow(1-p, n-k);
                result = `P(X = ${k}) = ${prob.toFixed(6)}`;
            }
           
            document.getElementById('probabilityResult').innerHTML = result;
        });
       
        document.getElementById('probabilityDist').addEventListener('change', (e) => {
            document.getElementById('normalParams').style.display = e.target.value === 'normal' ? 'block' : 'none';
            document.getElementById('binomialParams').style.display = e.target.value === 'binomial' ? 'block' : 'none';
        });
    }
   
    function initConverters() {
        document.getElementById('convertLength').addEventListener('click', () => {
            const from = document.getElementById('lengthFrom').value;
            const to = document.getElementById('lengthTo').value;
            const value = parseFloat(document.getElementById('lengthValue').value);
           
            const toMeter = {
                meter: 1,
                kilometer: 1000,
                centimeter: 0.01,
                millimeter: 0.001,
                mile: 1609.344,
                yard: 0.9144,
                foot: 0.3048,
                inch: 0.0254
            };
           
            const result = value * toMeter[from] / toMeter[to];
            document.getElementById('lengthResult').textContent =
                `${value} ${from} = ${result.toFixed(6)} ${to}`;
        });
       
        document.getElementById('convertTemp').addEventListener('click', () => {
            const from = document.getElementById('tempFrom').value;
            const to = document.getElementById('tempTo').value;
            const value = parseFloat(document.getElementById('tempValue').value);
           
            let celsius;
            switch(from) {
                case 'celsius': celsius = value; break;
                case 'fahrenheit': celsius = (value - 32) * 5/9; break;
                case 'kelvin': celsius = value - 273.15; break;
            }
           
            let result;
            switch(to) {
                case 'celsius': result = celsius; break;
                case 'fahrenheit': result = (celsius * 9/5) + 32; break;
                case 'kelvin': result = celsius + 273.15; break;
            }
           
            document.getElementById('tempResult').textContent =
                `${value} °${from.charAt(0).toUpperCase()} = ${result.toFixed(2)} °${to.charAt(0).toUpperCase()}`;
        });
       
        document.getElementById('convertWeight').addEventListener('click', () => {
            const from = document.getElementById('weightFrom').value;
            const to = document.getElementById('weightTo').value;
            const value = parseFloat(document.getElementById('weightValue').value);
           
            const toKg = {
                kilogram: 1,
                gram: 0.001,
                milligram: 0.000001,
                pound: 0.453592,
                ounce: 0.0283495
            };
           
            const result = value * toKg[from] / toKg[to];
            document.getElementById('weightResult').textContent =
                `${value} ${from} = ${result.toFixed(6)} ${to}`;
        });
       
        document.getElementById('useConstant').addEventListener('click', () => {
            const constant = document.getElementById('constantSelect').value;
            const constants = {
                pi: Math.PI,
                e: Math.E,
                c: 299792458,
                g: 9.80665,
                h: 6.62607015e-34,
                avogadro: 6.02214076e23,
                boltzmann: 1.380649e-23,
                electron_mass: 9.10938356e-31,
                proton_mass: 1.6726219e-27,
                neutron_mass: 1.674927471e-27
            };
           
            const value = constants[constant];
            document.getElementById('constantResult').textContent =
                `Value: ${value.toExponential(6)}`;
           
            document.querySelector('.tab-btn[data-tab="calculator"]').click();
            showNotification(`Constant ${value.toExponential(6)} ready to use`, 'info');
        });
    }
   
    setupTabSwitching();
    setupAngleMode();
    initCalculator();
    initMatrixCalculator();
    initEquationSolver();
    initCalculusTools();
    initStatisticsTools();
    initConverters();
});
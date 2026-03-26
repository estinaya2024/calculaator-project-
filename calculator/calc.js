document.addEventListener('DOMContentLoaded', function() {
    showNotification('CalcLab Ready', 'info');
   
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
            memory: parseFloat(localStorage.getItem('calcMemory')) || 0,
            history: JSON.parse(localStorage.getItem('calcHistory')) || [],
            previousAnswer: 0
        };
       
        const displayElement = document.getElementById('display');
        const expressionElement = document.getElementById('expression');
        const buttonsContainer = document.getElementById('buttons');
        const historyListElement = document.getElementById('historyList');
        const clearHistoryButton = document.getElementById('clearHistory');
       
        let isScientificMode = false;
        let isSecondFunction = false;
        let isDegrees = true;
        
        const buttonConfig = [
            // Row 1
            { text: '2nd', class: 'mode', action: 'secondFunction', category: 'advanced' },
            { text: 'π', class: 'const', action: 'pi', category: 'advanced' },
            { text: 'e', class: 'const', action: 'e', category: 'advanced' },
            { text: 'eˣ', class: 'function', action: 'ePower', category: 'advanced' },
            { text: 'x!', class: 'function', action: 'factorial', category: 'advanced' },
            { text: 'C', class: 'clear', action: 'clear', category: 'basic' },
            { text: 'CE', class: 'clear', action: 'clearEntry', category: 'basic' },
            { text: '⌫', class: 'clear', action: 'backspace', category: 'basic' },
            { text: '%', class: 'operator', action: 'percent', category: 'basic' },
            { text: '÷', class: 'operator', action: 'operator', value: '/', category: 'basic' },

            // Row 2
            { text: 'sin', class: 'function', action: 'sin', category: 'advanced' },
            { text: 'cos', class: 'function', action: 'cos', category: 'advanced' },
            { text: 'tan', class: 'function', action: 'tan', category: 'advanced' },
            { text: '√', class: 'function', action: 'sqrt', category: 'advanced' },
            { text: '10ˣ', class: 'function', action: 'tenPower', category: 'advanced' },
            { text: '7', class: 'number', action: 'number', value: '7', category: 'basic' },
            { text: '8', class: 'number', action: 'number', value: '8', category: 'basic' },
            { text: '9', class: 'number', action: 'number', value: '9', category: 'basic' },
            { text: '×', class: 'operator', action: 'operator', value: '*', category: 'basic' },
            { text: '(', class: 'operator', action: 'parenthesis', value: '(', category: 'basic' },

            // Row 3
            { text: 'sin⁻¹', class: 'function', action: 'asin', category: 'advanced' },
            { text: 'cos⁻¹', class: 'function', action: 'acos', category: 'advanced' },
            { text: 'tan⁻¹', class: 'function', action: 'atan', category: 'advanced' },
            { text: '∛', class: 'function', action: 'cbrt', category: 'advanced' },
            { text: 'xʸ', class: 'function', action: 'power', value: '^', category: 'advanced' },
            { text: '4', class: 'number', action: 'number', value: '4', category: 'basic' },
            { text: '5', class: 'number', action: 'number', value: '5', category: 'basic' },
            { text: '6', class: 'number', action: 'number', value: '6', category: 'basic' },
            { text: '-', class: 'operator', action: 'operator', value: '-', category: 'basic' },
            { text: ')', class: 'operator', action: 'parenthesis', value: ')', category: 'basic' },

            // Row 4
            { text: 'sinh', class: 'function', action: 'sinh', category: 'advanced' },
            { text: 'cosh', class: 'function', action: 'cosh', category: 'advanced' },
            { text: 'tanh', class: 'function', action: 'tanh', category: 'advanced' },
            { text: '1/x', class: 'function', action: 'reciprocal', category: 'advanced' },
            { text: '|x|', class: 'function', action: 'abs', category: 'advanced' },
            { text: '1', class: 'number', action: 'number', value: '1', category: 'basic' },
            { text: '2', class: 'number', action: 'number', value: '2', category: 'basic' },
            { text: '3', class: 'number', action: 'number', value: '3', category: 'basic' },
            { text: '+', class: 'operator', action: 'operator', value: '+', category: 'basic' },
            { text: '±', class: 'operator', action: 'plusMinus', category: 'basic' },

            // Row 5
            { text: 'log', class: 'function', action: 'log', category: 'advanced' },
            { text: 'ln', class: 'function', action: 'ln', category: 'advanced' },
            { text: 'log₂', class: 'function', action: 'log2', category: 'advanced' },
            { text: 'EXP', class: 'function', action: 'exp', category: 'advanced' },
            { text: 'Rand', class: 'function', action: 'random', category: 'advanced' },
            { text: '0', class: 'number', action: 'number', value: '0', category: 'basic' },
            { text: '.', class: 'number', action: 'decimal', category: 'basic' },
            { text: '=', class: 'equals', action: 'equals', category: 'basic' },

            // Extra Advanced (Visible only in scientific mode)
            { text: 'mod', class: 'function', action: 'mod', category: 'advanced' },
            { text: 'EE', class: 'function', action: 'scientific', category: 'advanced' },
            { text: 'ANS', class: 'memory', action: 'answer', category: 'advanced' },
            { text: 'MC', class: 'memory', action: 'memoryClear', category: 'advanced' },
            { text: 'MR', class: 'memory', action: 'memoryRecall', category: 'advanced' },
            { text: 'M+', class: 'memory', action: 'memoryAdd', category: 'advanced' },
            { text: 'M-', class: 'memory', action: 'memorySubtract', category: 'advanced' },
            { text: 'MS', class: 'memory', action: 'memoryStore', category: 'advanced' },
            { text: 'x²', class: 'function', action: 'power', value: '2', category: 'advanced' },
            { text: 'x³', class: 'function', action: 'power', value: '3', category: 'advanced' }
        ];
       
        function createButtons() {
            buttonsContainer.innerHTML = '';
            
            // Filter buttons based on mode
            const visibleButtons = isScientificMode 
                ? buttonConfig 
                : buttonConfig.filter(b => b.category === 'basic');
            
            visibleButtons.forEach(button => {
                const buttonElement = document.createElement('button');
                buttonElement.className = `btn ${button.class} ${button.category}`;
                buttonElement.textContent = button.text;
                buttonElement.dataset.action = button.action;
                if (button.value) buttonElement.dataset.value = button.value;
               
                buttonsContainer.appendChild(buttonElement);
            });

            // Update container class for styling
            if (isScientificMode) {
                buttonsContainer.classList.remove('basic-mode');
                buttonsContainer.classList.add('scientific-mode');
            } else {
                buttonsContainer.classList.remove('scientific-mode');
                buttonsContainer.classList.add('basic-mode');
            }
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
            try {
                if (!calculator.expression) return;
                
                // Replace visual operators with math.js compatible ones
                let evalExpr = calculator.expression
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/π/g, 'pi')
                    .replace(/e/g, 'e');
                
                const result = math.evaluate(evalExpr);
                const formattedResult = math.format(result, { precision: 14, upperExp: 10, lowerExp: -10 });
                
                calculator.displayValue = String(formattedResult);
                addToHistory(calculator.expression, formattedResult);
                calculator.previousAnswer = result;
                calculator.firstOperand = null;
                calculator.operator = null;
                calculator.waitingForSecondOperand = true;
                calculator.expression = String(formattedResult);
                updateDisplay();
                showNotification('Calculation complete', 'success');
            } catch (error) {
                showNotification('Invalid Expression', 'error');
                console.error(error);
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
            localStorage.setItem('calcHistory', JSON.stringify(calculator.history));
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
                    case 'clearEntry':
                        backspace();
                        break;
                    case 'backspace':
                        backspace();
                        break;
                    case 'parenthesis':
                        calculator.expression += value;
                        updateDisplay();
                        break;
                    case 'decimal':
                        if (!calculator.displayValue.includes('.')) {
                            calculator.displayValue += '.';
                            calculator.expression += '.';
                            updateDisplay();
                        }
                        break;
                    case 'pi':
                        calculator.expression += 'π';
                        updateDisplay();
                        break;
                    case 'e':
                        calculator.expression += 'e';
                        updateDisplay();
                        break;
                    case 'power':
                        calculator.expression += value === '^' ? '^' : '^' + value;
                        updateDisplay();
                        break;
                    case 'tenPower':
                        calculator.expression += '10^';
                        updateDisplay();
                        break;
                    case 'ePower':
                        calculator.expression += 'e^';
                        updateDisplay();
                        break;
                    case 'sqrt':
                        calculator.expression += 'sqrt(';
                        updateDisplay();
                        break;
                    case 'cbrt':
                        calculator.expression += 'cbrt(';
                        updateDisplay();
                        break;
                    case 'reciprocal':
                        calculator.expression += '1/(';
                        updateDisplay();
                        break;
                    case 'abs':
                        calculator.expression += 'abs(';
                        updateDisplay();
                        break;
                    case 'sin':
                        calculator.expression += isSecondFunction ? 'asin(' : 'sin(';
                        updateDisplay();
                        break;
                    case 'cos':
                        calculator.expression += isSecondFunction ? 'acos(' : 'cos(';
                        updateDisplay();
                        break;
                    case 'tan':
                        calculator.expression += isSecondFunction ? 'atan(' : 'tan(';
                        updateDisplay();
                        break;
                    case 'sinh':
                        calculator.expression += isSecondFunction ? 'asinh(' : 'sinh(';
                        updateDisplay();
                        break;
                    case 'cosh':
                        calculator.expression += isSecondFunction ? 'acosh(' : 'cosh(';
                        updateDisplay();
                        break;
                    case 'tanh':
                        calculator.expression += isSecondFunction ? 'atanh(' : 'tanh(';
                        updateDisplay();
                        break;
                    case 'log':
                        calculator.expression += 'log10(';
                        updateDisplay();
                        break;
                    case 'log2':
                        calculator.expression += 'log2(';
                        updateDisplay();
                        break;
                    case 'ln':
                        calculator.expression += 'log(';
                        updateDisplay();
                        break;
                    case 'exp':
                        calculator.expression += 'exp(';
                        updateDisplay();
                        break;
                    case 'factorial':
                        calculator.expression += '!';
                        updateDisplay();
                        break;
                    case 'random':
                        calculator.expression += 'random()';
                        updateDisplay();
                        break;
                    case 'scientific':
                        calculator.expression += ' * 10^';
                        updateDisplay();
                        break;
                    case 'plusMinus':
                        if (calculator.expression === '0' || calculator.expression === '') {
                            calculator.expression = '-';
                        } else if (calculator.expression.startsWith('-')) {
                            calculator.expression = calculator.expression.substring(1);
                        } else {
                            calculator.expression = '-' + (calculator.expression.includes(' ') ? '(' + calculator.expression + ')' : calculator.expression);
                        }
                        updateDisplay();
                        break;
                    case 'percent':
                        calculator.expression += '%';
                        updateDisplay();
                        break;
                    case 'mod':
                        calculator.expression += ' mod ';
                        updateDisplay();
                        break;
                    case 'answer':
                        calculator.expression += calculator.previousAnswer || 0;
                        updateDisplay();
                        break;
                    case 'memoryClear':
                        calculator.memory = 0;
                        showNotification('Memory Cleared', 'info');
                        break;
                    case 'memoryRecall':
                        calculator.expression += calculator.memory || 0;
                        updateDisplay();
                        break;
                    case 'memoryAdd':
                        try {
                            const val = math.evaluate(calculator.expression);
                            calculator.memory = (calculator.memory || 0) + val;
                            showNotification('Added to Memory', 'info');
                        } catch(e) { showNotification('Invalid expression', 'error'); }
                        break;
                    case 'memorySubtract':
                        try {
                            const val = math.evaluate(calculator.expression);
                            calculator.memory = (calculator.memory || 0) - val;
                            showNotification('Subtracted from Memory', 'info');
                        } catch(e) { showNotification('Invalid expression', 'error'); }
                        break;
                    case 'memoryStore':
                        try {
                            const val = math.evaluate(calculator.expression);
                            calculator.memory = val;
                            showNotification('Stored in Memory', 'info');
                        } catch(e) { showNotification('Invalid expression', 'error'); }
                        break;
                    case 'secondFunction':
                        isSecondFunction = !isSecondFunction;
                        const secondBtn = buttonsContainer.querySelector('[data-action="secondFunction"]');
                        if (secondBtn) secondBtn.classList.toggle('active', isSecondFunction);
                        showNotification(isSecondFunction ? '2nd Function Active' : '2nd Function Inactive', 'info');
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
                } else if (e.key === '(' || e.key === ')') {
                    calculator.expression += e.key;
                    updateDisplay();
                }
            });
           
            clearHistoryButton.addEventListener('click', () => {
                calculator.history = [];
                localStorage.removeItem('calcHistory');
                updateHistoryDisplay();
                showNotification('History cleared', 'success');
            });

            // Scientific Toggle Listener
            const toggleBtn = document.getElementById('toggleScientific');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    isScientificMode = !isScientificMode;
                    toggleBtn.classList.toggle('active', isScientificMode);
                    createButtons();
                    showNotification(isScientificMode ? 'Scientific Mode Enabled' : 'Basic Mode Enabled', 'info');
                });
            }
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
                
                try {
                    switch(op) {
                        case 'add':
                            if (rowsA !== rowsB || colsA !== colsB) throw new Error('Matrices must have same dimensions');
                            displayMatrixResult('A + B =', math.add(matrixA, matrixB));
                            break;
                        case 'subtract':
                            if (rowsA !== rowsB || colsA !== colsB) throw new Error('Matrices must have same dimensions');
                            displayMatrixResult('A - B =', math.subtract(matrixA, matrixB));
                            break;
                        case 'multiply':
                            if (colsA !== rowsB) throw new Error('Columns of A must equal rows of B');
                            displayMatrixResult('A × B =', math.multiply(matrixA, matrixB));
                            break;
                        case 'transposeA':
                            displayMatrixResult('Aᵀ =', math.transpose(matrixA));
                            break;
                        case 'transposeB':
                            displayMatrixResult('Bᵀ =', math.transpose(matrixB));
                            break;
                        case 'inverseA':
                            if (rowsA !== colsA) throw new Error('Matrix A must be square');
                            displayMatrixResult('A⁻¹ =', math.inv(matrixA));
                            break;
                        case 'inverseB':
                            if (rowsB !== colsB) throw new Error('Matrix B must be square');
                            displayMatrixResult('B⁻¹ =', math.inv(matrixB));
                            break;
                        case 'determinantA':
                            if (rowsA !== colsA) throw new Error('Matrix A must be square');
                            const detA = math.det(matrixA);
                            matrixResult.innerHTML = `<pre>det(A) = ${math.format(detA, {precision: 6})}</pre>`;
                            break;
                        case 'determinantB':
                            if (rowsB !== colsB) throw new Error('Matrix B must be square');
                            const detB = math.det(matrixB);
                            matrixResult.innerHTML = `<pre>det(B) = ${math.format(detB, {precision: 6})}</pre>`;
                            break;
                        case 'eigenA':
                            if (rowsA !== colsA) throw new Error('Matrix A must be square');
                            const eigenA = math.eigs(matrixA);
                            displayEigenResult('A', eigenA);
                            break;
                        case 'eigenB':
                            if (rowsB !== colsB) throw new Error('Matrix B must be square');
                            const eigenB = math.eigs(matrixB);
                            displayEigenResult('B', eigenB);
                            break;
                        case 'scalarA':
                            const scalar = parseFloat(document.getElementById('scalarValue').value);
                            displayMatrixResult(`${scalar} × A =`, math.multiply(matrixA, scalar));
                            break;
                        case 'scalarB':
                            const scalar2 = parseFloat(document.getElementById('scalarValue').value);
                            displayMatrixResult(`${scalar2} × B =`, math.multiply(matrixB, scalar2));
                            break;
                    }
                } catch (error) {
                    matrixResult.innerHTML = `<pre style="color: var(--danger)">Error: ${error.message}</pre>`;
                    showNotification(error.message, 'error');
                }
            });
        });

        function displayMatrixResult(label, matrix) {
            const formatted = math.format(matrix, { precision: 4, notation: 'fixed' });
            matrixResult.innerHTML = `<pre>${label}\n${formatted}</pre>`;
        }

        function displayEigenResult(name, eigs) {
            let res = `Eigenvalues of ${name}:\n`;
            res += eigs.values.map(v => math.format(v, {precision: 4})).join(', ') + '\n\n';
            res += `Eigenvectors of ${name}:\n`;
            res += math.format(eigs.vectors, {precision: 4});
            matrixResult.innerHTML = `<pre>${res}</pre>`;
        }
       
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

        document.getElementById('solveCustom').addEventListener('click', () => {
            const eq = document.getElementById('customEquation').value;
            if (!eq) return;

            try {
                // Simplified solver: evaluate at various points or use math.evaluate
                // For a proper solver, we'd need a root-finding algorithm.
                // Let's use a simple Bisection method if we can find a sign change.
                const node = math.parse(eq.split('=')[0]);
                const code = node.compile();
                const f = (x) => code.evaluate({x: x});

                // Find roots in range [-100, 100]
                let roots = [];
                for (let i = -100; i < 100; i += 0.5) {
                    let x1 = i, x2 = i + 0.5;
                    let y1 = f(x1), y2 = f(x2);
                    if (y1 * y2 <= 0) {
                        // Bisection
                        let a = x1, b = x2;
                        for (let j = 0; j < 20; j++) {
                            let mid = (a + b) / 2;
                            if (f(a) * f(mid) <= 0) b = mid;
                            else a = mid;
                        }
                        roots.push((a + b) / 2);
                    }
                }

                if (roots.length === 0) {
                    equationResult.innerHTML = '<div class="solution-step"><strong>No Real Roots Found</strong> in range [-100, 100].</div>';
                } else {
                    let resultHTML = '<div class="solution-step"><strong>Custom Equation Roots:</strong><br>';
                    roots.forEach((r, idx) => {
                        resultHTML += `x<sub>${idx+1}</sub> = ${r.toFixed(6)}<br>`;
                    });
                    resultHTML += '</div>';
                    equationResult.innerHTML = resultHTML;
                }
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            }
        });

        document.querySelector('.eq-type-btn[data-eq-type="2x2"]').click();
    }
   
    function initCalculusTools() {
        document.getElementById('calculateLimit').addEventListener('click', () => {
            const func = document.getElementById('limitFunction').value;
            const pointStr = document.getElementById('limitPoint').value;
            const direction = document.querySelector('.limit-dir-btn.active').dataset.direction;
           
            let point;
            if (pointStr.toLowerCase() === 'inf' || pointStr === '∞') point = Infinity;
            else if (pointStr.toLowerCase() === '-inf' || pointStr === '-∞') point = -Infinity;
            else point = parseFloat(pointStr);

            if (isNaN(point) && point !== Infinity && point !== -Infinity) {
                showNotification('Invalid limit point', 'error');
                return;
            }

            try {
                const node = math.parse(func);
                const code = node.compile();
               
                const evaluateAt = (x) => {
                    try { return code.evaluate({x: x}); } catch(e) { return NaN; }
                };

                let result;
                if (point === Infinity) {
                    result = evaluateAt(1e10);
                } else if (point === -Infinity) {
                    result = evaluateAt(-1e10);
                } else {
                    const eps = [1e-3, 1e-6, 1e-9];
                    let leftLimits = eps.map(e => evaluateAt(point - e));
                    let rightLimits = eps.map(e => evaluateAt(point + e));
                   
                    if (direction === 'left') result = leftLimits[2];
                    else if (direction === 'right') result = rightLimits[2];
                    else {
                        const left = leftLimits[2];
                        const right = rightLimits[2];
                        if (Math.abs(left - right) < 1e-4) result = (left + right) / 2;
                        else result = 'Limit does not exist (left and right limits differ)';
                    }
                }

                document.getElementById('limitResult').innerHTML = `
                    <div class="solution-step">
                        <strong>Limit Result:</strong><br>
                        lim<sub>x→${pointStr}</sub> ${func} = ${typeof result === 'number' ? result.toFixed(6) : result}
                    </div>
                `;
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            }
        });
       
        document.getElementById('calculateDerivative').addEventListener('click', () => {
            const func = document.getElementById('derivativeFunction').value;
            const variable = document.getElementById('derivativeVar').value || 'x';
            const order = parseInt(document.getElementById('derivativeOrder').value);
           
            try {
                let derivative = func;
                for (let i = 0; i < order; i++) {
                    derivative = math.derivative(derivative, variable).toString();
                }

                document.getElementById('derivativeResult').innerHTML = `
                    <div class="solution-step">
                        <strong>Derivative Result:</strong><br>
                        ${order === 1 ? 'd' : 'd' + '^' + order}/${order === 1 ? 'd' + variable : 'd' + variable + '^' + order} (${func}) = ${derivative}
                    </div>
                `;
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            }
        });
       
        document.getElementById('calculateIntegral').addEventListener('click', () => {
            const func = document.getElementById('integralFunction').value;
            const from = parseFloat(document.getElementById('integralFrom').value);
            const to = parseFloat(document.getElementById('integralTo').value);
            const variable = document.getElementById('integralVar').value || 'x';
           
            try {
                const node = math.parse(func);
                const code = node.compile();
               
                // Simpson's Rule
                const n = 1000;
                const h = (to - from) / n;
                let sum = code.evaluate({[variable]: from}) + code.evaluate({[variable]: to});

                for (let i = 1; i < n; i++) {
                    const x = from + i * h;
                    sum += (i % 2 === 0 ? 2 : 4) * code.evaluate({[variable]: x});
                }

                const result = (h / 3) * sum;

                document.getElementById('integralResult').innerHTML = `
                    <div class="solution-step">
                        <strong>Integral Result:</strong><br>
                        ∫<sub>${from}</sub><sup>${to}</sup> ${func} d${variable} ≈ ${result.toFixed(6)}
                    </div>
                    <div class="solution-step">
                        <small>Calculated using Simpson's Rule (n=1000)</small>
                    </div>
                `;
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            }
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
            } else if (dist === 'poisson') {
                const lambda = parseFloat(document.getElementById('poissonLambda').value);
                const k = parseInt(document.getElementById('poissonK').value);
                const prob = (Math.pow(lambda, k) * Math.exp(-lambda)) / math.factorial(k);
                result = `P(X = ${k}) = ${prob.toFixed(6)}`;
            } else if (dist === 'uniform') {
                const a = parseFloat(document.getElementById('uniformA').value);
                const b = parseFloat(document.getElementById('uniformB').value);
                const x = parseFloat(document.getElementById('uniformX').value);
                if (x < a || x > b) result = 'f(x) = 0 (outside range [a, b])';
                else result = `f(x) = ${ (1 / (b - a)).toFixed(6) } (within range [a, b])`;
            }
           
            document.getElementById('probabilityResult').innerHTML = result;
        });
       
        document.getElementById('probabilityDist').addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('normalParams').style.display = val === 'normal' ? 'block' : 'none';
            document.getElementById('binomialParams').style.display = val === 'binomial' ? 'block' : 'none';
            document.getElementById('poissonParams').style.display = val === 'poisson' ? 'block' : 'none';
            document.getElementById('uniformParams').style.display = val === 'uniform' ? 'block' : 'none';
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
   
    function initGraphing() {
        const canvas = document.getElementById('graphCanvas');
        const ctx = canvas.getContext('2d');
        const sidebar = document.getElementById('graphSidebar');
        const closeBtn = document.getElementById('closeSidebar');
        const openBtn = document.getElementById('openSidebar');
        let chart;

        if (closeBtn && openBtn && sidebar) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.add('collapsed');
                openBtn.style.display = 'flex';
                // Trigger chart resize after animation
                setTimeout(() => { if (chart) chart.resize(); }, 450);
            });

            openBtn.addEventListener('click', () => {
                sidebar.classList.remove('collapsed');
                openBtn.style.display = 'none';
                // Trigger chart resize after animation
                setTimeout(() => { if (chart) chart.resize(); }, 450);
            });
        }

        const colors = [
            { border: '#111111', bg: 'rgba(17, 17, 17, 0.05)' }, // f1: black
            { border: '#666666', bg: 'rgba(102, 102, 102, 0.05)' }, // f2: grey
            { border: '#999999', bg: 'rgba(153, 153, 153, 0.05)' }  // f3: light grey
        ];

        document.getElementById('plotGraph').addEventListener('click', () => {
            const f1 = document.getElementById('graphFunction').value;
            const f2 = document.getElementById('graphFunction2').value;
            const f3 = document.getElementById('graphFunction3').value;
            const xMin = parseFloat(document.getElementById('graphXMin').value) || -10;
            const xMax = parseFloat(document.getElementById('graphXMax').value) || 10;
            const yMin = parseFloat(document.getElementById('graphYMin').value) || -10;
            const yMax = parseFloat(document.getElementById('graphYMax').value) || 10;
            const userStep = parseFloat(document.getElementById('graphStep').value) || 0.1;

            const funcs = [f1, f2, f3].filter(f => f.trim() !== '');
            const datasets = [];

            try {
                funcs.forEach((func, idx) => {
                    const node = math.parse(func);
                    const code = node.compile();
                    const data = [];
                    
                    for (let x = xMin; x <= xMax; x += userStep) {
                        try {
                            const y = code.evaluate({x: x});
                            if (typeof y === 'number' && isFinite(y)) {
                                data.push({x: x, y: y});
                            } else {
                                data.push({x: x, y: null});
                            }
                        } catch (e) {
                            data.push({x: x, y: null});
                        }
                    }

                    datasets.push({
                        label: `f${idx+1}(x) = ${func}`,
                        data: data,
                        borderColor: colors[idx].border,
                        backgroundColor: colors[idx].bg,
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        tension: 0.1,
                        showLine: true
                    });
                });

                if (chart) chart.destroy();
                
                const style = getComputedStyle(document.documentElement);
                const textColor = style.getPropertyValue('--text-primary').trim() || '#111111';
                const gridColor = 'rgba(173, 216, 230, 0.4)'; // light blue grid
                const axisColor = '#333333';

                // Custom plugin for arrows and labels
                const axisArrows = {
                    id: 'axisArrows',
                    afterDraw: (chart) => {
                        const {ctx, chartArea: {top, bottom, left, right}, scales: {x, y}} = chart;
                        ctx.save();
                        ctx.strokeStyle = axisColor;
                        ctx.fillStyle = axisColor;
                        ctx.lineWidth = 2;

                        const drawArrow = (ax, ay, angle) => {
                            ctx.save();
                            ctx.translate(ax, ay);
                            ctx.rotate(angle);
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(-8, -4);
                            ctx.lineTo(-8, 4);
                            ctx.closePath();
                            ctx.fill();
                            ctx.restore();
                        };

                        const y0 = y.getPixelForValue(0);
                        const x0 = x.getPixelForValue(0);

                        // Draw X-axis
                        if (y0 >= top && y0 <= bottom) {
                            ctx.beginPath();
                            ctx.moveTo(left, y0);
                            ctx.lineTo(right, y0);
                            ctx.stroke();
                            drawArrow(right, y0, 0);
                            drawArrow(left, y0, Math.PI);
                            ctx.font = 'bold 12px Inter';
                            ctx.fillText('x', right - 10, y0 + 15);
                        }

                        // Draw Y-axis
                        if (x0 >= left && x0 <= right) {
                            ctx.beginPath();
                            ctx.moveTo(x0, top);
                            ctx.lineTo(x0, bottom);
                            ctx.stroke();
                            drawArrow(x0, top, -Math.PI/2);
                            drawArrow(x0, bottom, Math.PI/2);
                            ctx.font = 'bold 12px Inter';
                            ctx.fillText('y', x0 + 10, top + 10);
                        }
                        ctx.restore();
                    }
                };

                chart = new Chart(ctx, {
                    type: 'scatter',
                    data: { datasets },
                    plugins: [axisArrows],
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 0 },
                        scales: {
                            x: { 
                                type: 'linear',
                                position: 'center',
                                grid: { color: gridColor, lineWidth: 1, drawBorder: false }, 
                                ticks: { 
                                    color: textColor,
                                    callback: function(value) { return value === 0 ? '' : value; }
                                },
                                min: xMin,
                                max: xMax
                            },
                            y: { 
                                type: 'linear',
                                position: 'center',
                                grid: { color: gridColor, lineWidth: 1, drawBorder: false }, 
                                ticks: { 
                                    color: textColor,
                                    callback: function(value) { return value === 0 ? '' : value; }
                                },
                                min: yMin,
                                max: yMax
                            }
                        },
                        plugins: {
                            legend: { 
                                display: true,
                                position: 'top',
                                labels: { color: textColor, boxWidth: 12, usePointStyle: true }
                            },
                            tooltip: { enabled: true, mode: 'nearest', intersect: false },
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'xy',
                                    threshold: 5,
                                },
                                zoom: {
                                    wheel: { enabled: true, speed: 0.1 },
                                    pinch: { enabled: true },
                                    mode: 'xy',
                                },
                                limits: {
                                    x: { min: -1000, max: 1000 },
                                    y: { min: -1000, max: 1000 }
                                }
                            }
                        }
                    }
                });

                // Reset Graph View
                const resetBtn = document.getElementById('resetGraph');
                if (resetBtn) {
                    resetBtn.onclick = () => {
                        chart.resetZoom();
                        showNotification('View Reset', 'info');
                    };
                }

                showNotification('Functions plotted successfully. Scroll to zoom, drag to pan!', 'success');
            } catch (error) {
                showNotification(`Graph Error: ${error.message}`, 'error');
            }
        });
    }

    function initProgrammerMode() {
        const decInput = document.getElementById('progDec');
        const hexDisp = document.getElementById('progHex');
        const octDisp = document.getElementById('progOct');
        const binDisp = document.getElementById('progBin');
        
        const bitA = document.getElementById('bitA');
        const bitB = document.getElementById('bitB');
        const bitOp = document.getElementById('bitOp');
        const bitResult = document.getElementById('bitwiseResult');

        function updateAllFromDecimal(val) {
            decInput.value = val;
            hexDisp.textContent = val.toString(16).toUpperCase();
            octDisp.textContent = val.toString(8);
            binDisp.textContent = val.toString(2);
        }

        decInput.addEventListener('input', () => {
            const val = parseInt(decInput.value) || 0;
            updateAllFromDecimal(val);
        });

        // Add direct base interaction (clickable/editable regions)
        [hexDisp, octDisp, binDisp].forEach(disp => {
            disp.style.cursor = 'pointer';
            disp.title = 'Click to edit this value';
            disp.addEventListener('click', () => {
                const base = disp.id === 'progHex' ? 16 : (disp.id === 'progOct' ? 8 : 2);
                const currentVal = disp.textContent;
                const newValue = prompt(`Enter ${disp.id.replace('prog', '')} value:`, currentVal);
                if (newValue !== null) {
                    const decVal = parseInt(newValue, base);
                    if (!isNaN(decVal)) {
                        updateAllFromDecimal(decVal);
                        showNotification('Base conversion updated', 'success');
                    } else {
                        showNotification('Invalid value for base ' + base, 'error');
                    }
                }
            });
        });

        document.getElementById('calcBitwise').addEventListener('click', () => {
            const a = parseInt(bitA.value) || 0;
            const b = parseInt(bitB.value) || 0;
            const op = bitOp.value;
            let res;
            let opChar;

            switch(op) {
                case 'and': res = a & b; opChar = '&'; break;
                case 'or': res = a | b; opChar = '|'; break;
                case 'xor': res = a ^ b; opChar = '^'; break;
                case 'not': res = ~a; opChar = '~'; break;
                case 'lsh': res = a << b; opChar = '<<'; break;
                case 'rsh': res = a >> b; opChar = '>>'; break;
            }

            bitResult.innerHTML = op === 'not' ? `${opChar}${a} = ${res}` : `${a} ${opChar} ${b} = ${res}`;
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
    initGraphing();
    initProgrammerMode();
});
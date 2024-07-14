import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FomulaConverterService {
  private formula: any = null;
  private operators = ['+', '-', '*', '/', '%'];

  // Function to add parentheses according to BODMAS rule
  private addParentheses(expression) {
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
    const opsStack = [];
    const exprStack = [];

    for (let i = 0; i < expression.length; i++) {
      if (this.isOperator(expression[i])) {
        while (opsStack.length && precedence[opsStack[opsStack.length - 1]] >= precedence[expression[i]]) {
          exprStack.push(opsStack.pop());
        }
        opsStack.push(expression[i]);
      } else if (expression[i] === '(') {
        opsStack.push(expression[i]);
      } else if (expression[i] === ')') {
        while (opsStack.length && opsStack[opsStack.length - 1] !== '(') {
          exprStack.push(opsStack.pop());
        }
        opsStack.pop(); // remove '('
      } else {
        let operand = '';
        while (i < expression.length && !this.isOperator(expression[i]) && expression[i] !== '(' && expression[i] !== ')') {
          operand += expression[i++];
        }
        i--;
        exprStack.push(operand);
      }
    }

    while (opsStack.length) {
      exprStack.push(opsStack.pop());
    }

    return this.buildExpression(exprStack);
  }

  // Function to build the expression with parentheses
  private buildExpression(exprStack) {
    const stack = [];
    exprStack.forEach(token => {
      if (this.isOperator(token)) {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(`(${a}${token}${b})`);
      } else {
        stack.push(token);
      }
    });
    return stack[0];
  }

  // Check if a character is an operator
  private isOperator(char) {
    return this.operators.includes(char);
  }

  // Function to convert infix to prefix
  private infixToPrefix(infix) {
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
    const opsStack = [];
    const prefixStack = [];

    for (let i = infix.length - 1; i >= 0; i--) {
      if (this.isOperator(infix[i])) {
        while (opsStack.length && precedence[opsStack[opsStack.length - 1]] > precedence[infix[i]]) {
          prefixStack.push(opsStack.pop());
        }
        opsStack.push(infix[i]);
      } else if (infix[i] === ')') {
        opsStack.push(infix[i]);
      } else if (infix[i] === '(') {
        while (opsStack.length && opsStack[opsStack.length - 1] !== ')') {
          prefixStack.push(opsStack.pop());
        }
        opsStack.pop(); // remove ')'
      } else {
        let operand = '';
        while (i >= 0 && !this.isOperator(infix[i]) && infix[i] !== '(' && infix[i] !== ')') {
          operand = infix[i--] + operand;
        }
        i++;
        prefixStack.push(operand);
      }
    }

    while (opsStack.length) {
      prefixStack.push(opsStack.pop());
    }

    return prefixStack.reverse().join('');
  }

  // Validate the formula
  validateFormula(formula) {
    this.formula = formula.replace(/\s+/g, ''); // Remove any whitespace
    const stack = [];
    const validChars = /[a-z0-9.%]/i;
    for (let i = 0; i < this.formula.length; i++) {
      const char = this.formula[i];
      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        if (!stack.length) {
          return false; // Unmatched closing parenthesis
        }
        stack.pop();
      } else if (!this.isOperator(char) && !validChars.test(char)) {
        return false; // Invalid character
      } else if (char === '.' && (i === 0 || !/[0-9]/.test(this.formula[i + 1]))) {
        return false; // Decimal point must be followed by a digit
      }
    }
    return stack.length === 0; // Ensure all opened parentheses are closed
  }

  // Validate and convert formula
  validateAndConvert(formula: string) {
    if (!this.validateFormula(formula)) {
      return { error: 'Invalid formula format' };
    }

    const infixWithParentheses = this.addParentheses(this.formula);
    const prefixExpression = this.infixToPrefix(infixWithParentheses);
    return { infixWithParentheses, prefixExpression };
  }
}

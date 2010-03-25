/**
 * Parser to parse R code into expression trees.
 */

Ext.ns('rnode.R');

rnode.R.Parser = function () {
    this.parser = make_r_parser();
};


rnode.R.ParsedCommand = function (input, ast) {
    this.ast = ast;
    this.originalScript = input;
    this.touched = false;
};

rnode.R.Parser = Ext.extend (rnode.R.Parser, {
    parse: function (s) {
        var originalScript = s;
        var alteredScript = s;
        if (s.search(/;\s*$/) == -1) 
            alteredScript = alteredScript + ';';
        var ast = this.parser (alteredScript);
        return new rnode.R.ParsedCommand(originalScript, ast);
    }
});

rnode.R.ParsedCommand = Ext.extend (rnode.R.ParsedCommand, {

    isSupported: function () {
        return true;
    },

    isFunction: function () {
        return this.ast.id == '(';
    },

    getFunctionName: function () {
        return this.isFunction() ? this.ast.first.value : null;
    },

    isLiteral: function () {
        return this.ast.id == '(literal)';
    },

    getLiteralValue: function () {
        if (!this.isLiteral()) 
            throw new Error ('Parsed command value is not a literal and getLiteralValue() called.');

        return this.ast.value;
    },

    isGraph: function () {
        var graphFunctions = ['hist', 'plot'];

        if (!this.isFunction()) 
            return false;

        var name = this.ast.first.value;
        var g = false;

        graphFunctions.forEach (function (n) { 
            g = g || n == name;
        });

        return g;
    },

    get: function (from) {
        if (!this.touched && !from)
            return this.originalScript;

        // Do a depth first rebuild of the command from the AST
        var f = function (c) {
            if (typeof c === 'object' && c.length) { // an array
                var ret = '';
                for (i = 0; i < c.length; ++i) {
                    if (i != 0) 
                        ret += ',';
                    ret += f(c[i]);
                }
                return ret;
            } else if (c.arity == 'binary') {
                var ret = f(c.first) + c.value + f(c.second);
                if (c.id == '(')
                    ret += ')';
                return ret;
            } else if (c.arity == 'name') {
                return c.value;
            } else if (c.arity == 'literal') {
                return c.value;
            }
            return '';
        }

        return f(from || this.ast);
    },

    isAssignment: function () {
        return this.ast.id == '<-';
    },

    getAssignmentVariable: function () {
        if (isAssignment())
            return this.ast.first.value;

        return null;
    },

    extractParameter: function (functionName, parameterNumber, parameterName) {
        if (!Ext.isArray(this.ast.second)) {
            return null;
        }

        // First, if we have a name, look for it
        if (parameterName) {
            Ext.each(this.ast.second, function (p) {
                if (p.id == '=' && p.first && p.first.id == '(name)' && p.first.value == parameterName) {
                    return new rnode.R.ParsedCommand(this.get (p), p);
                }
            }, this);
        } 

        // If we can't find the named parameter, look at the length
        if (parameterNumber != null) {
            if (this.ast.second.length > parameterNumber) {
                var param = this.ast.second[parameterNumber];
                return new rnode.R.ParsedCommand(this.get(param), param);
            }
        }

        return null;
    },

    extractAllParameters: function (functionName) {
        // Do a depth first search for the function name.
        // well, we will eventually... when we need to.
        var c = this.ast;

        if (!c.first || c.first.value != functionName)
            throw new Error ('extractAllParameters: need to implement search');

        // c's second is the array of parameters
        var retval = {};
        var counter = 0;
        Ext.each(c.second, function (p) {
            if (p.id == '=')
                retval[p.first.value] = new rnode.R.ParsedCommand(this.get(p.second), p.second);
            else
                retval[counter] = new rnode.R.ParsedCommand (this.get (p), p);
            counter ++;
        }, this);

        return retval;
    },

    adjustFunctionParameter: function (functionName, parameterName, parameterValue) {
        // Do a depth first search for the function name.
        // well, we will eventually... when we need to.
        var c = this.ast;

        if (!c.first || c.first.value != functionName)
            throw new Error ('adjustFunctionParameter: need to implement search');

        // c's second is an array of parameters
        c.second.forEach(function (p) {
            if (p.value.toLowerCase() == parameterName) {
                p.second.value = parameterValue;
                return true;
            }
        });

        // If we haven't found it yet, add it.
        c.second.push ({
            id: '=', value: '=', arity: 'binary', 
            first: { id: '(name)', value: parameterName, arity: 'name' },
            second: { id: '(name)', value: parameterValue, arity: 'name' }
        });

        this.touched = true;

        return true;
    }
});


/**
 * Parser to parse R code into expression trees.
 */

Ext.ns ('rnode.R.commands');

rnode.R.Parser = function () {
    this.parser = make_r_parser();
};


rnode.R.ParsedCommand = function (input, ast) {
    this.ast = ast;
    this.originalScript = input;
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

    get: function () {
        return this.originalScript;
    },

    isAssignment: function () {
        return this.ast.id == '<-';
    },

    getAssignmentVariable: function () {
        if (isAssignment())
            return this.ast.first.value;

        return null;
    }
});


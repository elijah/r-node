/**
 * Parser to parse R code into expression trees.
 */

Ext.ns ('rnode.R');

rnode.R.Parser = function () {
    this.build();
};

rnode.R.ParsedCommand = function (symbolTree) {
    this.symbolTree = symbolTree;
};

rnode.R.Parser = Ext.extend (rnode.R.Parser, {

    build: function() {
        this.grammar = {};
        /*with ( Parser.Operators ) {
          var g = Behaviors.Stylesheet.Grammar; 
          var t = Behaviors.Stylesheet.Translator;
          // basic tokens
          g.lbrace = token('{'); g.rbrace = token('}');
          g.lparen = token(/\(/); g.rparen = token(/\)/);
          g.colon = token(':'); g.semicolon = token(';');
          // attributes
          g.attrName = token(/[\w\-\d]+/); 
          g.attrValue = token(/[^;\}]+/); 
          g.attr = pair(g.attrName,g.attrValue,g.colon);
          g.attrList = list(g.attr,g.semicolon,true);
          g.style = process(
            between(g.lbrace,g.attrList,g.rbrace),t.style);
          // style rules
          g.selector = token(/[^\{]+/); 
          g.rule = each(g.selector,g.style); 
          g.rules = process(many(g.rule),t.rules);
          // comments
          g.inlineComment = token(/\x2F\x2F[^\n]\n/);
          g.multilineComment = token(/\x2F\x2A.*?\x2A\x2F/);
          g.comments = ignore(
            any(g.inlineComment,g.multilineComment));
          // parser
          Behaviors.Stylesheet._parse = process(
            many(any(g.comments,g.rules)),t.parse);
        }*/
    },

    parse: function (s) {
        var trimmed = s.replace(/^\s+/, '');
        trimmed = trimmed.replace(/\s+$/, '');

        if (trimmed.search (/^hist/) == 0 && trimmed.search (/plot.*=.*false/i) == -1) {
            trimmed = trimmed.replace (/hist\s*\(/, "hist(plot=FALSE,");
        }

        if (trimmed.match (/^\?/) ||
            trimmed.match (/^help/)) {
        }

        return new rnode.R.ParsedCommand(trimmed);
    }
});

rnode.R.ParsedCommand = Ext.extend (rnode.R.ParsedCommand, {

    isSupported: function () {
        return true;
    },

    isGraph: function () {
        return this.symbolTree.match (/^\s*hist\s*\(/) != null;
    },

    get: function () {
        return this.symbolTree;
    },

    isAssignment: function () {
     //   return s.match (/\s*[A-Za-z_]+\s*/) != null || s.match (/\s*[A-Za-z_]+\s*<-.*/) != null;
    },

    getAssignmentVariable: function () {
    //
     //   if (s.match (/\s*[A-Za-z_]+\s*/) != null) {
      //      var trimmed = s.replace(/^\s+/, '');
      //      return trimmed.replace(/\s+$/, '');
      //  }
      //
      //  if (s.match(/\s*[A-Za-z_]+\s*<-.*/) != null) {
      //      var t = s.replace (/<-.*/, '');
      //      t = s.replace(/^\s+/, '');
      //      return t.replace(/\s+$/, '');
      //  }
      //  return null;
    }
});

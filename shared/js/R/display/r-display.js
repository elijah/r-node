/**
 * Display functions for displaying R results.
 */

Ext.ns ('rnode.display');

rnode.display.Display = function () {
}

rnode.display.Display = Ext.extend (rnode.display.Display, { });

rnode.display.Display.register = function (class, constructor) {
    rnode.display.Display.availableDisplayFunctions = rnode.display.Display.availableDisplayFunctions || {};
    rnode.display.Display.availableDisplayFunctions[class] = constructor;
}

rnode.display.Display.find = function (robject) {
    if (robject.isArray()) {
        return new rnode.display.DisplayArray();
    }

    return new rnode.display.Display.availableDisplayFunctions[robject.class()] ();
}


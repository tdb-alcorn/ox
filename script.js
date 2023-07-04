function display(expr, label) {
  result = document.getElementById('result');
  if (label) {
    result.append(label);
    result.append("\n");
  }
  result.append(JSON.stringify(expr, null, 2));
  result.append("\n\n");
}


function evaluate(tree, expr) {
  // returns another tree as the result

  // implement call first
  if (expr["call"]) {
    const fn = get(tree, expr["call"]);
    const args = expr["args"];
    // evaluate each arg first
    const evaldArgs = {};
    for (const arg in args) {
      evaldArgs[arg] = evaluate(tree, args[arg]);
    }
    result = fn["impl"](evaldArgs);
    return result;
  }

  // implement set
  if (expr["set"]) {
    return set(tree, expr["set"], expr["value"]);
  }

  // implement refer
  if (expr["refer"]) {
    return get(tree, expr["refer"]);
  }

  if (expr["type"]) {
    // its a base object, just return it
    return expr;
  }

  throw "not implemented";
}

function get(tree, path) {
  parts = path.split(".");
  result = tree;
  for (i=0; i<parts.length; i++) {
    part = parts[i];
    if (result[part]) {
      result = result[part];
    } else {
      throw ("not found: " + path);
    }
  }
  return result;
}

function set(tree, path, value) {
  parts = path.split(".");
  result = tree;
  for (i=0; i<(parts.length-1); i++) {
    part = parts[i];
    if (!result[part]) {
      // create missing part of path
      result[part] = {};
    }
    result = result[part];
  }
  result[parts[parts.length-1]] = value;
  return tree;
}

function intAddImpl(args) {
  resultValue = args["left"]["value"] + args["right"]["value"];
  return {
    "type":"int",
    "value":resultValue
    };
  }

function eq(args) {
  // ghetto deep equals
  result = JSON.stringify(args["left"]) == JSON.stringify(args["right"]);
  return {
    "type": "bool",
    "value": result
  };
}

function ifImpl(args) {
  console.log(args);
  if (args["cond"]["value"]) {
    return args["true"];
  }
  return args["false"];
}

// macros

function expandMacro(tree, expr) {
  if (expr["macro"]) {
    fn = get(tree, expr["macro"]);
    args = expr["args"];
    result = fn["impl"](args);
    return result;
  }
}


///// examples ////

tree = {
  "int": {
    "add": {
      "type": "function",
      "args": { "left":"int", "right":"int"},
      "impl": intAddImpl
      }
    }
  };

one = {
  "type":"int",
  "value":1
  };

two = {
  "type":"int",
  "value":2
  };

expr = {
  "call": "int.add",
  "args": {
    "left": one,
    "right": two
    }
  };

display(evaluate(tree, expr), "expr");

expr2 = {
  "set": "foo.bar",
  "value": {
    "type":"int",
    "value": 4
  }
};

display(evaluate(tree, expr2), "expr2");

expr3 = {
  "refer":"foo.bar"
};

display(evaluate(tree, expr3), "expr3");

tree["eq"] = {
  "type": "function",
  "args": {
    "left": "any",
    "right": "any"
  },
  "impl": eq
};

otherOne = {
  "type": "int",
  "value": 1
};

expr4 = {
  "call": "eq",
  "args": {
    "left": one,
    "right": otherOne
  }
};

display(evaluate(tree, expr4), "expr4");

tree["if"] = {
  "type":"function",
  "args": {
    "cond": "bool",
    "true": "any",
    "false": "any"
  },
  "impl": ifImpl
};
  

expr5 = {
  "call": "if",
  "args": {
    "cond": {
      "call": "eq",
      "args": {
        "left": one,
        "right": otherOne
      }
    },
    "true": one,
    "false": two
  }
};

display(evaluate(tree, expr5), "expr5");
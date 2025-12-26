export const contextSafetyRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Ensure ai.ref and ai.capability are used safely within agent context",
    },
    messages: {
      unsafeUsage: "Usage of {{method}} outside of an agent context is unsafe. Wrap it in a useEffect or ensure it's bound to an agent.",
    },
  },
  create(context: any) {
    return {
      CallExpression(node: any) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "ai" &&
          (node.callee.property.name === "ref" || node.callee.property.name === "capability")
        ) {
          let current = node.parent;
          let isSafe = false;

          while (current && current.type !== "Program") {
            if (
              current.type === "FunctionDeclaration" ||
              current.type === "FunctionExpression" ||
              current.type === "ArrowFunctionExpression" ||
              current.type === "ClassMethod"
            ) {
              isSafe = true;
              break;
            }
            current = current.parent;
          }

          if (!isSafe) {
            context.report({
              node,
              messageId: "unsafeUsage",
              data: {
                method: `ai.${node.callee.property.name}`,
              },
            });
          }
        }
      },
    };
  },
};

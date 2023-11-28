function createDom(fiber) {
     const dom = element.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type)

    const isProperty = key => key !== "children"
    Object.keys(element.props).filter(isProperty).forEach(name => {
        dom[name] = element.props[name]
    })

    
    return dom;
    
}

function updateDom(dom, prevProps, nextProps) {
    // TODO
}

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }

    const domParent = fiber.parent.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props,
        )

    } else if (fiber.effectTag === "DELETION") {
        domParent.removeChild(fiber.dom)
    }

    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}


function render(element, container) {
    wipRoot = {
        dom: container, 
        props: {
            children: [element],
        },
        alternate: currentRoot,
    }
    deletions = []
   
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop);
}

function performUnitOfWork(nextUnitOfWork) {

    // add dom node
     if (!fiber.dom) {
        fiber.dom = createDom(fiber)
     }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }
    //  create new fibers
    const elements = fiber.props.children;
    reconcileChildren(fiber, elements)
 
    
    // search for next unit of work, first try with child, then sibling, then with uncle
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber != null) {
        const element = elements[index];

        let newFiber = null;

        // compare oldFiber to element
        const sameType = oldFiber && element && element.type == oldFiber.type;

        if (sameType) {
            // if they are the same type, update the node with newFiber
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE"
            }
            
        }
        if (element && !sameType) {
            // if element exists, but they are not the same type, add this node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }

        if (oldFiber && !sameType) {
            //TODO if types are different, and it is an oldFiber, we delete the oldFiber's node
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber)
        }

        // const newFiber = {
        //     type: element.type,
        //     props: element.props, 
        //     parent: fiber,
        //     dom: null,
        // }
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibiling = newFiber;
        index++;
    }
}

const Didact = {
    createElement,
    render,
}

const element = Didact.createElement(
    "div",
    { id: "foo" },
    Didact.createElement("a", null, "bar"),
    Didact.createElement("h1", null, "H1 title"),
    Didact.createElement("b")
)

// const element = {
//     type: "h1",
//     props: {
//         title: "foo",
//         children: "Hello"
//     }
// }

const container = document.getElementById("root");
Didact.render(element, container)

// const node = document.createElement(element.type)
// node["title"] = element.props.title;

// const text = document.createTextNode("")
// text["nodeValue"] = element.props.children;

// node.appendChild(text);
// container.appendChild(node)

function createElement(type, props, ...children) {
    console.log(`type: ${type}, props: ${props}, children: ${children}`)
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === "object" ? child : createTextElement(child)),
        }
    }
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        }
    }
}
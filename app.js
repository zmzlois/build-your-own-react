function createDom(fiber) {
     const dom = element.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type)

    const isProperty = key => key !== "children"
    Object.keys(element.props).filter(isProperty).forEach(name => {
        dom[name] = element.props[name]
    })

    // problem: this will create a recursive call, which will block the main thread
    element.props.children.forEach(child => render(child, dom))

    container.appendChild(dom);
    return dom;
    
}

function commitRoot() {
    commitWork(wipRoot.child)
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }

    const domParent = fiber.parent.dom;
    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}


function render(element, container) {
    wipRoot = {
        dom: container, 
        props: {
            children: [element],
        }
    }
    alternate: currentRoot;
   
}

let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

        shouldYield = deadline.timeRemaining() < 1;
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
    let index = 0;
    let prevSibling = null;

    while (index < elements.length) {
        const element = elements[index];

        const newFiber = {
            type: element.type,
            props: element.props, 
            parent: fiber,
            dom: null,
        }
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibiling = newFiber;
        index++;
    }
    
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
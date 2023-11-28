function render(element, container) {
    const dom = element.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type)

    const isProperty = key => key !== "children"
    Object.keys(element.props).filter(isProperty).forEach(name => {
        dom[name] = element.props[name]
    })

    // problem: this will create a recursive call, which will block the main thread
    element.props.children.forEach(child => render(child, dom))

    container.appendChild(dom);
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
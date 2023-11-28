function render(element, container) {
    const dom = document.createElement(element.type);

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

const node = document.createElement(element.type)
node["title"] = element.props.title;

const text = document.createTextNode("")
text["nodeValue"] = element.props.children;

node.appendChild(text);
container.appendChild(node)

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
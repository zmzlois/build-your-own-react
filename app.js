const element = {
    type: "h1",
    props: {
        title: "foo",
        children: "Hello"
    }
}

const container = document.getElementById("root");
console.log(container)

const node = document.createElement(element.type)
node["title"] = element.props.title;

const text = document.createTextNode("")
text["nodeValue"] = element.props.children;

node.appendChild(text);
container.appendChild(node)

function createElement(type, props, ...children) {
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
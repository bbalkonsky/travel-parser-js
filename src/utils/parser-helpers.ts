import { Element, Node } from 'domhandler';

export default class Parser {
    // public static getAllChildrenByAttribute(elList, attr, attrName) {
    //     const results = [];
    //
    //     elList.forEach(el => {
    //         if (el.type === 'tag' && el.name === attr && el.attribs?.class && el.attribs.class.includes(attrName)) {
    //             results.push(el);
    //         }
    //         if (el.children) {
    //             results.push(Parser.getAllChildrenByAttribute(el.children, attr, attrName));
    //         }
    //     });
    //
    //     return results.flat();
    // }
    //
    // public static getContent(block) {
    //     let content = '';
    //     // const blockChildren = Parser.flatBlock(block);
    //
    //     block.forEach(el => {
    //         if (el.type === 'text') {
    //             content += el.data;
    //         }
    //     });
    //
    //     return content;
    // }
    //
    // public static getPostLink(block) {
    //     if (block.name === 'a' && block.attribs?.href) {
    //         return block.attribs?.href;
    //     } else {
    //         const len = block.children?.length;
    //         for (let i = 0; i < len; i++) {
    //             const res = Parser.getPostLink(block.children[i]);
    //             if (res) {
    //                 return res;
    //             }
    //         }
    //         return null;
    //     }
    // }
}

export function flatBlock(block: (Node | Element)[]): Element[] {
    const results = [];

    block.forEach(el => {
        results.push(el);
        if ('children' in el) {
            results.push(flatBlock(el.children));
        }
    });

    return results.flat();
}

export function getBlocksByAttr(
    container: Element[],
    tagName: string,
    attrName: string,
    type = 'tag'
): Element[] {
    return container.filter(el => {
        return (
            el.type === type
            && el.name === tagName
            && el.attribs?.class?.split(' ').includes(attrName)
        )
    });
}

export function getFirstBlockByTagAndAttr(
    container: Element[],
    tagName: string,
    attrName: string,
    type = 'tag'
): Element {
    return container.find(el => {
        return (
            el.type === type
            && el.name === tagName
            && el.attribs?.class?.split(' ').includes(attrName)
        )
    });
}

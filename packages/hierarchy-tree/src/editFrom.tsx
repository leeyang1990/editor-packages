import React, { useRef, useState, useEffect } from "react";
import HierarchyTree, { TreeNode } from ".";
import * as KeyCode from './utils/keycode';
const EditForm: React.FC<any> = ((props) => {
    const treenode: TreeNode = props.treenode;
    const [text, setText] = useState(treenode.text);
    const ref = useRef(undefined);

    useEffect(() => {
        ref.current.focus();
    }, [ref]);
    function onKeyDown(event) {
        event.stopPropagation();
        const oldValue = treenode.text
        switch (event.key) {
            case KeyCode.Enter:
                treenode.text = text;
                treenode.edit(false, oldValue, text);
                break;
            case KeyCode.Escape:
                treenode.edit(false, oldValue);
                break;
            default:
        }
    }
    function onChange(event) {
        const text = event.target.value;
        setText(text);
    }
    function onFocus() {
        //全选文字
        ref.current.select();
    }
    function onBlur() {
        const oldValue = treenode.text;
        treenode.text = text;
        treenode.edit(false,oldValue,text)
    }
    return (<input
        ref={ref}
        style={{ zIndex: 10 }}
        tabIndex={1}
        onClick={event => event.stopPropagation}
        onKeyDown={onKeyDown}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        value={text} />);
})

export default EditForm;

import { useState } from 'react';

function Togglable(props) {
    const [visible, setVisible] = useState(true);

    const hideWhenVisible = {display: visible ? '' : 'none'};
    const showWhenVisible = {display: visible ? 'none': '' };

    const toggleVisibility = () => {
        setVisible(!visible);
        props.setBlogsVisible(!props.blogsVisible);
    }

    return (
        <div>
            <div style={hideWhenVisible} >
                <button onClick={toggleVisibility}>{props.buttonLabel}</button>
            </div>
            <div style={showWhenVisible}>
                {props.children}
                <button onClick={toggleVisibility}>cancel</button>
            </div>
        </div>
    )
};

export default Togglable;
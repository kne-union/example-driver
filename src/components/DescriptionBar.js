import React from 'react';

const DescriptionBar = ({title, description, codeOpen, onToggle}) => {
    return (<div className="example-driver-des">
        <span className="example-driver-title">{title}</span>
        <div dangerouslySetInnerHTML={{__html: description}}/>
        <span className="example-driver-switch" onClick={onToggle}>
            {codeOpen ? '</>' : '< >'}
        </span>
    </div>);
};

export default DescriptionBar;

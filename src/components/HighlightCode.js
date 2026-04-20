import React from 'react';
import Highlight, {Prism} from "prism-react-renderer";
import theme from '../theme';

const HighlightCode = ({code}) => {
    return <Highlight
        Prism={Prism}
        code={code}
        theme={theme}
        language="jsx">
        {({tokens, getLineProps, getTokenProps}) => (<>
            {tokens.map((line, i) => (<div {...getLineProps({line, key: i})}>
                {line.map((token, key) => (<span {...getTokenProps({token, key})} />))}
            </div>))}
        </>)}
    </Highlight>
};

export default HighlightCode;

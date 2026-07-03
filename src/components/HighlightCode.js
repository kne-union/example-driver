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
            {tokens.map((line, i) => {
                const {key, ...lineProps} = getLineProps({line, key: i});
                return (
                    <div key={key} {...lineProps}>
                        {line.map((token, tokenIndex) => {
                            const {key: tokenKey, ...tokenProps} = getTokenProps({token, key: tokenIndex});
                            return <span key={tokenKey} {...tokenProps} />;
                        })}
                    </div>
                );
            })}
        </>)}
    </Highlight>
};

export default HighlightCode;

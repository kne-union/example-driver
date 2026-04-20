import React from 'react';
import {useIntl} from '@kne/react-intl';
import HighlightCode from './HighlightCode';
import ErrorComponent from './ErrorComponent';
import CodeEditor from '@monaco-editor/react';

const generateImportCode = (scope) => {
    return scope.map(({name, packageName, importStatement}) =>
        importStatement ? importStatement : (name ? `import * as ${name} from '${packageName}';` : `import '${packageName}';`)
    ).join('\n');
};

const CodePanelInner = ({code, scope, error, editable, onChange}) => {
    const {formatMessage} = useIntl();
    return (<div className="example-driver-code">
        <div className="example-driver-code-import">
            <HighlightCode code={`import React from 'react';\n${generateImportCode(scope)}\n`}/>
        </div>
        <CodeEditor height="800px" defaultLanguage="javascript" defaultValue={code} onChange={onChange}
                    loading={formatMessage({id: 'CodePanel.loading'})} options={{readOnly: !editable}}/>
        {error && <ErrorComponent error={error.message}/>}
    </div>);
};

export default CodePanelInner;

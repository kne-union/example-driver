import React, {useState} from 'react';
import {useIntl} from '@kne/react-intl';
import withLocale from '../withLocale';
import DescriptionBar from './DescriptionBar';
import CodePanel from './CodePanel';

const MiniCodeInner = ({code, qrcodeUrl, scope, title, description}) => {
    const {formatMessage} = useIntl();
    const [codeOpen, setCodeOpen] = useState(false);
    return <>
        <div className="example-driver-preview">
            <div className="example-driver-runner">
                <div className="example-driver-mini-code"><img src={qrcodeUrl} alt={formatMessage({id: 'MiniCode.example'})}/></div>
                <div className="example-driver-mini-title">{formatMessage({id: 'MiniCode.scanQrcode'})}</div>
            </div>
        </div>
        <DescriptionBar title={title} description={description} codeOpen={codeOpen}
                        onToggle={() => setCodeOpen(!codeOpen)}/>
        {codeOpen && <CodePanel code={code} scope={scope} editable={false}/>}
    </>;
};

const MiniCode = withLocale(MiniCodeInner);

export default MiniCode;

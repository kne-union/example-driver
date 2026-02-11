const {default: ExampleDriver} = _ExampleDriver;

const code = `
const { Button, Card, Space, Switch, Tag } = antd;
const { useState } = React;

// 自定义上下文组件
const CustomContext = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const colors = {
    light: { bg: '#fff', color: '#000', border: '#d9d9d9' },
    dark: { bg: '#1a1a1a', color: '#fff', border: '#434343' }
  };
  const style = {
    padding: '12px',
    background: colors[theme].bg,
    color: colors[theme].color,
    borderRadius: '4px'
  };

  return (
    <div style={style}>
      <Space style={{ marginBottom: '12px' }}>
        <Switch
          checked={theme === 'dark'}
          onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          checkedChildren="🌙"
          unCheckedChildren="☀️"
        />
        <Tag color={theme === 'dark' ? 'blue' : 'orange'}>
          {theme === 'dark' ? '暗色主题' : '亮色主题'}
        </Tag>
      </Space>
      {children}
    </div>
  );
};

const Component = () => {
  return (
    <CustomContext>
      <p>这是上下文包裹的内容，会根据主题自动改变颜色。</p>
    </CustomContext>
  );
};

render(<Component />);
`;

render(<ExampleDriver list={[{
    title: '自定义上下文',
    description: '通过 contextComponent 属性可以为示例代码提供自定义的上下文组件',
    code,
    contextComponent: ({children}) => (<div style={{padding: '12px', background: '#f5f5f5', borderRadius: '4px'}}>
        {children}
    </div>),
    scope: [{
        name: 'antd', packageName: 'antd', component: antd
    }]
}]}/>);

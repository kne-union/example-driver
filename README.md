
# example-driver


### 描述

用于在线展示和编辑React组件


### 安装

```shell
npm i --save @kne/example-driver
```


### 概述

@kne/example-driver 是一个用于在线展示和编辑 React 组件的工具库，特别适合用于组件库文档、教程演示和技术文档中。它提供了实时代码预览和编辑功能，让用户可以直接在浏览器中查看和修改组件代码，无需搭建完整的开发环境。

核心特性包括实时代码编辑、即时代码预览、语法高亮显示、错误边界处理和灵活的布局控制。支持两种展示模式：LiveCode 模式提供完整的在线编辑和实时预览能力，MiniCode 模式则通过二维码引导用户在移动端查看示例。内置 Monaco Editor 提供专业的代码编辑体验，使用 Prism 实现代码语法高亮，并通过 Debounce 优化性能，避免频繁重新渲染。

适用于组件库文档网站、在线教程和培训、技术博客和文档、以及 React 组件展示平台。通过动态加载和实时编译，让文档中的示例代码真正"活"起来，用户可以直接修改代码并立即看到效果，大大提升了学习效率和用户体验。

技术亮点方面，项目采用 Babel Standalone 实现浏览器端的代码编译，支持 ES2015 和 React 预设，无需后端转换。错误边界机制确保代码错误不会影响整个页面，提供友好的错误提示。支持自定义上下文组件，方便在不同场景中嵌入示例代码。Monaco Editor 配置暴露给外部，允许深度定制编辑器行为。响应式布局设计，支持单列和双列模式，适应不同屏幕尺寸。


### 示例(全屏)

#### 示例代码

- 基础使用
- 展示 ExampleDriver 组件的基本用法，包含简单的计数器示例
- _ExampleDriver(@kne/current-lib_example-driver)[import * as _ExampleDriver from "@kne/example-driver"],(@kne/current-lib_example-driver/dist/index.css),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const {default: ExampleDriver} = _ExampleDriver;

// 示例代码字符串
const code = `
const { Button, Card, Space } = antd;
const { useState } = React;

const Component = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: '12px' }}>
      <Card>
        <h4 style={{ marginBottom: '12px' }}>计数器示例</h4>
        <Space>
          <Button onClick={() => setCount(count - 1)}>-</Button>
          <span style={{ fontSize: '18px' }}>{count}</span>
          <Button onClick={() => setCount(count + 1)}>+</Button>
          <Button onClick={() => setCount(0)} danger>重置</Button>
        </Space>
      </Card>
    </div>
  );
};

render(<Component />);
`;

render(<ExampleDriver list={[{
    title: '基本使用', description: 'ExampleDriver 的基础用法，展示简单的计数器示例', code, scope: [{
        name: 'antd', packageName: 'antd', component: antd
    }]
}]}/>);

```

- LiveCode 模式
- 实时代码编辑和预览模式，可以直接在浏览器中修改代码并查看效果
- _ExampleDriver(@kne/current-lib_example-driver)[import * as _ExampleDriver from "@kne/example-driver"],(@kne/current-lib_example-driver/dist/index.css),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const {default: ExampleDriver} = _ExampleDriver;

const code = `
const { Button, Input, List, Space, Tag } = antd;
const { useState } = React;

const Component = () => {
  const [text, setText] = useState('');
  const [items, setItems] = useState(['学习 React', '编写组件']);

  const addItem = () => {
    if (text.trim()) {
      setItems([...items, text.trim()]);
      setText('');
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '12px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入事项..."
            onPressEnter={addItem}
          />
          <Button type="primary" onClick={addItem}>添加</Button>
        </Space.Compact>
        <List
          size="small"
          dataSource={items}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button type="link" size="small" onClick={() => removeItem(index)}>
                  删除
                </Button>
              ]}
            >
              <Tag>{item}</Tag>
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
};

render(<Component />);
`;

render(<ExampleDriver list={[{
    title: 'LiveCode 模式', description: '支持实时代码编辑，可以在编辑器中修改代码并实时预览效果', code, scope: [{
        name: 'antd', packageName: 'antd', component: antd
    }]
}]}/>);

```

- MiniCode 模式
- 二维码预览模式，适用于移动端场景，通过二维码引导用户查看示例
- _ExampleDriver(@kne/current-lib_example-driver)[import * as _ExampleDriver from "@kne/example-driver"],(@kne/current-lib_example-driver/dist/index.css),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const {default: ExampleDriver} = _ExampleDriver;

const code = `
const { Form, Input, Button, Space } = antd;
const { useState } = React;

const Component = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const onFinish = (values) => {
    setData([...data, values]);
    form.resetFields();
  };

  return (
    <div style={{ padding: '12px' }}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input placeholder="输入姓名" />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="输入邮箱" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {data.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <h4>已提交数据：</h4>
          {data.map((item, index) => (
            <p key={index}>{item.name} - {item.email}</p>
          ))}
        </div>
      )}
    </div>
  );
};

render(<Component />);
`;

render(<ExampleDriver list={[{
    title: 'MiniCode 模式',
    description: '二维码预览模式，通过 qrcodeUrl 属性添加二维码引导用户查看',
    code,
    qrcodeUrl: 'https://www.kne-union.top/static-data/mini-core/0.jpg',
    scope: [{
        name: 'antd', packageName: 'antd', component: antd
    }]
}]}/>);

```

- 自定义上下文
- 使用 contextComponent 属性自定义示例的上下文组件
- _ExampleDriver(@kne/current-lib_example-driver)[import * as _ExampleDriver from "@kne/example-driver"],(@kne/current-lib_example-driver/dist/index.css),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
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

```

- 双列布局
- 使用 isFull 属性控制布局，默认双列展示多个示例
- _ExampleDriver(@kne/current-lib_example-driver)[import * as _ExampleDriver from "@kne/example-driver"],(@kne/current-lib_example-driver/dist/index.css),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const {default: ExampleDriver} = _ExampleDriver;

const example1 = `
const { Button, Card } = antd;

const Component = () => {
  return (
    <Card size="small" title="示例 1">
      <Button type="primary">按钮 A</Button>
      <Button style={{ marginLeft: '8px' }}>按钮 B</Button>
    </Card>
  );
};

render(<Component />);
`;

const example2 = `
const { Input, Card } = antd;

const Component = () => {
  return (
    <Card size="small" title="示例 2">
      <Input placeholder="输入内容..." />
    </Card>
  );
};

render(<Component />);
`;

const example3 = `
const { Select, Card } = antd;
const { Option } = Select;

const Component = () => {
  return (
    <Card size="small" title="示例 3">
      <Select placeholder="请选择" style={{ width: '100%' }}>
        <Option value="1">选项 1</Option>
        <Option value="2">选项 2</Option>
      </Select>
    </Card>
  );
};

render(<Component />);
`;

const example4 = `
const { Switch, Card } = antd;

const Component = () => {
  return (
    <Card size="small" title="示例 4">
      <Switch />
    </Card>
  );
};

render(<Component />);
`;

// 默认双列布局
render(<ExampleDriver list={[{
    title: '按钮示例',
    description: '展示按钮组件',
    code: example1,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}, {
    title: '输入框示例',
    description: '展示输入框组件',
    code: example2,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}, {
    title: '下拉框示例',
    description: '展示下拉选择组件',
    code: example3,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}, {
    title: '开关示例',
    description: '展示开关组件',
    code: example4,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}]}/>);

```


### API

### ExampleDriver
用于展示和编辑 React 组件示例的主组件，支持 LiveCode 和 MiniCode 两种展示模式。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| list | array | 是 | - | 示例列表数组，每个元素代表一个示例 |
| isFull | boolean | 否 | false | 是否全宽显示，true 时单列显示，false 时双列显示 |
| contextComponent | React Component | 否 | - | 自定义上下文组件，用于包裹渲染的代码内容 |
| className | string | 否 | - | 自定义 CSS 类名 |
| ...props | object | 否 | - | 其他 HTML div 元素的属性 |

#### list 数组项属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 示例代码字符串 |
| scope | array | 是 | - | 作用域数组，包含组件和包信息 |
| title | string | 是 | - | 示例标题 |
| description | string | 是 | - | 示例描述，支持 HTML 格式 |
| qrcodeUrl | string | 否 | - | 二维码图片 URL，传入此项则使用 MiniCode 模式 |
| contextComponent | React Component | 否 | - | 单个示例的自定义上下文组件 |

#### scope 数组项属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| component | React Component | 是 | - | 要暴露给示例代码的组件 |
| name | string | 是 | - | 组件名称，在代码中使用 |
| packageName | string | 否 | - | 包名，用于生成导入语句 |
| importStatement | string | 否 | - | 自定义导入语句，覆盖自动生成的导入 |

### LiveCode
提供实时代码编辑和预览功能的子组件（通过 ExampleDriver 自动使用）。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 要展示的代码 |
| scope | array | 是 | - | 作用域数组 |
| title | string | 是 | - | 标题 |
| description | string | 是 | - | 描述 |
| contextComponent | React Component | 否 | - | 上下文组件 |

### MiniCode
显示二维码预览的只读模式子组件（通过 ExampleDriver 自动使用）。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 示例代码 |
| qrcodeUrl | string | 是 | - | 二维码图片地址 |
| scope | array | 是 | - | 作用域数组 |
| title | string | 是 | - | 标题 |
| description | string | 是 | - | 描述 |

### config
Monaco Editor 的配置对象，用于自定义编辑器行为。

#### 方法说明
| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| config | options: object | void | 配置 Monaco Editor 的加载选项，如模块路径等 |


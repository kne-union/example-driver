
# example-driver


### 描述

用于在线展示和编辑React组件


### 安装

```shell
npm i --save @kne/example-driver
```


### 概述

### 项目概述

@kne/example-driver 是一个用于在线展示和编辑 React 组件的工具库，特别适合用于组件库文档、教程演示和技术文档中。它提供了实时代码预览和编辑功能，让用户可以直接在浏览器中查看和修改组件代码，无需搭建完整的开发环境。

### 主要特性

#### 实时编辑与预览

- **LiveCode 模式**：提供完整的在线编辑和实时预览能力，内置 Monaco Editor 提供专业的代码编辑体验
- **MiniCode 模式**：通过二维码引导用户在移动端查看示例，适用于移动端场景
- **语法高亮**：使用 Prism 实现代码语法高亮
- **Debounce 优化**：避免频繁重新渲染，提升编辑体验

#### 性能与加载

- **视口懒加载**：组件进入视口时才挂载渲染，离开视口自动卸载并保留占位高度，减少页面初始负载
- **懒编译机制**：使用 Babel Standalone 实现浏览器端代码编译，支持 ES2015 和 React 预设，无需后端转换；采用 LRU 缓存和编译队列优化编译性能
- **优先级调度**：首次可见时优先编译，后续编辑变更走 debounce 500ms 延迟编译

#### 错误处理与布局

- **错误边界**：代码错误不会影响整个页面，提供友好的错误提示
- **响应式布局**：支持单列（全宽）和双列模式，自动适应不同屏幕尺寸
- **自定义上下文**：支持全局和单个示例级别的自定义上下文组件，方便在不同场景中嵌入示例代码
- **编辑器可配置**：Monaco Editor 配置暴露给外部，允许深度定制编辑器行为（如自定义 CDN 路径）

#### 国际化

- 内置中文（zh-CN）和英文（en-US）语言支持，自动适配编辑器加载提示、扫码提示等文案

### 使用场景

- **组件库文档网站**：在线展示组件示例，支持用户直接修改代码查看效果
- **在线教程和培训**：让学员在浏览器中即时实践代码
- **技术博客和文档**：嵌入可交互的代码示例，提升阅读体验
- **React 组件展示平台**：通过动态加载和实时编译，让文档中的示例代码真正"活"起来


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

- 高度稳定性测试
- 通过 state 控制组件挂载与卸载，验证视口检测和占位高度的一致性
- _ExampleDriver(@kne/current-lib_example-driver)[import * as _ExampleDriver from "@kne/example-driver"],(@kne/current-lib_example-driver/dist/index.css),antd(antd),remoteLoader(@kne/remote-loader)

```jsx
const {default: ExampleDriver} = _ExampleDriver;
const {useState} = React;
const {Button, Card, Space, Switch, Tag} = antd;

const code = `
const { Button, Card, Space } = antd;
const { useState } = React;

const Component = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: '20px' }}>
      <Card title="高度测试组件" style={{ minHeight: '200px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ fontSize: '32px', textAlign: 'center', padding: '20px 0' }}>
            {count}
          </div>
          <Space>
            <Button onClick={() => setCount(count - 1)}>-</Button>
            <Button onClick={() => setCount(count + 1)}>+</Button>
            <Button onClick={() => setCount(0)} danger>重置</Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

render(<Component />);
`;

const HeightTestExample = () => {
    const [mounted, setMounted] = useState(true);

    const list = [{
        title: '高度稳定性测试',
        description: '通过开关控制组件挂载/卸载，观察卸载后占位高度与渲染高度是否一致',
        code,
        mounted,
        scope: [{
            name: 'antd', packageName: 'antd', component: antd
        }]
    }];

    return (
        <Space direction="vertical" style={{width: '100%'}} size="large">
            <Card size="small">
                <Space>
                    <Switch checked={mounted} onChange={setMounted} checkedChildren="挂载" unCheckedChildren="卸载"/>
                    <Tag color={mounted ? 'green' : 'red'}>{mounted ? '已挂载' : '已卸载'}</Tag>
                    <Button size="small" onClick={() => {
                        setMounted(false);
                        setTimeout(() => setMounted(true), 100);
                    }}>快速切换</Button>
                    <Button size="small" onClick={() => {
                        for (let i = 0; i < 3; i++) {
                            setTimeout(() => setMounted(prev => !prev), i * 200);
                        }
                    }}>连续切换3次</Button>
                    <span style={{color: '#999', fontSize: 12}}>
                        切换后观察页面是否抖动，占位高度是否与渲染高度一致
                    </span>
                </Space>
            </Card>
            <ExampleDriver isFull list={list}/>
        </Space>
    );
};

render(<HeightTestExample/>);

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
| isFull | boolean | 否 | false | 是否全宽显示，true 时单列显示，false 时双列显示。当 list 仅有一项时自动为 true |
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
| contextComponent | React Component | 否 | - | 单个示例的自定义上下文组件，优先级高于 ExampleDriver 的 contextComponent |
| mounted | boolean | 否 | - | 控制组件是否挂载。传入时由该值决定；不传时由视口检测决定是否挂载 |
| useInView | boolean | 否 | true | 是否启用视口检测懒加载，仅在 mounted 未传入时生效。设为 false 则组件始终挂载 |

#### scope 数组项属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| component | any | 否 | - | 要暴露给示例代码的组件，不传时仅生成 import 语句（如 CSS 导入） |
| name | string | 否 | - | 组件名称，在代码中使用。component 为真值且 name 为非空字符串时才注入到示例作用域 |
| packageName | string | 否 | - | 包名，用于生成导入语句 |
| importStatement | string | 否 | - | 自定义导入语句，提供后不再自动生成。优先级最高 |

### LiveCode
提供实时代码编辑和预览功能的子组件（通过 ExampleDriver 自动使用）。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 否 | '' | 要展示的代码 |
| scope | array | 否 | [] | 作用域数组 |
| title | string | 是 | - | 标题 |
| description | string | 是 | - | 描述，支持 HTML |
| contextComponent | React Component | 否 | - | 上下文组件，包裹渲染的示例内容 |
| mounted | boolean | 否 | - | 控制组件是否挂载。传入时由该值决定；不传时由视口检测决定 |
| useInView | boolean | 否 | true | 是否启用视口检测懒加载，仅在 mounted 未传入时生效 |

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

### CodePanel
代码编辑面板子组件，用于显示和编辑代码。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 代码字符串 |
| scope | array | 是 | - | 作用域数组，用于生成 import 语句 |
| error | Error \| null | 否 | - | 编译错误对象 |
| editable | boolean | 是 | - | 代码是否可编辑 |
| onChange | function | 否 | - | 代码变更回调 `(newCode: string) => void` |

### DescriptionBar
示例描述栏子组件，显示标题、描述和代码面板切换按钮。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| title | string | 是 | - | 示例标题 |
| description | string | 是 | - | 示例描述，支持 HTML |
| codeOpen | boolean | 是 | - | 代码面板是否打开 |
| onToggle | function | 是 | - | 切换代码面板的回调 |

### HighlightCode
代码高亮展示子组件，使用 Prism 实现语法高亮。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 要高亮显示的代码字符串 |

### ErrorComponent
错误展示子组件，用于显示编译或运行时错误。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| error | string \| Error | 否 | - | 错误信息，字符串直接显示，Error 对象显示 .message |

### Hooks

#### useInView
视口检测 Hook，用于判断元素是否进入视口，实现懒加载。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| ref | React.RefObject | 是 | - | 要监听的 DOM 容器 ref |
| options | object | 否 | - | 配置选项 |
| options.disabled | boolean | 否 | false | 是否禁用视口检测 |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| shouldRender | boolean | 元素是否在视口内 |
| heightRef | React.MutableRefObject\<number\> | 记录元素最后一次渲染高度的 ref |

内部使用全局共享的 IntersectionObserver 实例，rootMargin 为 200px 预加载，离开视口且 intersectionRatio 为 0 时卸载并保留占位高度。SSR 环境或浏览器不支持 IntersectionObserver 时直接返回 shouldRender 为 true。

#### useLazyCompile
懒编译 Hook，使用 Babel Standalone 在浏览器端编译代码，支持缓存和优先级调度。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 要编译的代码字符串 |
| shouldCompile | boolean | 是 | - | 是否应该编译，通常关联 useInView 的 shouldRender |

| 返回值 | 类型 | 说明 |
|--------|------|------|
| compiledCode | string \| null | 编译后的代码，未编译时为 null |
| error | Error \| null | 编译错误，无错误时为 null |

内部采用 LRU 缓存（上限 200 条），编译队列最大并发为 1。首次可见时作为优先任务立即编译，后续编辑变更走 debounce 500ms。非优先任务使用 requestIdleCallback 延迟执行。

#### useReactRoot
React Root 管理 Hook，使用 react-dom/client 的 createRoot API 管理组件挂载/卸载。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| containerRef | React.RefObject | 是 | - | 渲染容器 DOM ref |
| shouldRender | boolean | 是 | - | 是否应该渲染 |
| renderJsx | ReactNode \| null | 是 | - | 要渲染的 React 元素 |
| heightRef | React.MutableRefObject\<number\> | 是 | - | 用于记录/恢复高度的 ref |

卸载时将 runner 替换为 placeholder 并保留上次高度，使用 ResizeObserver 监控高度变化。组件卸载时自动清理。

### config
Monaco Editor 的配置方法，用于自定义编辑器加载行为。

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| config | options: { paths?: Record\<string, string\>, [key: string]: any } | void | 配置 Monaco Editor 的加载选项，最常用场景是通过 paths 自定义 Monaco 的 CDN 路径 |

### 国际化
内置中文（zh-CN）和英文（en-US）语言支持，默认语言为 zh-CN。

| Key | zh-CN | en-US |
|-----|-------|-------|
| CodePanel.loading | 正在加载代码编辑器... | Loading code editor... |
| MiniCode.example | 示例 | Example |
| MiniCode.scanQrcode | 请扫描二维码查看示例程序 | Please scan the QR code to view the example |

